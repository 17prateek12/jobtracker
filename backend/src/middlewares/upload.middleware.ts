import multer from "multer";
import { Request } from "express";
import { ApiError } from "../utils/ApiError";
import { HTTP_STATUS } from "../constants/httpStatus";

// Configure memory storage
const storage = multer.memoryStorage();

// File filter to restrict file types to PDF and DOCX
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
        "application/msword", // doc
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid file type. Only PDF and Word documents (.doc, .docx) are allowed."));
    }
};

// Multer upload configurations (Max size: 5MB)
export const uploadResume = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
}).single("resumeFile");
