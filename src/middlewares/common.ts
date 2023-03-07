/**
 * Base nc instance factory.
 *
 * next-connect recommends using a factory to create nc instances rather than a singleton to initialize middleware to handle errors
 * https://stackoverflow.com/questions/69567067/chaining-middleware-in-next-connect-fails-with-error-handler
 * https://www.npmjs.com/package/next-connect
 */

import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import type { ApiResponse } from "@/models/ApiResponse";

/**
 * * We specify the generic type parameters to enforce the return type.
 * * We are making a few asumptions here:
 * * - The base and middleware functions WILL NOT return anything of type T.
 * * - The base and middleware functions WILL ONLY return some form of error.
 * * - Error objects must be of the same shape (i.e. string) since we assert that, thats the return type for our error responses.
 * *   thus we cannot let the consumer pass in a type E. If we do, there is no guarantee of the shape of the error object, thus
 * *   violating the constraint of the ApiResponse type.
 */
export default function base<
  T,
  Req extends NextApiRequest = NextApiRequest,
  Res extends NextApiResponse<ApiResponse<T, string>> = NextApiResponse
>() {
  return nc<Req, Res>({
    onError: (err, req, res) => {
      //You will only be able to inspect the request structure when error occurs
      console.log(`apiRoute [onError] handler logic has executed.`);
      console.log(`inspect [req]`);
      console.log(req);

      //<TODO>
      //I should not be responding the details of the error to the client-side. There must be another way to log it somewhere
      //. This NextJS project does not have proper error logging logic in place.
      // * Consider throwing custom errors and use those error objects to specify the status code and message to be returned to the client-side.

      // * In the event that the error does not have a status code, we can default to 500.
      const statusCode: number = typeof err.statusCode === "number" ? err.statusCode : 500;
      // * In the event that the error does not have a message, we can default to "Internal Server Error".
      const message: string = typeof err.message === "string" ? err.message : "Internal Server Error";

      res.status(501).json({
        error: `System has encountered error ${message}`,
        statusCode,
        message,
      });
    },
    onNoMatch: (req, res) => {
      res.status(405).json({ error: `Method '${req.method}' Not Allowed`, statusCode: 405, message: `Method '${req.method}' Not Allowed` });
    },
  });
}
