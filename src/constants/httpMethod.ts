export enum HttpMethod {
  /**
   * The `CONNECT` method establishes a tunnel to the server identified by the
   * target resource.
   */
  CONNECT = 'CONNECT',

  /**
   * The `DELETE` method deletes the specified resource.
   */
  DELETE = 'DELETE',

  /**
   * The `GET` method requests a representation of the specified resource.
   * Requests using GET should only retrieve data.
   */
  GET = 'GET',

  /**
   * The `HEAD` method asks for a response identical to that of a GET request,
   * but without the response body.
   */
  HEAD = 'HEAD',

  /**
   * The `OPTIONS` method is used to describe the communication options for the
   * target resource.
   */
  OPTIONS = 'OPTIONS',

  /**
   * The PATCH method is used to apply partial modifications to a resource.
   */
  PATCH = 'PATCH',

  /**
   * The `POST` method is used to submit an entity to the specified resource,
   * often causing a change in state or side effects on the server.
   */
  POST = 'POST',

  /**
   * The `PUT` method replaces all current representations of the target
   * resource with the request payload.
   */
  PUT = 'PUT',

  /**
   * The `TRACE` method performs a message loop-back test along the path to the
   * target resource.
   */
  TRACE = 'TRACE',

  /**

The LINK method is used to establish one or more relationships between an existing resource identified by the effective request URI and other resources. Metadata contained within Link header fields [RFC5988] provide the information about which other resources are being connected to the target resource and the type of relationship being established. A payload within a LINK request message has no defined semantics.

The semantics of the LINK method change to a "conditional LINK" if the request message includes an If-Modified-Since, If-Unmodified-Since, If-Match, If-None-Match, or If-Range header field ([I-D.ietf-httpbis-p4-conditional]). A conditional LINK requests that the relationship be established only under the circumstances described by the conditional header field(s).

LINK request messages are idempotent. For any pair of resources, only a single relationship of any given type can exist. However, multiple relationships of different types can be established between the same pair of resources.

LINK request messages are not safe, however, in that establishing a relationship causes an inherent change to the state of the target resource.

Responses to LINK requests are not cacheable. If a LINK request passes through a cache that has one or more stored responses for the effective request URI, those stored responses will be invalidated (see Section 6 of [I-D.ietf-httpbis-p6-cache]).

A single LINK request message can contain multiple Link header fields, each of which establishes a separate relationship with the target resource. In such cases, the server MUST accept the entire set of relationships atomically. If any of the specified relationships cannot be created, the server MUST NOT create any of them.

A successful response to a Link request that results in either the creation or modification of a relationship SHOULD be 200 (OK) if the response includes a representation describing the status, 201 (Created) if the action results in the creation of a new resource that represents the newly established relationship, 202 (Accepted) if the action has not yet been enacted, or 204 (No Content) if the action has been enacted but the response does not include a representation.

The LINK method MAY be overridden by human intervention (or other means) on the origin server. The client cannot be guaranteed that the operation has been carried out, even if the status code returned from the origin server indicates that the action has been completed successfully. However, the server SHOULD NOT indicate success unless, at the time the response is given, it intends to create or update the specified relationships.

If the LINK request message attempts to create or update an existing relationship and the server does not intend to comply with the request for any reason other than a client or server error, the server can return a 304 (Not Modified) response to indicate that no modifications have been made.
   */
  LINK = 'LINK',
  /**
   * The UNLINK method is used to remove one or more relationships between the existing resource identified by the effective request URI and other resources. Metadata contained within Link header fields [RFC5988] provide the information about the resources to which relationships of a specific type are to be removed. A payload within an UNLINK request message has no defined semantics.

The semantics of the UNLINK method change to a "conditional UNLINK" if the request message includes an If-Modified-Since, If-Unmodified-Since, If-Match, If-None-Match, or If-Range header field ([I-D.ietf-httpbis-p4-conditional]). A conditional UNLINK requests that the relationship be removed only under the circumstances described by the conditional header field(s).

UNLINK request messages are idempotent.

UNLINK request messages are not safe, however, in that removing a relationship causes an inherent change to the state of the target resource.

Responses to UNLINK requests are not cacheable. If an UNLINK request passes through a cache that has one or more stored responses for the effective request URI, those stored responses will be invalidated (see Section 6 of [I-D.ietf-httpbis-p6-cache]).

A single UNLINK request message can contain multiple Link header fields, each of which identifies a separate relationship to remove. In such cases, the server MUST remove the entire set of relationships atomically. If any of the specified relationships cannot be removed, the server MUST NOT remove any of them.

A successful response indicating the removing of the relationship SHOULD be 200 (OK) if the response includes a representation describing the status, 202 (Accepted) if the action has not yet been enacted, or 204 (No Content) if the action has been enacted but the response does not include a representation.

The UNLINK method MAY be overridden by human intervention (or other means) on the origin server. The client cannot be guaranteed that the operation has been carried out, even if the status code returned from the origin server indicates that the action has been completed successfully. However, the server SHOULD NOT indicate success unless, at the time the response is given, it intends to remove the specified relationships.

If the UNLINK request message attempts to remove an existing relationship and the server does not intend to remove or otherwise alter the existing relationship for any reason other than a client or server error, the server can return a 304 (Not Modified) response to indicate that no modifications have been made.
   */
  UNLINK = 'UNLINK',
}
