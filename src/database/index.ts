import sequelize, { Sequelize } from 'sequelize';

const database: sequelize.Sequelize = new Sequelize(process.env.DB_URL || 'mysql://root:!FreshRoot1@localhost/SchoolQuiz');

export default database;
