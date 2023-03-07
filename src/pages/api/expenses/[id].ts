import { NextApiRequest, NextApiResponse } from "next";
import { conn } from "src/utils/database";
import { ApiResponse } from "../../../models/ApiResponse";
import nextConnect from "next-connect";
import multer from "multer";
import { uploadStreamToCloudinary, deleteResourceFromCloudinary } from "@/utils/cloudinary";
import { IExpense } from "@/models/IExpense";

interface INextConnectApiRequest extends NextApiRequest {
  files: Express.Multer.File[];
}
type ResponseData = ApiResponse<unknown[], string>;
const oneMegabyteInBytes: number = 1000000;
const upload = multer({
  limits: { fileSize: oneMegabyteInBytes * 2 },
  storage: multer.memoryStorage(),
});
const apiRoute = nextConnect({
  onError(error, req: INextConnectApiRequest, res: NextApiResponse<ResponseData>) {
    console.log(req.body);
    console.log(req);
    res.status(501).json({ error: `Sorry something Happened! ${error.message}`, statusCode: 501, message: error.message });
  },
  onNoMatch(req: INextConnectApiRequest, res: NextApiResponse<ResponseData>) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed`, statusCode: 405, message: `Method '${req.method}' Not Allowed` });
  },
});
apiRoute.use(upload.array("file", 1));

apiRoute.get(async (req: INextConnectApiRequest, res: NextApiResponse<ApiResponse<IExpense[], string>>) => {
  console.log(`Route handler for GET  /api/expenses/[id]>[started]`);
  const {
    query: { id },
  } = req;
  try {
    const sqlGetOneExpense = "SELECT * FROM expenses WHERE id = $1";
    const sqlParameters = [id];
    const getOneExpenseResult = await conn.query(sqlGetOneExpense, sqlParameters);
    const sqlGetOneExpenseFile = "SELECT * FROM expense_files WHERE expense_id = $1";
    const getOneExpenseFileResult = await conn.query(sqlGetOneExpenseFile, sqlParameters);
    if (getOneExpenseResult.rowCount === 0) {
      return res.status(404).json({ error: `Expense not found`, statusCode: 404, message: "Expense Not Found" });
    } else {
      //If there is one record found
      //I had to check with ChatGPT on this one because I am not using sequelize. The coding experience below
      //describes the benefits of sequelize because without sequelize, I have to do my own property mapping
      const expense: IExpense = { id: "0", title: "", amount: 0, happenedAt: new Date(), imageUrl: "", imageWidth: 0, imageHeight: 0 };
      const { happened_at, ...rest } = getOneExpenseResult.rows[0]; // Destructure the source object, excluding the 'happened_at' property
      // Create a new object, temp with the happenedAt property. Also prepare the imageUrl property
      const temp = {
        ...rest,
        happenedAt: happened_at,
        imageUrl: getOneExpenseFileResult.rows[0]?.url,
        imagePublicId: getOneExpenseFileResult.rows[0]?.public_id,
        imageWidth: getOneExpenseFileResult.rows[0]?.width,
        imageHeight: getOneExpenseFileResult.rows[0]?.height,
      };
      Object.assign(expense, temp); // Copy the properties to the destination object
      return res.status(200).json({ data: [expense], statusCode: 200, message: `One expense data retrieved` });
    }
  } catch (error: any) {
    return res.status(400).json({ error: `Sorry something Happened! ${error.message}`, statusCode: 400, message: error.message });
  }
});
apiRoute.put(async (req: INextConnectApiRequest, res: NextApiResponse<ResponseData>) => {
  const {
    body,
    query: { id },
  } = req;
  try {
    console.log(`api/expenses/ put handler logic [started]`);
    const { title, amount, happenedAt, imagePublicId } = body;
    const sqlUpdateOneExpense = `UPDATE expenses SET title = $1, amount = $2, happened_at=$3 WHERE id = $4 RETURNING *`;
    const sqlParameters = [title, amount, happenedAt, id];
    console.log(`Obtained title:${title} amount:${amount} happenedAt:${happenedAt} from req.body`);
    const updateExpenseResult = await conn.query(sqlUpdateOneExpense, sqlParameters);
    const deleteResult = await deleteResourceFromCloudinary(imagePublicId);
    const uploadResult = await uploadStreamToCloudinary(req.files[0].buffer);
    //TODO need to update the expense_files table record.
    console.log(`Inspect [uploadResult] after calling uploadStreamToCloudinary`);
    console.log(uploadResult);
    if (updateExpenseResult.rowCount === 0) {
      return res.status(404).json({ error: `Cannot find expense data to update`, statusCode: 404, message: `Cannot find expense data to update` });
    }
    if (updateExpenseResult.rowCount === 1) {
      const expenses: IExpense[] = updateExpenseResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        amount: row.amount,
        happenedAt: row.happened_at,
      }));
      return res.status(200).json({ data: expenses, statusCode: 200, message: `Updated expense data.` });
    }
    //   return res.status(200).json({data:updateExpenseResult.rows[0],statusCode:200,message:`Updated expense data.`});
  } catch (error: any) {
    console.log(error);
    return res.status(501).json({ error: `Unexpected system problem has occurred:  ${error.message}`, statusCode: 501, message: error.message });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false,
  },
};
