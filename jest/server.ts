import express from 'express';

const app = express();

app.get('/sample', (_req, res) => {
  res.send({
    ok: true,
  });
});

app.listen(3000);
console.log('Server listening!');
