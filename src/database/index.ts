import sequelize, { Sequelize } from 'sequelize';

const database: sequelize.Sequelize = new Sequelize({
	dialect: 'sqlite',
  storage: './database.sqlite'
});

export default database;
