export interface IAuthPayload {
  userId: number;
  username: string;
  role: string;
  rolePermission: number;
  iat: number;
  exp: number;
}
