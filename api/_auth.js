import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'breakfast-duty-secret-key-2024';

export const authenticateToken = (req, res, handler) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    return handler(req, res);
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const createToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};
