import express from 'express';

const app = express();

app.get('/', (_, res) => {
  res.status(200).json({
    message: 'Hello from the server side',
    app: 'Natours',
  });
});

app.post('/', (_, res) => {
  res.send('You can post to this endpoint...');
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
