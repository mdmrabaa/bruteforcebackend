const express = require('express');
const http = require('http');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Database connection
const connectDatabase = require('./config/connect');
connectDatabase();

// Routes
const userrouter = require('./routes/auth/user');
const loginrouter = require('./routes/auth/login');
// Create an Express app
const app = express();
const port = 3100;

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('JWT_SECRET:', process.env.JWT_SECRET); // Debug log to verify env variable

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:300, // Limit each IP to 300 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to specific routes
app.use('/login', limiter);
app.use('/register', limiter);

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }

    req.user = decoded; // Add the decoded JWT to req.user
    next();
  });
};

// CORS configuration
const allowedOrigins = [
  'https://ubcgtubcgt.netlify.app',
  'http://localhost:4200',
  'http://192.168.1.30:19006',
  'http://localhost:8081',
  'https://loxuryabackend.onrender.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
};

app.use(cors(corsOptions));

// Routes

app.use('/login', loginrouter);
app.use('/register', userrouter);


// Serve static files
app.use('/uploads', express.static('uploads'));

// Create HTTP server
const server = http.createServer(app);
// 404 handler
app.get('*', (req, res) => {
  res.status(404).send('Not Found');
});

// Start the server
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = { app };
