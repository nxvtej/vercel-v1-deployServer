// vercel-bucket /ouput/{$id}/......
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
import fs from 'fs';
import path, { resolve } from 'path';

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

        console.log(command)
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