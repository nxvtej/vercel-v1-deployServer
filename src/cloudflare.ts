// vercel-bucket /ouput/{$id}/......
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { getAllFiles, uploadfiletoBucket } from "./utils";

dotenv.config();

const client = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUD_URL || "",
    credentials: {
        accessKeyId: process.env.CLOUD_ACCESS_KEY || "",
        secretAccessKey: process.env.CLOUD_SECRET_ACCESS_KEY || ""
    }
});

export async function downloadS3Folder(prefix: string, localPath: string) {
    try {
        // List all objects with the given prefix
        const command = new ListObjectsV2Command({
            Bucket: process.env.CLOUD_BUCKET || "",
            Prefix: prefix
        });

        console.log(command.input)
        const { Contents } = await client.send(command);

        if (!Contents) {
            console.log("No contents found in the specified prefix");
            return;
        }

        // Download each file
        for (const object of Contents) {
            if (!object.Key) continue;

            const localFilePath = path.join(localPath, object.Key);

            // Create the directory structure if it doesn't exist
            const dirName = path.dirname(localFilePath);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, { recursive: true });
            }

            // Skip if the key ends with a forward slash (directory)
            if (object.Key.endsWith('/')) continue;

            // Download the file
            const getObjectCommand = new GetObjectCommand({
                Bucket: process.env.CLOUD_BUCKET || "",
                Key: object.Key
            });

            const response = await client.send(getObjectCommand);

            if (!response.Body) {
                console.log(`No body in response for ${object.Key}`);
                continue;
            }

            // Convert the readable stream to buffer
            const chunks = [];
            for await (const chunk of response.Body as any) {
                chunks.push(chunk);
            }
            const fileBuffer = Buffer.concat(chunks);

            // Write the file
            fs.writeFileSync(localFilePath, fileBuffer);
            // console.log(`Downloaded: ${object.Key}`);
        }

        console.log("Download completed successfully!");
    } catch (error) {
        console.error("Error downloading folder:", error);
        throw error;
    }
}

export async function copyFinalDist(id: string) {
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);

    for (const file of allFiles) {
        // Preserve the relative path of each file within the "dist" folder.
        const relativePath = path.relative(folderPath, file);
        const s3Key = `dist/${id}/${relativePath.replace(/\\/g, '/')}`;

        await uploadfiletoBucket(s3Key, file);
        console.log("File uploaded with key ->", s3Key);
    }
}


/*
export async function copyFinalDist(id: string) {
    // get folder from id
    // get all files from there
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath)

    // upload all to xyx bucket


    for (const file of allFiles) {

        // const fileName = file.replace(folderPath, `output/${id}/dist`);+
        const fileName = `dist/${id}/` + file.slice(folderPath.length + 1);
        await uploadfiletoBucket(fileName, file);
        console.log("fileName that is uploaded->", fileName)
    }

    // delete the folder
    // fs.rmdirSync(folderPath, { recursive: true });
}
    */