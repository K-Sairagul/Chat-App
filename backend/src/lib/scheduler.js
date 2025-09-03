import cron from "node-cron";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "./socket.js";

// Run every minute to check for scheduled messages
cron.schedule("* * * * *", async () => {
  const now = new Date();
  try {
    const messages = await Message.find({
      scheduledFor: { $lte: now },
      delivered: false,
    });

    for (let msg of messages) {
      const receiverSocketId = getReceiverSocketId(msg.receiverId.toString());

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", msg);
      }

      msg.delivered = true;
      await msg.save();

      console.log("Delivered scheduled message:", msg.text);
    }
  } catch (err) {
    console.error("Scheduler error:", err);
  }
});
