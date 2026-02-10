// In connect.js
const mongoose = require('mongoose');

const connect = () => {
  mongoose.connect("mongodb+srv://mdmrabaa:LE5bFDJq4V8Gb6vV@cluster0.l1amjfv.mongodb.net/")
    .then(() => console.log(`Database connected successfully`))
    .catch((err) => {
        console.log(err);
      }
)};

module.exports = connect;

