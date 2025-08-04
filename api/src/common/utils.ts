import { Request } from 'express';
import ShortUniqueId from 'short-unique-id';
import { JwtPayload } from '~/core/auth/dto/auth.response';

/**
 * Extends the Express Request interface to include a `user` property of type `JwtPayload`.
 * This is useful for accessing the authenticated user's information in request handlers.
 */
export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export const generateUniqueId = (length: number) => {
  const uid = new ShortUniqueId({ length });
  return uid.rnd();
};
