import * as fs from 'fs';

import { dataPath } from '@/utils/path.js';

const tours = fs.readFileSync(`${dataPath}/tours-simple.json`, 'utf-8');

for (const tour of JSON.parse(tours)) {
  const tourWithRelations = {
    ...tour,
    startDates: {
      create: tour.startDates.map((date: any) => ({ startDate: date })),
    },
  };

  fetch('http://localhost:8000/api/v1/tours', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tourWithRelations),
  })
    .then((res) => res.json())
    .catch();
  // .catch((err) => console.log(err));
}
