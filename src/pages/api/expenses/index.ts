import base from "@/middlewares/common";
import { IExpense } from "@/models/IExpense";
import { IFileUploadResult } from "@/models/IFileUploadResult";
import { uploadStreamToCloudinary } from "@/utils/cloudinary";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";
import { conn } from "src/utils/database";
import { ApiResponse } from "../../../models/ApiResponse";

//The bulk of the code in index.ts has been  influenced by the content at:
//https://github.com/codeBelt/my-next.js-starter/blob/upload/src/pages/api/uploads/index.ts

interface INextConnectApiRequest extends NextApiRequest {
  files: Express.Multer.File[];
}
//Refer to the \interfaces\ApiResponse.ts for more information.
//The following command,
/*
  The last line of the code defines a type alias ResponseData ...
  that is of type ApiResponse<string[], string>. 
  This means that ResponseData can be "either" a SuccessfulResponse "or" an UnsuccessfulResponse, 
  where the data property is an array of strings, and the error property is a string.
  */
type ResponseData = ApiResponse<unknown[], string>;

const oneMegabyteInBytes: number = 1000000;
const upload = multer({
  limits: { fileSize: oneMegabyteInBytes * 2 },
  storage: multer.memoryStorage(),
});
// const apiRoute = nextConnect({
//   onError(error, req: INextConnectApiRequest, res: NextApiResponse<ResponseData>) {
//     //You will only be able to inspect the request structure when error occurs
//     console.log(`apiRoute [onError] handler logic has executed.`);
//     console.log(`inspect [req]`);
//     console.log(req);
//     //<TODO>
//     //I should not be responding the details of the error to the client-side. There must be another way to log it somewhere
//     //. This NextJS project does not have proper error logging logic in place.
//     res.status(501).json({ error: `System has encountered error ${error.message}`, statusCode: 501, message: error.message });
//   },
//   onNoMatch(req: INextConnectApiRequest, res: NextApiResponse<ResponseData>) {
//     res.status(405).json({ error: `Method '${req.method}' Not Allowed`, statusCode: 405, message: `Method '${req.method}' Not Allowed` });
//   },
// });
const apiRoute = base<unknown[], INextConnectApiRequest>();

apiRoute.use(upload.array("file", 1));

apiRoute.get(async (req: INextConnectApiRequest, res: NextApiResponse<ResponseData>) => {
  try {
    console.log(`Route handler for GET  /api/expenses/ has started`);
    const sqlGetExpenses = `SELECT id,title,amount,happened_at FROM expenses`;
    const getExpensesResult = await conn.query(sqlGetExpenses);
    const expenses: IExpense[] = getExpensesResult.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      amount: row.amount,
      happenedAt: row.happened_at,
    }));
    console.log(expenses);
    return res.json({ data: expenses, statusCode: 200, message: `Retrieved expense data.` });
  } catch (error: any) {
    return res.status(400).json({ error: `Unable to retrieve the expense data`, message: error.message });
  }
});
apiRoute.post(async (req: INextConnectApiRequest, res: NextApiResponse<ResponseData>) => {
  //I have been using the following destructuring technique for a while.
  //But later on, I have started to experiment on IExpense interface by using a variable which is
  //declared as newExpense.
  const { method, body, files } = req;
  try {
    console.log(`api/expenses/ post handler logic [started]`);
    //I have referred to the https://youtu.be/gxkwMm_j850?t=2239 video content which
    //shares how I can define my own type when collecting data from the req.body.
    const newExpense: IExpense = req.body;
    const createExpenseSQL = `INSERT INTO expenses(title,amount,happened_at) VALUES ($1, $2, $3) RETURNING *`;
    const createExpenseValues = [newExpense.title, newExpense.amount, newExpense.happenedAt];
    const createExpenseResult = await conn.query(createExpenseSQL, createExpenseValues);
    console.log(`inspect [createExpenseResult]`);

    const uploadResult: IFileUploadResult = await uploadStreamToCloudinary(req.files[0].buffer);
    console.log(`The command which sends the file content to Cloudinary has been executed.`);
    console.log(`inspect [uploadResult]`);
    console.log(uploadResult);
    console.log(`*`.repeat(20));
    const sqlCreateExpenseFile = `INSERT INTO expense_files (public_id,expense_id,original_filename,mimetype,url,width,height) 
          VALUES ($1, $2, $3,$4,$5,$6,$7) RETURNING *`;
    const sqlCreateExpenseFileParameters = [
      uploadResult.publicId,
      createExpenseResult.rows[0].id,
      req.files[0].originalname,
      req.files[0].mimetype,
      uploadResult.url,
      uploadResult.height,
      uploadResult.width,
    ];
    const createExpenseFileResult = await conn.query(sqlCreateExpenseFile, sqlCreateExpenseFileParameters);
    return res.status(200).json({ data: createExpenseResult.rows[0], statusCode: 200, message: `Created expense data.` });
  } catch (error: any) {
    console.log(`apiRoute.post catch block has executed.`);
    console.log(`inspect the [error:any]:`);
    console.log(error);
    console.log(`*`.repeat(20));
    return res.status(400).json({ error: `Unexpected system problem has occurred:  ${error.message}`, statusCode: 501, message: error.message });
  }
});

export default apiRoute;
//The following has something to do with https://nextjs.org/docs/api-routes/request-helpers
//https://youtu.be/mtkwQJXPLuI?t=857
//Commenting out the following block of code will yield runtime error.
//The file upload and the create expense record operation will not occur
export const config = {
  api: {
    bodyParser: false,
  },
};
