export type SuccessfulResponse<T> = { data: T; error?: never; statusCode?: number; message: string };
export type UnsuccessfulResponse<E> = { data?: never; error: E; statusCode?: number; message: string };

export type ApiResponse<T, E = unknown> = SuccessfulResponse<T> | UnsuccessfulResponse<E>;

//The ApiResponse is defined by using the concept of generic programming.
//Reference: https://javascript.plainenglish.io/typescript-generics-whats-with-the-angle-brackets-4e242c567269
/*
SuccessfulResponse<T>: This type defines a successful response object that has three properties:
data: which is of type T and contains the response data
error: which is optional and has a value of never (meaning it can NEVER be present in a successful response object)
statusCode: which is optional and has a value of number, and represents the status code of the HTTP response.
message: which is of type string and contains a message associated with the response.

UnsuccessfulResponse<E>: This type defines an unsuccessful response object that has three properties:
data: which is optional and has a value of never (meaning it can never be present in an unsuccessful response object)
error: which is of type E and contains the error message or object associated with the response.
statusCode: which is optional and has a value of number, and represents the status code of the HTTP response.
message: which is of type string and contains a message associated with the response.

ApiResponse<T, E = unknown>: 
This type defines a union of SuccessfulResponse<T> and UnsuccessfulResponse<E> types
representing a response that could be either successful or unsuccessful, 
with the type of the data and error properties determined by the generic types T and E, respectively.
The E type is optional and defaults to unknown.

*/
