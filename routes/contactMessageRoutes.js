const express = require("express");
const router = express.Router();

const {
    createMessage,
    getMessages,
    replyMessage,
    deleteMessage,
    deleteAllMessages,
} = require("../controllers/contactMessageController");

router.post("/", createMessage);
router.get("/", getMessages);
router.post("/reply/:id", replyMessage);
router.delete("/delete-all", deleteAllMessages);
router.delete("/:id", deleteMessage);

module.exports = router;