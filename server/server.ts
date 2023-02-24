import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import routes from './routes';

const app = express();

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1/Noap", (err) => {
    if(err) console.log(err);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(routes);

app.listen(3001, () => console.log(`Server is running at http://mongodb://127.0.0.1:27017/:3001`));

