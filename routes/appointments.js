// routes/appointments.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Create appointment
router.post('/', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_datetime, duration_minutes, status, notes } = req.body;
    // Basic check: patient & doctor exist
    const [p] = await db.execute('SELECT patient_id FROM patients WHERE patient_id = ?', [patient_id]);
    if (!p.length) return res.status(400).json({ error: 'Invalid patient_id' });
    const [d] = await db.execute('SELECT doctor_id FROM doctors WHERE doctor_id = ?', [doctor_id]);
    if (!d.length) return res.status(400).json({ error: 'Invalid doctor_id' });

    const [result] = await db.execute(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, duration_minutes, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, appointment_datetime, duration_minutes || 30, status || 'Scheduled', notes]
    );
    const [rows] = await db.execute('SELECT * FROM appointments WHERE appointment_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    // If unique constraint violation (double booking), return friendly message
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Doctor already has an appointment at this time (double booking)' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Get all appointments (recent)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.*, p.first_name AS patient_first, p.last_name AS patient_last,
              d.first_name AS doctor_first, d.last_name AS doctor_last
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       JOIN doctors d ON a.doctor_id = d.doctor_id
       ORDER BY appointment_datetime DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get appointment by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM appointments WHERE appointment_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_datetime, duration_minutes, status, notes } = req.body;
    await db.execute(
      `UPDATE appointments SET patient_id=?, doctor_id=?, appointment_datetime=?, duration_minutes=?, status=?, notes=?
       WHERE appointment_id = ?`,
      [patient_id, doctor_id, appointment_datetime, duration_minutes, status, notes, req.params.id]
    );
    const [rows] = await db.execute('SELECT * FROM appointments WHERE appointment_id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Doctor already has an appointment at this time (double booking)' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM appointments WHERE appointment_id = ?', [req.params.id]);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
