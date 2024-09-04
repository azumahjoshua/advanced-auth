import express from "express";
import dotenv from "dotenv"
import { connectDB } from "./db/connetDB.js";
dotenv.config();
import router from "./routes/auth.route.js";
const app = express();

const PORT = process.env.PORT || 5000

app.use(express.json());

app.use("/api/auth",router)
app.listen(PORT,()=>{
    connectDB();
    console.log(`Server is Running on PORT: ${PORT}`)
})
