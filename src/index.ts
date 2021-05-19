// Imports
import express from 'express';
import { json } from 'body-parser';

import database from './models';

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

app.get('/users', async (_, res) => {
  const users = await database.models.User.findAll();
  res.json({ users });
});

(async () => {
  await database.sequelize.sync();

  app.listen(PORT, () => {
    console.log(`App started, listening on port : ${PORT}.`);
  });
})();
