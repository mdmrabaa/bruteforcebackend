// In connect.js
const mongoose = require('mongoose');

const connect = () => {
  mongoose.connect("mongodb+srv://mdmrabaa:dWqgu4uuKheweyxG@cluster0.l1amjfv.mongodb.net/")
    .then(() => console.log(`Database connected successfully`))
    .catch((err) => {
        console.log(err);
      }
)};

module.exports = connect;

