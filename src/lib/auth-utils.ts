import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export function generateAuthTokens(email: string): AuthTokens {
  const payload = { 
    email, 
    isAdmin: true,
    iat: Math.floor(Date.now() / 1000)
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return {
    token,
    refreshToken,
    expiresAt: expiresAt.toISOString()
  };
}

export function verifyToken(token: string): { email: string; isAdmin: boolean } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      email: decoded.email,
      isAdmin: decoded.isAdmin
    };
  } catch {
    return null;
  }
}
