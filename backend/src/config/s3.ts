import { S3Client, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

export const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || "http://localhost:4566",
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
    },
    forcePathStyle: true, // required for local S3 emulators (Floci/LocalStack)
});

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "jobtrack-resumes";

export const initializeS3Bucket = async () => {
    try {
        // Check if bucket exists
        await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET_NAME }));
        console.log(`S3 Bucket '${S3_BUCKET_NAME}' verified successfully.`);
    } catch (err: any) {
        // If not found, try to create it
        if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
            try {
                await s3Client.send(new CreateBucketCommand({ Bucket: S3_BUCKET_NAME }));
                console.log(`S3 Bucket '${S3_BUCKET_NAME}' created successfully in local S3.`);
            } catch (createErr) {
                console.error(`Error creating S3 Bucket '${S3_BUCKET_NAME}':`, createErr);
            }
        } else {
            console.warn(`[S3 Warning] Local S3 (Floci) at ${process.env.S3_ENDPOINT || "http://localhost:4566"} check failed:`, err.message || err);
            console.warn("Please make sure Floci Docker container is running by executing 'docker compose up -d'.");
        }
    }
};
