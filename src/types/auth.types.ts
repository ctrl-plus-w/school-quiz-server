import { Socket } from 'socket.io';

import { User } from '../models/user';

export interface IAuthPayload {
  userId: number;
  username: string;
  role: string;
  rolePermission: number;
  iat: number;
  exp: number;
}

export interface ISocketWithJWT extends Socket {
  jwt: IAuthPayload;
  user: User;
}
