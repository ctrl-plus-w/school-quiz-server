import { createClient } from 'redis';

import util from 'util';

import CREDENTIALS from '../constants/credentials';

const client = createClient({ host: CREDENTIALS.REDIS_HOST, port: CREDENTIALS.REDIS_PORT, password: CREDENTIALS.REDIS_PW });

const redisGetAsync = util.promisify(client.get).bind(client);
const redisSetAsync = util.promisify(client.set).bind(client);

const redisMGetAsync = (...args: Array<string>): Promise<Array<string | null>> => {
  return new Promise((resolve, reject) =>
    client.mget(...args, (err, els) => {
      err && reject(err);
      resolve(els);
    })
  );
};

export { client, redisGetAsync, redisMGetAsync, redisSetAsync };
