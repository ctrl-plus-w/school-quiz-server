// Imports
import express from 'express';
import { json } from 'body-parser';

import database from './database';

// Constants
const PORT = process.env.PORT || 6000;

// Body
const app: express.Application = express();

// Middlewares
app.use(json());

app.get('/', (_: express.Request, res: express.Response) => {
  res.json({
    message: 'Welcome on the api.',
  });
});

(async () => {
  await database.sync({ force: false });

  app.listen(PORT, () => {
    console.log(`App started, listening on port : ${PORT}.`);
  });
})();
