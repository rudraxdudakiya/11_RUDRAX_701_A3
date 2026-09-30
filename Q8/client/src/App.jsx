import React, { useState, useEffect } from 'react';

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const initialForm = {
    rollNo: '',
    name: '',
    email: '',
    course: 'Computer Engineering',
    semester: '1',
    cpi: '8.0'
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchStudents();
  }, []);

  // READ: Fetch all students from Express + Sequelize backend
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Form change handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // CREATE or UPDATE Student
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');

    if (!formData.rollNo.trim() || !formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in Roll No, Name, and Email.');
      return;
    }

    try {
      if (editingId) {
        // UPDATE existing student (PUT)
        const res = await fetch(`/api/students/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();

        if (data.success) {
          setStatusMessage(`Student ${data.student.rollNo} updated successfully!`);
          setEditingId(null);
          setFormData(initialForm);
          fetchStudents();
        } else {
          alert(data.message || 'Failed to update student.');
        }
      } else {
        // CREATE new student (POST)
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();

        if (data.success) {
          setStatusMessage(`Student ${data.student.rollNo} added successfully!`);
          setFormData(initialForm);
          fetchStudents();
        } else {
          alert(data.message || 'Failed to add student.');
        }
      }
    } catch (err) {
      alert('Submission error: ' + err.message);
    }
  };

  // Start editing a student
  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      rollNo: student.rollNo,
      name: student.name,
      email: student.email,
      course: student.course || 'Computer Engineering',
      semester: String(student.semester || 1),
      cpi: String(student.cpi || 8.0)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  // DELETE Student
  const handleDelete = async (id, rollNo) => {
    if (!window.confirm(`Are you sure you want to delete student with Roll No "${rollNo}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage(`Student ${rollNo} deleted.`);
        if (editingId === id) {
          handleCancelEdit();
        }
        fetchStudents();
      } else {
        alert(data.message || 'Failed to delete student.');
      }
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  };

  // Filtered list by search term
  const filteredStudents = students.filter(
    (s) =>
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Question 8: Student CRUD Application</h1>
      <p>
        Technology Stack: <strong>Express.js</strong> + <strong>Sequelize ORM</strong> + <strong>React.js (Vite)</strong> (No CSS).
      </p>

      {statusMessage && (
        <div>
          <p><strong>Status: {statusMessage}</strong></p>
        </div>
      )}

      <hr />

      {/* FORM: CREATE / UPDATE */}
      <div>
        <h2>{editingId ? 'Edit Student Details' : 'Add New Student'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="rollNo">Roll Number: </label>
            <input
              type="text"
              id="rollNo"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              placeholder="e.g. CS104"
              required
            />
          </div>
          <br />

          <div>
            <label htmlFor="name">Full Name: </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ananya Desai"
              required
            />
          </div>
          <br />

          <div>
            <label htmlFor="email">Email Address: </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. ananya@college.edu"
              required
            />
          </div>
          <br />

          <div>
            <label htmlFor="course">Course / Department: </label>
            <select
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
            >
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>
          <br />

          <div>
            <label htmlFor="semester">Semester: </label>
            <input
              type="number"
              id="semester"
              name="semester"
              min="1"
              max="8"
              value={formData.semester}
              onChange={handleChange}
              required
            />
          </div>
          <br />

          <div>
            <label htmlFor="cpi">CPI / Grade: </label>
            <input
              type="number"
              step="0.01"
              id="cpi"
              name="cpi"
              min="0"
              max="10"
              value={formData.cpi}
              onChange={handleChange}
              required
            />
          </div>
          <br />

          <button type="submit">
            {editingId ? 'Update Student' : 'Add Student'}
          </button>
          &nbsp;&nbsp;
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <hr />

      {/* TABLE: READ & DELETE / EDIT */}
      <div>
        <h2>Student Records List ({filteredStudents.length})</h2>

        <div>
          <label htmlFor="search">Search Students: </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Roll No, Name, or Course..."
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')}>
              Clear
            </button>
          )}
        </div>
        <br />

        {loading ? (
          <p>Loading students from Sequelize database...</p>
        ) : filteredStudents.length === 0 ? (
          <p>No student records found. Add one using the form above.</p>
        ) : (
          <table border="1" cellPadding="6" cellSpacing="0">
            <thead>
              <tr>
                <th>#</th>
                <th>Roll No</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Semester</th>
                <th>CPI</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, index) => (
                <tr key={s.id}>
                  <td>{index + 1}</td>
                  <td><strong>{s.rollNo}</strong></td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.course}</td>
                  <td>{s.semester}</td>
                  <td>{s.cpi ? Number(s.cpi).toFixed(2) : 'N/A'}</td>
                  <td>
                    <button type="button" onClick={() => handleEdit(s)}>
                      Edit
                    </button>
                    &nbsp;
                    <button type="button" onClick={() => handleDelete(s.id, s.rollNo)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <hr />
      <div>
        <p>
          <small>
            Sequelize Model: <code>Student (rollNo, name, email, course, semester, cpi)</code> • Database: SQLite (Zero Setup)
          </small>
        </p>
      </div>
    </div>
  );
}
