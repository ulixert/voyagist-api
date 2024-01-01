import express from 'express';

import {
  createTour,
  getAllTours,
  getTour,
} from '@/controllers/toursController.js';

const app = express();
app.use(express.json());

// Routes
app.get('/api/v1/tours', getAllTours);
app.post('/api/v1/tours', createTour);
app.get('/api/v1/tours/:id', getTour);

const PORT = process.env.PORT ?? 6000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
