import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app= express();

// app.use(cors({
//     origin:process.env.CORS_ORIGIN,
//     credentials:true,
// }));
// app.use(express.json({
//     limit:'16KB'
// }));
// app.use(express.urlencoded({
//     limit:'16KB',
//     extended:true,
// }));
// app.use(express.static('public'));

// app.use(cookieParser());
app.use((req, res, next) => 
    {
console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
next
})
//routes
import {router} from './routes/user.routes.js'


//routes declaration
app.use('/api/v1/users',router)

 //https://localhost:8000/api/v1/users/register



export default app;



// app.use(/apo)















