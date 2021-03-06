import { Request, Response, NextFunction } from 'express';

import StatusError from '../classes/StatusError';

/* ! Keep the next parameter in the function, because it does't work otherwise,
   it looks like the middlware do things differently depending on the number 
   of arguments.
*/

export default async (err: StatusError | Error, _req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log(err);
  if (err instanceof StatusError) {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'An error happened !' });
  }
};
