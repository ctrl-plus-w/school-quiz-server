import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const CREDENTIALS = {
  REDIS_HOST: <string>process.env.REDIS_HOST,
  REDIS_PORT: <number>parseInt(<string>process.env.REDIS_PORT),
  REDIS_PW: <string>process.env.REDIS_PW,
  JWT_TOKEN: <string>process.env.JWT_TOKEN,
  CLIENT_URL: <string>process.env.CLIENT_URL,
};

export default CREDENTIALS;
