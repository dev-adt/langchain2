import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as { userId: string };
  } catch {
    return null;
  }
};
