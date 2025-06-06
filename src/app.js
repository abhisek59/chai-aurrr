import cors from 'cors'
import cookieParser from 'cookie-parser';
import {router} from './routes/user.routes.js'
import express from "express";
import path from "path";
import { fileURLToPath } from "url";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({
    limit: '16KB'
}));

app.use(express.urlencoded({
    extended: true,
}));
app.use(express.json());


app.use(express.static('public'));
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Static files middleware
app.use("/files", express.static(path.join(_dirname, "../")));
app.use('/api/v1/users', router);


export default app;