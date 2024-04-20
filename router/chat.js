const express = require("express");
const { route } = require("./shop");
const chatControoler = require("../controllers/chat");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
router.get("/chat", isAuth, chatControoler.getChat);

router.get("/chatwith/:userpostId", isAuth, chatControoler.getCreateChat);

router.post("/chatwith/:chatWithId", chatControoler.postChatWith);

module.exports = router;
