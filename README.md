# About

This module exposes a Client class used for proving a typesafe way to communicate to an API, with runtime validation to also provide confidence on the interfaces you are using and remove surprises.

This basically does one thing: Makes sure the communication with the API is just as expected.

# Getting started

First, install the module:

```bash
npm install io-ts-api-client -S
```

OR

```bash
yarn add io-ts-api-client
```

then, create a client in a folder of your preference:

```typescript
const client = new Client({
  base: new URL('http://example.com'),
  throwErrors: true, // Throw validation errors.
  strictTypes: true, // Strip and validates extra properties.
  debug: true, // log errors and other messages to the console.
  resources: {
    // Declare your resources.
    someResource: new Resource({
      // Define the operations of each resoruce.
      operations: {
        doSomething: new Operation({
          method: HttpMethod.GET,
          options: {} as {
            someOption: 'foo' | 'bar';
          },
          url: (url, { someOption }) => {
            addPathToUrl(url, '/somePath/' + someOption);
            return url;
          },
          payloadModel: new Model(...), // Model to use to validate the payload.
          payloadConstructor(options) { // use options to construct a payload
            return {...}
          },
          mock(options) { // If defined, the response will be mocked and not validated.
            return {
              ...
            }
          },
          headers(options) { // headers to send with the request.
            return {...}
          },
          responses: [
            new ApiResponse({
              status: HttpStatus.OK,
              model: new Model({
                name: 'Some model name',
                schema: t.interface({
                  foo: t.literal('bar'),
                }),
              }),
            }),
          ],
        }),
      },
    }),
  },
});
```

After declaring the client, you need to expose its API to use it in the application.

```typescript
export const API = client.getApi();
```

With the API of the client created, your resources and operations will map like so:

```typescript
API.someResource.doSomething({
  someOption: 'foo',
});
```

Everything will be properly typed. jsDocs persist and you can rename and jump to references :).

Also, one important thing to note is that the requests will fail if there is an unexpected response.

That means that an internal server error will not fail the requests when expected. Instead, you need to use type guards in the response status.

for example, lets take the client from before, and lets say it has a response declared for the internal server error:

```typescript
new ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  model: new Model({
    name: 'API 500 resource',
    schema: t.interface({
      reason: t.string,
    }),
  }),
});
```

then, let's call the method again:

```typescript
const res = await API.someResource.doSomething({
  someOption: 'foo',
});

// at this point. "res" might be any of the declared responses, so we need to check it.

if (res.status == HttpStatus.INTERNAL_SERVER_ERROR) {
  // type guard
  showToast(res.data.reason); // res.data will be { reason: string }
}

if (res.status == HttpStatus.OK) {
  console.log(res.data); // res.data will be { foo: 'bar' }
}
```

# Extra Features

## Global responses

To avoid repetition, you can declare responses that any operation might return.

This is useful for 404, 500, and other generic responses.

```typescript
const client = new Client({
  base: 'http://example.com',
  globalResponses: [
    new ApiResponse({
      //...
    }),
  ],
});
```

## Response body alias

To make it better to read with APIs based on the JSON API model. You can use `res.body.data` instead of `res.data.data`.
