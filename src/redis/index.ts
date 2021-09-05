import { createClient } from 'redis';

import Redis from 'ioredis';
import util from 'util';

const client = createClient('redis://127.0.0.1');
const redis = new Redis('redis://127.0.0.1');

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

export { client, redis, redisGetAsync, redisMGetAsync, redisSetAsync };
