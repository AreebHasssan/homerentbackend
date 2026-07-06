const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

const { initializeSocket } = require("./common/controllers/socketcontoller");

dotenv.config();

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

initializeSocket(io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", require("./auth/routes/authroute"));
app.use("/api/profile", require("./common/routes/profileroutes"));
app.use("/api/postproperty", require("./propertyowner/routes/postroute"));
app.use("/api/contact", require("./common/routes/messageroute"));
app.use("/api/report", require("./common/routes/issueroute"));
app.use("/api/renter", require("./renter/routes/getpropertyroute"));
app.use("/api/renter", require("./renter/routes/rentroute"));
app.use("/api/bookmark", require("./renter/routes/bookmarkroute"));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, io };
