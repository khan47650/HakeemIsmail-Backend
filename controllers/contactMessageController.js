const ContactMessage = require("../models/ContactMessage");
const sendEmail = require("../utils/sendEmail");

exports.createMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                message: "Name, email and message are required",
            });
        }

        const newMessage = await ContactMessage.create({
            name,
            email,
            message,
        });

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.replyMessage = async (req, res) => {
    try {
        const { reply } = req.body;

        if (!reply) {
            return res.status(400).json({ message: "Reply is required" });
        }

        const message = await ContactMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.7;">
        <h2>Reply from Hakeem Ismail</h2>
        <p>${reply}</p>
        <hr />
        <p><strong>Your Message:</strong></p>
        <p>${message.message}</p>
      </div>
    `;

        const emailSent = await sendEmail(
            message.email,
            "Reply from Hakeem Ismail",
            html
        );

        if (!emailSent) {
            return res.status(500).json({
                message: "Reply not saved and email not sent",
            });
        }

        message.reply = reply;
        message.isReplied = true;
        message.repliedAt = new Date();

        await message.save();

        res.json({
            message: "Reply sent successfully",
            data: message,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        await ContactMessage.findByIdAndDelete(req.params.id);

        res.json({ message: "Message deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAllMessages = async (req, res) => {
    try {
        await ContactMessage.deleteMany({});

        res.json({ message: "All messages deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};