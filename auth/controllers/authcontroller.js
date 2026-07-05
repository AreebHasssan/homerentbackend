const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const user = require("../models/authmodel");
const register = async (req, res) => {
  const { name, email, password, role, memberSince } = req.body;
  try {
    const exitinguser = await user.findOne({ email: email });
    if (exitinguser) {
      return res.status(400).json({
        message: "This email already exists",
      });
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const newuser = await user.create({
      name: name,
      email: email,
      password: hashedpassword,
      role: role || "property-owner",
      memberSince: memberSince || new Date().toLocaleDateString("en-GB"),
    });

    const token = jwt.sign(
      {
        id: newuser._id,
        role: newuser.role,
        name: newuser.name,
        email: newuser.email,
      },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
      { expiresIn: "4h" },
    );

    const safeUser = {
      id: newuser._id,
      name: newuser.name,
      email: newuser.email,
      role: newuser.role,
      memberSince: newuser.memberSince,
    };

    const isProduction = process.env.NODE_ENV === "production";

    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 4 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "User registered successfully",
        token,
        user: safeUser,
      });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const exitinguser = await user.findOne({ email: email });
    if (!exitinguser) {
      return res.status(400).json({
        message: "The user with this email does not exist",
      });
    }
    const matchpassword = await bcrypt.compare(password, exitinguser.password);

    if (!matchpassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        id: exitinguser._id,
        role: exitinguser.role,
        name: exitinguser.name,
        email: exitinguser.email,
      },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
      { expiresIn: "4h" },
    );
    const isProduction = process.env.NODE_ENV === "production";

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 4 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Logged in successfully",
        token,
        user: {
          id: exitinguser._id,
          name: exitinguser.name,
          email: exitinguser.email,
          role: exitinguser.role,
          memberSince: exitinguser.memberSince,
          about: exitinguser.about || "",
        },
      });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || "Server error during login",
    });
  }
};

const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res
    .clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  let token = authHeader.replace("Bearer ", "");

  if (!token && req.cookies) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }
};

const changepassword = async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  try {
    const userId = req.user.id;
    const exitinguser = await user.findOne({ _id: userId });
    if (!exitinguser) {
      return res.status(400).json({
        message: "user not found",
      });
    }
    const matchedpassword = await bcrypt.compare(
      oldpassword,
      exitinguser.password,
    );
    if (!matchedpassword) {
      return res.status(400).json({
        message: "old password incorrect",
      });
    }
    const hashedpassword = await bcrypt.hash(newpassword, 10);
    exitinguser.password = hashedpassword;
    await exitinguser.save();
    res.status(200).json({
      message: "password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "server error",
    });
  }
};

const deleteaccount = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userId = req.user.id;

    const existingUser = await user.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (existingUser.email !== email) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if (!matchPassword) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    await user.findByIdAndDelete(userId);

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateDarkMode = async (req, res) => {
  try {
    const { darkMode } = req.body;

    const updatedUser = await user.findByIdAndUpdate(
      req.user.id,
      { darkMode },
      { new: true },
    );

    res.status(200).json({
      success: true,
      darkMode: updatedUser.darkMode,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;

    const updatedUser = await user.findByIdAndUpdate(
      req.user.id,
      { language },
      { new: true },
    );

    res.status(200).json({
      success: true,
      language: updatedUser.language,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
module.exports = {
  updateDarkMode,
  updateLanguage,
  deleteaccount,
  logoutUser,
  authMiddleware,
  register,
  login,
  changepassword,
};
