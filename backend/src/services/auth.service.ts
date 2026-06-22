import User from "../models/User";
import { verifyGoogleToken } from "../utils/google";
import { generateToken } from "../utils/jwt";
import { DevLoginDto } from "../dtos/auth.dto";

export const loginWithGoogleService = async (idToken: string) => {
    const googlePayload = await verifyGoogleToken(idToken);
    const { sub, email, name, picture } = googlePayload;

    let user = await User.findOne({
        email,
    });

    if (!user) {

        user =
            await User.create({
                googleId: sub,
                email,
                name,
                avatar: picture,
            });

    } else {

        if (!user.googleId) {

            user.googleId = sub;

            await user.save();
        }
    }

    const token = generateToken({
        id: user._id.toString(),
        email: user.email,
    });

    return {
        user,
        token,
    };
};

export const devLoginService = async (payload: DevLoginDto) => {

    let user = await User.findOne({email: payload.email,});

    if (!user) {
        user = await User.create({
            email: payload.email,
            name:
                payload.name ??
                payload.email.split("@")[0],
        });
    }

    const token = generateToken({
        id: user._id.toString(),
        email: user.email,
    });

    return {
        user,
        token,
    };
};