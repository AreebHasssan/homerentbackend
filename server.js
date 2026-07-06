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

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://home-rent-app-hytn.vercel.app",
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  process.env.VITE_API_URL,
].filter(Boolean);

const normalizeOrigin = (origin) => {
  if (!origin) return null;
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
};

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;
  if (allowedOrigins.includes(normalizedOrigin)) return true;

  return (
    /https:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(normalizedOrigin) ||
    /https:\/\/([a-z0-9-]+\.)*railway\.app$/i.test(normalizedOrigin)
  );
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, origin || true);
    } else {
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "Expires",
    "Pragma",
    "Cookie",
    "Origin",
    "Accept",
  ],
  credentials: true,
};

const applyCorsHeaders = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = isAllowedOrigin(origin) ? origin || "*" : null;

  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Cache-Control, Expires, Pragma, Cookie, Origin, Accept",
    );
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
};

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
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

app.use(applyCorsHeaders);
app.use(cors(corsOptions));

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
