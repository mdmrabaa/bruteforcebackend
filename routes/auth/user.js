const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

router.post('/', upload.single('photo'), async (req, res) => {
  console.log('REGISTER CALLED');
  const { firstName, lastName, username, email, gender, phoneNumber, password, role } = req.body;
  console.log("Registering user:", req.body);
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      gender,
      phoneNumber,
      role,
      password: hashedPassword,
      photo: req.file ? req.file.path : null
    });

    await newUser.save();

    res.status(200).json({
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      username: newUser.username,
      email: newUser.email,
      gender: newUser.gender,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

module.exports = router;
