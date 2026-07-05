const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../../auth/controllers/authcontroller");

const {
  searchUsers,
  addContact,
  getContacts,
  deleteContact,
  getMessages,
  getNotifications,
  markNotificationsRead,
  dismissNotificationToast,
  deleteNotification,
} = require("../controllers/messagecontroller");

// Search all registered users
router.get("/search", authMiddleware, searchUsers);

// Add a contact
router.post("/add", authMiddleware, addContact);

// Get all contacts of the logged-in user
router.get("/", authMiddleware, getContacts);

// Get messages for a contact
router.get("/messages/:partnerId", authMiddleware, getMessages);

// Get unread notifications for current user
router.get("/notifications", authMiddleware, getNotifications);

// Mark notifications as read
router.post("/notifications/mark-read", authMiddleware, markNotificationsRead);

// Dismiss notification toast
router.post(
  "/notifications/dismiss-toast",
  authMiddleware,
  dismissNotificationToast,
);

// Delete a notification permanently
router.delete("/notifications/:id", authMiddleware, deleteNotification);

// Delete a contact
router.delete("/:contactId", authMiddleware, deleteContact);

module.exports = router;
