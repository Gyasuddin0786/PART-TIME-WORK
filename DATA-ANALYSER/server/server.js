const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoute = require("./routes/authRoute");
const uploadRoute = require("./routes/uploadRoute");

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRoute);
app.use(uploadRoute);

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/lead-analyser";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => console.error("MongoDB error:", err.message));
