const express = require("express");

const app = express();

// variables
const PORT = process.env.PORT || 8888;

// routes
app.get("/", (req, res) => {
  res.send("server running");
});

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});
