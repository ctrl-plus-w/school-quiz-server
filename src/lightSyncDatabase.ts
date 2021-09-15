import registerAssociations from './database/registerAssociations';
import database from './models';

(async () => {
  await registerAssociations();
  await database.sequelize.sync({ alter: true });
})();
