import bcrypt from 'bcryptjs';
import { db } from './_db.js';

export const initializeAdmin = () => {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = db.findAdminByUsername(adminUsername);

  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    db.createAdmin(adminUsername, hashedPassword);
    console.log('Default admin user created');
  }
};
