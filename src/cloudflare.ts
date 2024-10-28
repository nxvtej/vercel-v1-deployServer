// vercel-bucket /ouput/{$id}/......
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from 'dotenv'
import fs from 'fs'
dotenv.config()

const client = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUD_URL || "",
    credentials: {
        accessKeyId: process.env.CLOUD_ACCESS_KEY || "",
        secretAccessKey: process.env.CLOUD_SECRET_ACCESS_KEY || ""
    }

});
async function downloadS3Folder(prefix: string) {
    const getAllFiles = 
}


export { downloadS3Folder }