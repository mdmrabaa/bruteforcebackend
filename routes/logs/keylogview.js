
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET /key/view
router.get('/', async (req, res) => {
  try {
    const logPath = path.join(__dirname, '../../logs/keys.txt');

    if (!fs.existsSync(logPath)) return res.status(404).send('Log file not found.');

    const data = fs.readFileSync(logPath, 'utf8');

    // Optionally split by line
    const logs = data.split('\n').filter(line => line.trim() !== '');

    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error reading logs:', error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
