import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fitgen-ai-super-secret-key-change-in-production';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function extractTokenFromCookies(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookieStr) => {
    const parts = cookieStr.split('=');
    const key = parts[0]?.trim();
    const val = parts[1]?.trim();
    if (key && val) {
      acc[key] = decodeURIComponent(val);
    }
    return acc;
  }, {} as Record<string, string>);

  return cookies['token'] || null;
}

export function getUserFromRequest(req: Request): { userId: string; email: string } | null {
  const token = extractTokenFromCookies(req) || extractTokenFromHeader(req);
  if (!token) return null;
  return verifyToken(token);
}
