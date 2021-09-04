import { Socket } from 'socket.io';

import { Event } from '../models/event';
import { User } from '../models/user';

export interface IAuthPayload {
  userId: number;
  username: string;
  role: string;
  rolePermission: number;
  iat: number;
  exp: number;
}

export interface ISocketWithData extends Socket {
  jwt: IAuthPayload;
  user: User;
  event?: Event;
}
