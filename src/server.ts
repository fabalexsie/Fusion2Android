import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from './api';
dotenv.config();

const port = process.env.PORT;

const app = express();

app.use(express.static('frontend/build'));

app.use('/models', express.static('data/userFiles'));

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
