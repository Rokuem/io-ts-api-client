import express from 'express';
import { testConfig } from './config';

const app = express();

app.get('/sample/:type', (req, res) => {
  if (req.params.type === 'ok') {
    res.send({
      ok: true,
    });
  } else {
    res.send({
      accepted: true,
    });
  }
});

app.listen(testConfig.TEST_SERVER_PORT);

console.log('Server listening!');
