require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const Student = require('./models/Student');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5008;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/students', studentRoutes);

// Health Check / Welcome route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Q8 Student CRUD API running with Sequelize',
    endpoints: {
      getAllStudents: 'GET /api/students',
      getStudentById: 'GET /api/students/:id',
      createStudent: 'POST /api/students',
      updateStudent: 'PUT /api/students/:id',
      deleteStudent: 'DELETE /api/students/:id'
    }
  });
});

// Database Synchronization & Server Startup
sequelize.sync()
  .then(async () => {
    console.log('Database & tables synchronized via Sequelize!');

    // Seed sample data if table is empty
    const count = await Student.count();
    if (count === 0) {
      console.log('Seeding initial student records...');
      await Student.bulkCreate([
        { rollNo: 'CS101', name: 'Rohan Sharma', email: 'rohan.sharma@college.edu', course: 'Computer Engineering', semester: 7, cpi: 8.75 },
        { rollNo: 'CS102', name: 'Priya Patel', email: 'priya.patel@college.edu', course: 'Information Technology', semester: 5, cpi: 9.20 },
        { rollNo: 'CS103', name: 'Aarav Mehta', email: 'aarav.mehta@college.edu', course: 'Computer Engineering', semester: 3, cpi: 7.90 }
      ]);
      console.log('Initial sample students seeded successfully!');
    }

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Q8 Student CRUD Server running on port ${PORT}`);
      console.log(` API Endpoint: http://localhost:${PORT}/api/students`);
      console.log(` Database: SQLite via Sequelize`);
      console.log(`===============================================`);
    });
  })
  .catch((err) => {
    console.error('Sequelize sync error:', err);
  });
