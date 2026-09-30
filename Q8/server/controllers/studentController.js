const Student = require('../models/Student');

// GET all students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: students.length, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single student by ID
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE a new student
const createStudent = async (req, res) => {
  try {
    const { rollNo, name, email, course, semester, cpi } = req.body;

    if (!rollNo || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Roll number, name, and email are required.'
      });
    }

    // Check if rollNo already exists
    const existing = await Student.findOne({ where: { rollNo: rollNo.trim() } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Student with Roll No ${rollNo} already exists.`
      });
    }

    const student = await Student.create({
      rollNo: rollNo.trim(),
      name: name.trim(),
      email: email.trim(),
      course: course ? course.trim() : 'Computer Engineering',
      semester: parseInt(semester) || 1,
      cpi: parseFloat(cpi) || 8.0
    });

    res.status(201).json({ success: true, message: 'Student created successfully.', student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE an existing student
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const { rollNo, name, email, course, semester, cpi } = req.body;

    // Check duplicate rollNo if changing rollNo
    if (rollNo && rollNo.trim() !== student.rollNo) {
      const duplicate = await Student.findOne({ where: { rollNo: rollNo.trim() } });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Roll No ${rollNo} is already used by another student.`
        });
      }
    }

    await student.update({
      rollNo: rollNo ? rollNo.trim() : student.rollNo,
      name: name ? name.trim() : student.name,
      email: email ? email.trim() : student.email,
      course: course ? course.trim() : student.course,
      semester: semester !== undefined ? parseInt(semester) : student.semester,
      cpi: cpi !== undefined ? parseFloat(cpi) : student.cpi
    });

    res.json({ success: true, message: 'Student updated successfully.', student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE a student
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    await student.destroy();
    res.json({ success: true, message: `Student ${student.rollNo} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
