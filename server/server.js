import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes.js';
import 'dotenv';

const app = express();

mongoose.set("strictQuery", true);
mongoose.connect(`${process.env.MONGODB_URL}`), err => err && console.log(err);

// const authorizedSources = [
//     'http://localhost:5173',
//     'https://noap.vercel.app',
//     'https://noap-typescript.vercel.app',
// ];

// {
//     origin: (origin, callback) => {
//         if(!origin) return callback(null, true);
//         if(!origin) return callback(null, true);   
//         if(authorizedSources.indexOf(origin) === -1){
//             return callback(new Error('Unauthorized'), false);
//         }    
//         return callback(null, true);
//     }
// }

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use(bodyParser.json({limit: '30000kb'})); //seting a high limit just for testing purposes
app.use(cors({
    origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(routes);

app.listen(3001, () => console.log(`Server is running at port 3001`));