import { Options } from 'sequelize';

interface Passport {
  [key: string]: Options;
}

const developmentCredentials: Options = {
  username: 'root',
  password: '!FreshRoot1',
  database: 'SchoolQuiz',
  host: '127.0.0.1',
  dialect: 'mysql',
};

const productionCredentials: Options = {
  username: 'root',
  password: '1234',
  database: 'database_production',
  host: '127.0.0.1',
  dialect: 'mysql',
};

const credentials: Passport = {
  development: developmentCredentials,
  production: productionCredentials,
};

export default credentials[process.env.NODE_ENV || 'development'];