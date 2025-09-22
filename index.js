// index.js
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const patientsRouter = require('./routes/patients');
const appointmentsRouter = require('./routes/appointments');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({ message: 'Clinic API running' });
});

app.use('/api/patients', patientsRouter);
app.use('/api/appointments', appointmentsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
