const express = require("express");
const connectDB = require("./db/config");
const cors = require("cors");
const app = express();
require("dotenv").config();
const authRoutes=require("./routes/userRoutes")
const PostRoutes=require("./routes/postRoutes")

// variables
const PORT = process.env.PORT || 8888;

// connectDB
connectDB();
app.use(cors());

// routes
app.get("/", (req, res) => {
  res.send("server running");
});



app.use(express.json());
app.use(authRoutes);
app.use(PostRoutes);

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});