// Imports
import express from 'express';
import morgan from 'morgan';

import { json } from 'body-parser';

import registerAssociations from './database/registerAssociations';

import auth from './api/auth/auth.routes';
import groups from './api/group/group.routes';
import labels from './api/label/label.routes';
import users from './api/user/user.routes';
import roles from './api/role/role.routes';
import eqAnswers from './api/eqAnswer/eqAnswer.routes';

import authenticateMiddleware from './middlewares/authenticate.middleware';
import errorHandler from './middlewares/errorHandler.middleware';
import pageNotFound from './middlewares/pageNotFound.middleware';

// import seedDatabase from './database/seedDatabase';
// import database from './models/index';

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
app.use('/api/roles', authenticateMiddleware, roles);
app.use('/api/eqAnswers', authenticateMiddleware, eqAnswers);

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
