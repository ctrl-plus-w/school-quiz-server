// Imports
import express from 'express';
import morgan from 'morgan';

import { json } from 'body-parser';

import database from './models';
import registerAssociations from './database/registerAssociations';
import seedDatabase from './database/seedDatabase';

import auth from './api/auth/auth.routes';
import groups from './api/group/group.routes';
import labels from './api/label/label.routes';
import users from './api/user/user.routes';

import authenticateMiddleware from './middlewares/authenticate.middleware';
import errorHandler from './middlewares/errorHandler.middleware';
import pageNotFound from './middlewares/pageNotFound.middleware';

// Constants
const PORT = process.env.PORT || 6000;

// Body
const app: express.Application = express();

// Middlewares
app.use(morgan('dev'));
app.use(json());

// Routes
app.use('/auth', auth);
app.use('/api/groups', authenticateMiddleware, groups);
app.use('/api/labels', authenticateMiddleware, labels);
app.use('/api/users', authenticateMiddleware, users);

app.use(pageNotFound);
app.use(errorHandler);

(async () => {
  await registerAssociations();

  // await database.sequelize.sync({ force: true });
  // await seedDatabase();

  app.listen(PORT, () => {
    console.log(`App started, listening on port : ${PORT}.`);
  });
})();
