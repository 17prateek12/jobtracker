import { OAuth2Client } from "google-auth-library";
import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../constants/httpStatus";

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

export const verifyGoogleToken = async (idToken: string) => {
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, "Invalid Google Token");
    }
    return payload;
};