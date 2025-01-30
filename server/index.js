import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bodyParser from 'body-parser';
import cors from 'cors'
import connectDB from './config/db.js'
import errorHandler from './middlewares/errorHandler.js'
import authRoutes from './routes/authRouter.js'
import chatRouter from './routes/chatRouter.js'
//Load environment variables from .env file
dotenv.config();

//server initailiasation
const app=express();

//Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/auth',authRoutes)
app.use('/api/chat',chatRouter);
//connect MongoDB
connectDB();

//error handler
app.use(errorHandler)


//router established
const PORT=process.env.PORT

app.listen(PORT,()=>{
    console.log(`server running on PORT {PORT}`);
});