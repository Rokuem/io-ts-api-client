import { expectTypeOf } from "expect-type";
import { Client } from "./Client";
import { testConfig } from "../../testConfig";
import { Resource } from "../Resource/Resource";
import { Operation } from "../Operation/Operation";
import { HttpMethod } from "../../constants/httpMethod";
import { addPathToUrl } from "../../helpers/resolveUrl";
import { ApiResponse } from "../ApiResponse/ApiResponse";
import { HttpStatus } from "../../constants/HttpStatus";
import { t } from "../t/t";
import { Model, ModelInterface } from "../Model/Model";
import mockedAxios from "../../../__mocks__/axios";

const okSampleResponse = new ApiResponse({
  status: HttpStatus.OK,
  model: new Model({
    name: "API sample resource",
    schema: t.interface({
      ok: t.boolean,
    }),
  }),
});

describe("A Client", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const client = new Client({
    base: () => new URL(testConfig.testServerUrl),
    globalResponses: [
      new ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        model: new Model({
          name: "API 500 resource",
          schema: t.interface({
            ok: t.literal(false),
          }),
        }),
      }),
    ],
    resources: {
      samples: new Resource({
        basePath: "/samples",
        operations: {
          withMock: new Operation({
            url: (url) => url,
            async mock() {
              return {
                status: 200,
                data: {
                  ok: false,
                },
              };
            },
            method: HttpMethod.GET,
            responses: [okSampleResponse],
          }),
          getOk: new Operation({
            method: HttpMethod.GET,
            url(url) {
              addPathToUrl(url, "/sample/ok");
              return url;
            },
            responses: [okSampleResponse],
          }),
          getSample: new Operation({
            method: HttpMethod.GET,
            options: {} as {
              sampleType: "ok" | "accepted";
            },
            url: (url, { sampleType }) => {
              addPathToUrl(url, "/sample/" + sampleType);
              return url;
            },
            responses: [
              okSampleResponse,
              new ApiResponse({
                status: HttpStatus.ACCEPTED,
                model: new Model({
                  name: "API sample resource",
                  schema: t.interface({
                    accepted: t.boolean,
                  }),
                }),
              }),
            ],
          }),
        },
      }),
      extraResource: new Resource({
        operations: {
          getOk: new Operation({
            method: HttpMethod.GET,
            url(url) {
              addPathToUrl(url, "/sample/ok");
              return url;
            },
            responses: [okSampleResponse],
          }),
        },
      }),
    },
  });

  test("Should match the snapshot", () => {
    expect(client).toMatchSnapshot("sample client");
  });

  describe("Its API", () => {
    const API = client.getApi();

    describe("Should convert its operations to an api", () => {
      test("The API should have a key for each resource", () => {
        const resource = "samples";
        expect(API).toHaveProperty(resource);
        expectTypeOf(API).toHaveProperty(resource);
      });

      test("Each resource should have an operation", () => {
        const operation = "getSample";
        expect(API.samples).toHaveProperty(operation);
        expectTypeOf(API.samples).toHaveProperty(operation);
      });

      const expected = {
        sampleType: "" as "ok" | "accepted",
      } as const;
      test("Operations with options should expect it as a parameter", () => {
        expectTypeOf(API.samples.getSample).parameters.toMatchTypeOf([
          expected as typeof expected | undefined,
        ]);
      });

      test("Operations without options should not expect anything as a parameter", () => {
        expectTypeOf(API.samples.getOk).parameters.toMatchTypeOf([] as const);
      });
    });

    describe("When executing a mocked operation", () => {
      const request = API.samples.withMock();
      test("The response should match the mock", async () => {
        const response = await request;
        expect(response).toEqual(
          expect.objectContaining(
            await client.resources.samples.operations.withMock.mock?.()
          )
        );
      });

      test("The Mock should have the correct type", async () => {
        const response = await request;
        expectTypeOf(response.data).toMatchTypeOf(
          {} as ModelInterface<
            typeof client["resources"]["samples"]["operations"]["withMock"]["responses"][0]["model"]
          >
        );
      });

      test.skip("The mock should be ignored if it returns false", async () => {
        client.resources.samples.operations.getOk.mock = () =>
          Promise.resolve(false) as any;

        mockedAxios.nextResponse = {
          status: 200,
          data: {
            ok: true,
          },
        };

        const res = await API.samples.getOk();

        expect(res.data).toEqual({
          ok: true,
        });
      });
    });

    describe("When executing an operation", () => {
      test("It should have the correct URL", async () => {
        mockedAxios.nextResponse = {
          status: 200,
          data: {
            ok: true,
          },
        };

        const spy = jest.spyOn(mockedAxios, "request");

        await API.samples.getOk();

        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            url: (client.resources.samples.operations.getOk.url as any)(
              new URL(
                testConfig.testServerUrl + client.resources.samples.basePath
              )
            ).href,
          })
        );
      });

      test("It should consider global headers", async () => {
        client.globalHeaders = {
          Foo: "bar",
        };

        const existingHeaders = {
          Foo2: "bar2",
        };

        client.resources.samples.operations.getOk.headers = () =>
          existingHeaders;

        const spy = jest.spyOn(mockedAxios, "request");

        mockedAxios.nextResponse = {
          status: 200,
          data: {
            ok: true,
          },
        };

        await API.samples.getOk();

        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: { ...client.globalHeaders, ...existingHeaders },
          })
        );

        client.globalHeaders = (resource) => ({
          Resource: resource,
        });

        await API.samples.getOk();

        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: {
              Resource: "samples",
              ...existingHeaders,
            },
          })
        );
      });

      describe("When the response status is not declared", () => {
        beforeEach(() => {
          mockedAxios.nextResponse = {
            status: 333,
            data: {
              ok: true,
            },
          };
        });

        test("The operation should throw and error", async () => {
          try {
            await API.samples.getOk();
            fail();
          } catch (error) {
            expect(error).toMatchSnapshot("Missing Model Error");
          }
        });
      });
    });
    describe("When executing a operation with response data", () => {
      test("The response.data should contain the expected model", async () => {
        mockedAxios.nextResponse = {
          status: 200,
          data: {
            ok: true,
          },
        };

        const request = API.samples.getOk();

        const response = await request;

        expect(response.data).toEqual({
          ok: true,
        });
        expectTypeOf(response.data).toMatchTypeOf({
          ok: true,
        });
      });

      test("The response status should be OK and match in both value and type", async () => {
        const response = await API.samples.withMock();

        expect(response.status).toBe(HttpStatus.OK);
        expectTypeOf(response.status).toMatchTypeOf(HttpStatus.OK);
      });

      describe("When executing an operation with multiple responses", () => {
        test("The response status should serve as a type guard", async () => {
          mockedAxios.nextResponse = {
            status: 200,
            data: {
              sampleType: "ok",
            },
          };
          const request = API.samples.getSample({
            sampleType: "ok",
          });

          const response = await request;

          if (response.status === HttpStatus.OK) {
            expectTypeOf(response.data).toMatchTypeOf({
              ok: true,
            });
          }

          if (response.status === HttpStatus.ACCEPTED) {
            expectTypeOf(response.data).toMatchTypeOf({
              accepted: true,
            });
          }

          if (response.status === HttpStatus.INTERNAL_SERVER_ERROR) {
            expectTypeOf(response.data).toMatchTypeOf({
              ok: false,
            } as const);
          }
        });
      });
    });

    describe("when using strict types", () => {
      beforeAll(() => {
        client.strictTypes = true;
        client.debug = true;
      });
      afterAll(() => {
        client.strictTypes = false;
        client.debug = false;
      });

      describe("A request which return extra properties", () => {
        beforeEach(() => {
          console.error = jest.fn();
          console.log = jest.fn();
        });

        test("Should not have those properties in the response data", async () => {
          mockedAxios.nextResponse = {
            status: 200,
            data: {
              ok: true,
              foo: "bar2",
            },
          };
          const response = await API.samples.getOk();

          expect(response.data).not.toHaveProperty("foo");
        });

        test("Should notify about extra properties", async () => {
          mockedAxios.nextResponse = {
            status: 200,
            data: {
              ok: true,
              foo: "bar",
            },
          };

          await API.samples.getOk();

          expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("foo")
          );
        });
      });
    });

    describe("When throwing errors", () => {
      beforeAll(() => {
        client.throwErrors = true;
        client.strictTypes = true;
      });
      afterAll(() => {
        client.throwErrors = false;
        client.strictTypes = false;
      });

      describe("When executing an operation", () => {
        describe("Where the response has extra values", () => {
          let error = new Error();

          test("The response should fail with an error", async () => {
            try {
              mockedAxios.nextResponse = {
                status: 200,
                data: {
                  ok: true,
                  foo: "bar",
                },
              };
              await API.samples.getOk();
              fail();
            } catch (e) {
              if (e instanceof Error) {
                error = e;
                expect(e).toBeDefined();
              } else {
                fail(new Error("Error is not an instance of error"));
              }
            }
          });

          test("The error should contain the failed property", () => {
            expect(error.message).toContain("foo");
          });

          test("The error should contain the operation name", () => {
            expect(error.message).toContain("getOk");
          });
        });
      });
    });
  });
});
