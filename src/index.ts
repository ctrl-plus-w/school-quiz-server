// Imports
import express from 'express';
import morgan from 'morgan';

import { json } from 'body-parser';

import database from './models';
import registerAssociations from './database/registerAssociations';
import seedDatabase from './database/seedDatabase';

import auth from './api/auth/auth.routes';

// Constants
const PORT = process.env.PORT || 6000;

// Body
const app: express.Application = express();

// Middlewares
app.use(morgan('dev'));
app.use(json());

// Routes
app.use('/auth', auth);

(async () => {
  await registerAssociations();

  // await database.sequelize.sync({ force: true });
  // await seedDatabase();

  app.listen(PORT, () => {
    console.log(`App started, listening on port : ${PORT}.`);
  });
})();
