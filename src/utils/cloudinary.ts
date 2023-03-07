import cloudinary from "cloudinary";
import streamifier from "streamifier";
import { IFileUploadResult } from "@/models/IFileUploadResult";
//I have worked on cloudinary package related code in NodeJS and Express.
//But when comes to TypeScript code technique, I have referred to the following to get the
//following configuration statements working.
//https://github.com/2color/ama-prisma/blob/main/src/lib/cloudinary.ts
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteResourceFromCloudinary = function (publicId: string): Promise<any> {
  return new Promise(function (resolve, reject) {
    cloudinary.v2.uploader.destroy(publicId, function (error, result) {
      if (result) {
        console.log(`deleteResourceFromCloudinary>>Inspect [result]`);
        resolve(result);
      }
      if (error) {
        console.log(`deleteResourceFromCloudinary>>Inspect [error]`);
        reject({ status: "fail", data: error });
      }
    });
  });
};

//deleteResourceFromCloudinary

//uploadStreamToCloudinary - useful if the backend uses the:
// ->direct stream the content to cloudinary without temp file technique
//strategy
const uploadStreamToCloudinary = function (buffer: Buffer): Promise<IFileUploadResult> {
  return new Promise(function (resolve, reject) {
    //Create a powerful, writable stream object which works with Cloudinary
    let streamDestination = cloudinary.v2.uploader.upload_stream(
      {
        folder: "expenses",
        allowed_formats: ["png,jpg"],
        resource_type: "image",
      },
      function (error, result) {
        console.log(`upload_stream>>callback function logic has executed. Inspect [result and typeof result]`);
        console.log(typeof result);
        console.log(result);
        if (result) {
          //Inspect whether I can obtain the file public_id and the url from cloudinary
          //after a successful upload.
          console.log({ imageURL: result.url, publicId: result.public_id });
          let file: IFileUploadResult = {
            publicId: result.public_id,
            url: result.url,
            status: "success",
            width: result.width,
            height: result.height,
            originalFileName: result.original_filename,
          };
          resolve(file);
        }
        if (error) {
          let file: IFileUploadResult = { error: error, status: "fail" };
          reject({ status: "fail", data: error });
        } // End of if..else block inside the anonymous function given to upload_stream
      }
    );
    //The following command does the actual file stream upload operation.
    streamifier.createReadStream(buffer).pipe(streamDestination);
  }); //End of Promise
}; //End of uploadStreamToCloudinary
export { uploadStreamToCloudinary, deleteResourceFromCloudinary };
