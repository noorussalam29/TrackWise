const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const tasksRoutes = require('./routes/tasks.routes');
const employeesRoutes = require('./routes/employees.routes');
const reportsRoutes = require('./routes/reports.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL], 
  credentials: true 
}));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(limiter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;
