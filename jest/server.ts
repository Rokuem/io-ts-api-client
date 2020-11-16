import express from 'express';
import { testConfig } from './config';

const app = express();

app.get('/sample', (_req, res) => {
  res.send({
    ok: true,
  });
});

app.listen(testConfig.TEST_SERVER_PORT);

console.log('Server listening!');
