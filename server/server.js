import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import routes from './routes.js';
import 'dotenv';

const app = express();

mongoose.set("strictQuery", true);
mongoose.connect(`${process.env.MONGODB_URL}`), err => err && console.log(err);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(routes);

app.listen(3001, () => console.log(`Server is running`));