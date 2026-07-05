const Message = require("../models/sendmessagemodel");
const Contact = require("../models/messagemodel");

const onlineUsers = new Map();

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    socket.on("send_message", async (message) => {
      if (message.deleteMessageId) {
        try {
          await Message.deleteOne({ _id: message.deleteMessageId });
        } catch (err) {
          console.error("Error deleting message in socket:", err);
        }
      } else if (message.markRead) {
        try {
          await Message.updateMany(
            {
              sender: message.receiverId,
              receiver: message.senderId,
              read: false,
            },
            { $set: { read: true } },
          );
        } catch (err) {
          console.error("Error marking messages as read in socket:", err);
        }
      } else {
        try {
          const senderId = message.senderId;
          const receiverId = message.receiverId;

          if (senderId && receiverId) {
            // Check if contact threads exist for both, if not create them!
            const senderContactExists = await Contact.findOne({
              userId: senderId,
              contactId: receiverId,
            });
            if (!senderContactExists) {
              await Contact.create({ userId: senderId, contactId: receiverId });
            }

            const receiverContactExists = await Contact.findOne({
              userId: receiverId,
              contactId: senderId,
            });
            if (!receiverContactExists) {
              await Contact.create({ userId: receiverId, contactId: senderId });
            }

            // Save or Update Message in MongoDB
            if (message.edited) {
              await Message.findByIdAndUpdate(message.id, {
                text: message.text,
                images: message.images,
                edited: true,
              });
            } else {
              await Message.create({
                _id: message.id,
                sender: senderId,
                receiver: receiverId,
                text: message.text || "",
                images: message.images || [],
                read: message.read || false,
                edited: message.edited || false,
              });
            }
          }
        } catch (err) {
          console.error("Error saving message/contact in socket:", err);
        }
      }

      const receiverSocketId = onlineUsers.get(message.receiverId);
      if (receiverSocketId) {
        // Send chat message
        io.to(receiverSocketId).emit("receive_message", message);

        // Send notification (only for normal messages)
        if (!message.markRead && !message.deleteMessageId && !message.edited) {
          io.to(receiverSocketId).emit("notification", {
            id: message.id,
            senderId: message.senderId,
            senderName: message.senderName,
            senderImage: message.senderImage,
            text: message.text,
            time: message.time,
          });
        }
      }

      socket.emit("receive_message", message);
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      console.log("Disconnected:", socket.id);
    });
  });
};

module.exports = {
  initializeSocket,
  onlineUsers,
};
