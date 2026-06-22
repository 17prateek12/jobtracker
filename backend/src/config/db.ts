import mongoose from "mongoose";

export const connectToDB = async() => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI!);
        console.log("MongoDB connect", connect.connection.host, connect.connection.name);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}