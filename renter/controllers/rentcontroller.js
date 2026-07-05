const Auth = require("../../auth/models/authmodel");
const Profile = require("../../common/models/profilemodel");
const Message = require("../../common/models/sendmessagemodel");
const { onlineUsers } = require("../../common/controllers/socketcontoller");

const sendRentRequest = async (req, res) => {
  try {
    const renterId = req.user.id;
    const { ownerId, propertyId, propertyTitle } = req.body;

    if (!ownerId || !propertyId) {
      return res.status(400).json({
        success: false,
        message: "Owner ID and Property ID are required",
      });
    }

    const renterUser = await Auth.findById(renterId);
    if (!renterUser) {
      return res.status(404).json({
        success: false,
        message: "Renter not found",
      });
    }

    const renterEmail = renterUser.email;
    const renterName = renterUser.name;

    const notificationText = `${renterName} (${renterEmail}) is interested in your property "${propertyTitle}". You can contact them in chat.`;

    const notification = await Message.create({
      sender: renterId,
      receiver: ownerId,
      text: notificationText,
      propertyId,
      type: "rent-request",
      read: false,
      toastDismissed: false,
      createdAt: new Date(),
    });

    // Emit real-time notification via socket.io
    const ownerSocketId = onlineUsers.get(ownerId);
    if (ownerSocketId && req.io) {
      req.io.to(ownerSocketId).emit("notification", {
        id: notification._id,
        senderId: renterId,
        senderName: renterName,
        senderEmail: renterEmail,
        text: notificationText,
        type: "rent-request",
        time: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: "Rental request sent successfully",
      notification,
    });
  } catch (error) {
    console.error("Send rent request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { sendRentRequest };
