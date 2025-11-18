require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'trackwise' });
  const existing = await User.findOne({ email: 'admin@trackwise.local' });
  if (existing) return console.log('Admin already exists');
  const hash = await bcrypt.hash('Password123!', 10);
  await User.create({ name: 'Admin', email: 'admin@trackwise.local', passwordHash: hash, role: 'admin' });
  console.log('Seeded admin user');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
