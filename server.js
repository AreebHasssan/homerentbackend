const dotenv = require("dotenv");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

const { initializeSocket } = require("./common/controllers/socketcontoller");

dotenv.config();

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error);
  });

const Port = process.env.PORT || 5000;

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Initialize socket events
initializeSocket(io);

// Middleware to attach io to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", require("./auth/routes/authroute"));
app.use("/api/profile", require("./common/routes/profileroutes"));
app.use("/api/postproperty", require("./propertyowner/routes/postroute"));
app.use("/api/contact", require("./common/routes/messageroute"));
app.use("/api/report", require("./common/routes/issueroute"));
app.use("/api/renter", require("./renter/routes/getpropertyroute"));
app.use("/api/renter", require("./renter/routes/rentroute"));
app.use("/api/bookmark", require("./renter/routes/bookmarkroute"));

// Start server
server.listen(Port, "0.0.0.0", () => {
  console.log(`Server is running on port ${Port}`);
});

module.exports = { app, io };
