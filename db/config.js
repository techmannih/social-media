const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.dbURL, {
      // useNewUrlParser: true,
      // useCreateIndex: true,
      // useUnifiedTopology: true
    });
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};

module.exports = connectDB;
// const mongoose = require("mongoose");
// require('dotenv').config();

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.dbURL, {
//       // useNewUrlParser: true,
//       // useCreateIndex: true,
//       // useUnifiedTopology: true
//     });
//     console.log("Database connected successfully");
//   } catch (err) {
//     console.error("Database connection failed:", err.message);
//   }
// };

// module.exports = connectDB;
