const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auction');
app.use('/api/auth', authRoutes);
app.use('/api/auction', auctionRoutes);

app.listen(5000, () => console.log("Server running on 5000"));
