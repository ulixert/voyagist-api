import express from 'express';

import { toursRouter } from './routes/toursRouter.js';

const PORT = process.env.PORT ?? 6000;

const app = express();
app.use(express.json());

// Routes
app.use('/api/v1/tours', toursRouter);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
