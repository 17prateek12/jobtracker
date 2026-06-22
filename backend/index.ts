import express from "express";
import dotenv from "dotenv";
import { connectToDB } from "./src/config/db";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorMiddleWare } from "./src/middlewares/error.middleware";
import authRoutes from "./src/routes/auth.routes";
import companyRoutes from "./src/routes/company.routes"
import opportunityRoutes from "./src/routes/opportunity.routes";
import outreachRoutes from "./src/routes/outreach.routes";
import followupRoutes from "./src/routes/followup.routes";
import captureRoutes from "./src/routes/capture.routes";
import metadataRoutes from "./src/routes/metadata.routes";


dotenv.config();
connectToDB();
const app = express();
app.use(cors({
    origin: true,
    credentials: true,}
));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", async(req,res)=>{
    res.json({message:"Welcome to Job search os tracker"});
})

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/outreaches", outreachRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/capture", captureRoutes)
app.use("/api/metadata", metadataRoutes);
app.use(errorMiddleWare);
const Port = process.env.PORT;
app.listen(Port, ()=>{
    console.log(`Server running at http://localhost:${Port}`)
})