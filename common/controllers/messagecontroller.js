const Auth = require("../../auth/models/authmodel");
const Profile = require("../../common/models/profilemodel");
const Contact = require("../models/messagemodel");
const Message = require("../models/sendmessagemodel");

const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;

    const users = await Auth.find({
      _id: { $ne: req.user.id },
      $or: [
        { name: { $regex: search || "", $options: "i" } },
        { email: { $regex: search || "", $options: "i" } },
      ],
    }).select("name email memberSince");

    const result = await Promise.all(
      users.map(async (user) => {
        const profile = await Profile.findOne({ userId: user._id });

        return {
          id: user._id,
          username: user.name, // because your field is "name"
          email: user.email,
          memberSince: user.memberSince,
          image: profile?.image || "",
          about: profile?.about || "",
        };
      }),
    );

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const addContact = async (req, res) => {
  try {
    const { contactId } = req.body;

    const userId = req.user.id;

    if (userId == contactId) {
      return res.status(400).json({
        message: "You cannot add yourself",
      });
    }

    const alreadyAdded = await Contact.findOne({
      userId,
      contactId,
    });

    if (alreadyAdded) {
      return res.status(400).json({
        message: "Already added",
      });
    }

    await Contact.create({
      userId,
      contactId,
    });

    res.status(201).json({
      message: "Contact Added",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.id;

    const removed = await Contact.findOneAndDelete({
      userId,
      contactId,
    });

    if (!removed) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }

    res.status(200).json({
      message: "Contact deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({
      userId: req.user.id,
    });

    const result = await Promise.all(
      contacts.map(async (contact) => {
        try {
          const user = await Auth.findById(contact.contactId);
          if (!user) {
            // Clean up stale contact
            await Contact.deleteOne({ _id: contact._id });
            return null;
          }
          const profile = await Profile.findOne({
            userId: contact.contactId,
          });
          return {
            id: user._id,
            username: user.name,
            email: user.email,
            memberSince: user.memberSince,
            image: profile?.image || "",
            about: profile?.about || "",
          };
        } catch (err) {
          console.error("Error processing contact:", err);
          return null;
        }
      }),
    );

    // Filter out nulls
    const filteredResult = result.filter((c) => c !== null);

    res.status(200).json(filteredResult);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partnerId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    const formattedMessages = await Promise.all(
      messages.map(async (msg) => {
        const senderUser = await Auth.findById(msg.sender);
        const senderProfile = await Profile.findOne({ userId: msg.sender });

        return {
          id: msg._id,
          senderId: msg.sender,
          receiverId: msg.receiver,
          text: msg.text,
          images: msg.images,
          read: msg.read,
          edited: msg.edited,
          time: msg.createdAt,
          senderName: senderUser?.name || "Unknown User",
          senderImage: senderProfile?.image || "",
        };
      }),
    );

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadOnly = req.query.unread === "true";
    const toastOnly = req.query.toast === "true";

    let query = {};
    if (unreadOnly) {
      if (toastOnly) {
        query = { receiver: userId, read: false, toastDismissed: false };
      } else {
        query = { receiver: userId, read: false };
      }
    } else {
      query = { receiver: userId };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(1000);

    const formatted = await Promise.all(
      messages.map(async (msg) => {
        const senderUser = await Auth.findById(msg.sender);
        const senderProfile = await Profile.findOne({ userId: msg.sender });

        return {
          id: msg._id,
          senderId: msg.sender,
          senderName: senderUser?.name || "Unknown",
          senderImage: senderProfile?.image || "",
          text: msg.text || "",
          time: msg.createdAt,
          read: msg.read || false,
        };
      }),
    );

    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const ids = Array.isArray(req.body?.ids) ? req.body.ids : null;

    if (ids && ids.length > 0) {
      await Message.updateMany(
        { _id: { $in: ids }, receiver: userId },
        { $set: { read: true } },
      );
    } else {
      await Message.updateMany(
        { receiver: userId, read: false },
        { $set: { read: true } },
      );
    }

    res.status(200).json({ message: "Notifications marked read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const dismissNotificationToast = async (req, res) => {
  try {
    const userId = req.user.id;
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : null;

    if (ids && ids.length > 0) {
      await Message.updateMany(
        { _id: { $in: ids }, receiver: userId },
        { $set: { toastDismissed: true } },
      );
    }

    res.status(200).json({ message: "Notification toasts marked dismissed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const removed = await Message.findOneAndDelete({
      _id: notificationId,
      receiver: userId,
    });

    if (!removed) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  searchUsers,
  addContact,
  getContacts,
  deleteContact,
  getMessages,
  getNotifications,
  markNotificationsRead,
  dismissNotificationToast,
  deleteNotification,
};
