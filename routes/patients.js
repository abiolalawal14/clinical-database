// routes/patients.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Create patient
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender } = req.body;
    const [result] = await db.execute(
      `INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, date_of_birth, gender]
    );
    const insertedId = result.insertId;
    const [rows] = await db.execute('SELECT * FROM patients WHERE patient_id = ?', [insertedId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Read all patients (with pagination optional)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM patients ORDER BY last_name LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Read single patient
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM patients WHERE patient_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Patient not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender } = req.body;
    await db.execute(
      `UPDATE patients SET first_name=?, last_name=?, email=?, phone=?, date_of_birth=?, gender=? WHERE patient_id = ?`,
      [first_name, last_name, email, phone, date_of_birth, gender, req.params.id]
    );
    const [rows] = await db.execute('SELECT * FROM patients WHERE patient_id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM patients WHERE patient_id = ?', [req.params.id]);
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
