
export interface IFileUploadResult {
    publicId?: string;
    url?: string;
    status: string;
    error?:any;
    width?:number;
    height?:number;
    originalFileName?:string;
}