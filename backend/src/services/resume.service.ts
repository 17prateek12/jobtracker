import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import Resume from "../models/Resume";
import { s3Client, S3_BUCKET_NAME, initializeS3Bucket } from "../config/s3";
import { ApiError } from "../utils/ApiError";
import { HTTP_STATUS } from "../constants/httpStatus";
import { parsePdfResume } from "./ai.service";

interface UploadResumeParams {
    userId: string;
    name: string;
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
}

interface CreateBuiltResumeParams {
    userId: string;
    name: string;
    structuredData: any;
}

// 1. Upload a new Resume file version to S3 and save metadata
export const uploadResumeService = async (params: UploadResumeParams) => {
    const { userId, name, fileBuffer, fileName, mimeType } = params;

    // Proactively verify/create the S3 bucket in case the container was restarted
    await initializeS3Bucket();

    // Check for previous versions of the resume with the same name
    const latestResume = await Resume.findOne({ userId, name, isLatest: true });

    let newVersion = 1;
    if (latestResume) {
        newVersion = latestResume.version + 1;
        // Mark all existing versions as non-latest
        await Resume.updateMany({ userId, name }, { isLatest: false });
    }

    // Generate unique S3 Key
    const s3Key = `resumes/${userId}/${Date.now()}_v${newVersion}_${fileName.replace(/\s+/g, "_")}`;

    // Upload to local S3
    await s3Client.send(
        new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: mimeType,
        })
    );

    // Generate URL
    const s3Url = `${process.env.S3_ENDPOINT || "http://localhost:4566"}/${S3_BUCKET_NAME}/${s3Key}`;

    // Create the DB record
    const newResume = await Resume.create({
        userId,
        name,
        version: newVersion,
        s3Key,
        s3Url,
        type: "UPLOADED",
        isLatest: true,
    });

    return newResume;
};

// 2. Create or save a structured builder resume version
export const createBuiltResumeService = async (params: CreateBuiltResumeParams) => {
    const { userId, name, structuredData } = params;

    const latestResume = await Resume.findOne({ userId, name, isLatest: true });

    let newVersion = 1;
    if (latestResume) {
        newVersion = latestResume.version + 1;
        await Resume.updateMany({ userId, name }, { isLatest: false });
    }

    const newResume = await Resume.create({
        userId,
        name,
        version: newVersion,
        structuredData,
        type: "BUILT",
        isLatest: true,
    });

    return newResume;
};

// 3. List resumes (default: latest versions of each distinct resume)
export const getResumesService = async (userId: string, showOnlyLatest = true) => {
    const filter: any = { userId };
    if (showOnlyLatest) {
        filter.isLatest = true;
    }
    return await Resume.find(filter).sort({ name: 1, version: -1 });
};

// 4. Retrieve all versions for a specific resume name
export const getResumeVersionsService = async (userId: string, name: string) => {
    return await Resume.find({ userId, name }).sort({ version: -1 });
};

// 5. Retrieve a single resume record by ID
export const getResumeByIdService = async (userId: string, id: string) => {
    const resume = await Resume.findOne({ userId, _id: id });
    if (!resume) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Resume not found");
    }
    return resume;
};

// 6. Delete a resume version (and delete file from S3 if uploaded)
export const deleteResumeService = async (userId: string, id: string) => {
    const resume = await Resume.findOne({ userId, _id: id });
    if (!resume) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Resume not found");
    }

    // If S3 key exists, delete from local S3
    if (resume.s3Key) {
        try {
            await s3Client.send(
                new DeleteObjectCommand({
                    Bucket: S3_BUCKET_NAME,
                    Key: resume.s3Key,
                })
            );
        } catch (err) {
            console.error("Failed to delete file from S3:", err);
        }
    }

    // Delete the database record
    await Resume.deleteOne({ _id: id });

    // If we deleted the latest version, restore the previous latest
    if (resume.isLatest) {
        const nextLatest = await Resume.findOne({ userId, name: resume.name }).sort({ version: -1 });
        if (nextLatest) {
            nextLatest.isLatest = true;
            await nextLatest.save();
        }
    }
};

// 7. Convert an UPLOADED S3 resume to a structured BUILT resume using Gemini
export const convertUploadedResumeService = async (userId: string, id: string) => {
    const resume = await Resume.findOne({ userId, _id: id });
    if (!resume) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Resume not found");
    }

    if (resume.type === "BUILT") {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Resume is already a structured built resume");
    }

    if (!resume.s3Key) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No S3 file attachment found for this resume");
    }

    // Download PDF from local S3
    let pdfBuffer: Buffer;
    try {
        const getObjectResponse = await s3Client.send(new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: resume.s3Key
        }));
        
        const bytes = await getObjectResponse.Body?.transformToByteArray();
        if (!bytes) {
            throw new Error("S3 object body is empty");
        }
        pdfBuffer = Buffer.from(bytes);
    } catch (err: any) {
        console.error("Failed to download PDF from S3:", err);
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Failed to retrieve PDF from storage: ${err.message}`);
    }

    // Call Vertex AI / Gemini parser
    const mimeType = "application/pdf";
    const structuredData = await parsePdfResume(pdfBuffer, mimeType);

    // Save as new built resume version
    const newResumeName = `${resume.name} (Converted)`;
    const builtResume = await createBuiltResumeService({
        userId,
        name: newResumeName,
        structuredData
    });

    return builtResume;
};
