import express from 'express';
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';

import { Tour } from './types/type.js';

const app = express();

app.use(express.json());

const dataPath = new URL('../dev-data/data', import.meta.url).pathname;
const tours = JSON.parse(
  readFileSync(`${dataPath}/tours-simple.json`, 'utf-8'),
) as Tour[];

app.get('/api/v1/tours', (_, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

app.post('/api/v1/tours', async (req, res) => {
  try {
    const newId = tours.length === 0 ? 1 : tours.at(-1)!.id + 1;
    const newTour = { ...req.body, id: newId } as Tour;

    tours.push(newTour);
    await writeFile(`${dataPath}/tours-simple.json`, JSON.stringify(tours));

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    console.error('💥 There is an error: ', err);
  }
});

const PORT = process.env.PORT ?? 6000;

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
