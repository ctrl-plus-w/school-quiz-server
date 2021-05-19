import express from 'express';
import { json } from 'body-parser';

const PORT = process.env.PORT || 6000;

const app: express.Application = express();

app.use(json());

app.get('/', (_: express.Request, res: express.Response) => {
  res.json({
    message: 'Welcome on the api.',
  });
});

app.listen(PORT, () => {
  console.log(`App started, listening on port : ${PORT}.`);
});
