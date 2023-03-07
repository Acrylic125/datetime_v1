import { conn } from "@/utils/database";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

//The bulk of the code in index.ts has been  influenced by the content at:
//https://github.com/codeBelt/my-next.js-starter/blob/upload/src/pages/api/uploads/index.ts

interface INextConnectApiRequest extends NextApiRequest {
  files: Express.Multer.File[];
}

const apiRoute = nextConnect({
  onError(error, req: INextConnectApiRequest, res: NextApiResponse<unknown>) {
    //You will only be able to inspect the request structure when error occurs
    console.log(`apiRoute [onError] handler logic has executed.`);
    console.log(`inspect [req]`);
    console.log(req);
    //<TODO>
    //I should not be responding the details of the error to the client-side. There must be another way to log it somewhere
    //. This NextJS project does not have proper error logging logic in place.
    res.status(501).json({ error: `System has encountered error ${error.message}`, statusCode: 501, message: error.message });
  },
  onNoMatch(req: INextConnectApiRequest, res: NextApiResponse<unknown>) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed`, statusCode: 405, message: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.get(async (req: INextConnectApiRequest, res: NextApiResponse<unknown>) => {
  console.log(`Route handler for GET  /api/expenses/ has started`);
  const sqlGetExpenses = `SELECT * FROM information_schema.tables`;
  const getExpensesResult = await conn.query(sqlGetExpenses);
  res.status(200).json({ message: getExpensesResult });
});

export default apiRoute;
