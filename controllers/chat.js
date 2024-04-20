const Chat = require("../model/chat");
const Message = require("../model/message");
const user = require("../model/user");
const socket = require("../socket");
const User = require("../model/user");
const util = require("../util/main");
const io = require("../socket");
exports.getChat = async (req, res, next) => {
  let userChat = await Chat.find({ users: req.user._id }).populate("users");

  console.log(userChat);

  let arrChat = [];
  for (let i = 0; i < userChat.length; i++) {
    for (let j = 0; j <= 1; j++) {
      if (userChat[i].users[j]._id.toString() !== req.user._id.toString()) {
        arrChat.push(userChat[i].users[j]);
      }
    }
  }

  // console.log(arrChat)
  // console.log(arrChat);
  // console.log(userChat);

  return res.render("shop/chat", {
    chatWith: {
      _id: "",
    },
    userChat: arrChat,
    message: [],
    chatId: "",
  });
};

exports.getCreateChat = async (req, res, next) => {
  const userPostId = req.params.userpostId;
  const userId = req.user._id.toString();

  let userChat = await Chat.find({ users: req.user._id }).populate("users");

  let arrChat = [];
  for (let i = 0; i < userChat.length; i++) {
    for (let j = 0; j <= 1; j++) {
      if (userChat[i].users[j]._id.toString() !== req.user._id.toString()) {
        arrChat.push(userChat[i].users[j]);
      }
    }
  }
  console.log(arrChat);
  // arrChat.filter((item) => item._id.toString !== userPostId.toString());

  const chatWith = await User.findById(userPostId);

  const isChat = await Chat.findOne({
    $and: [{ users: req.user._id }, { users: userPostId }],
  }).populate("users");

  
  let message = [];

  if (isChat) {
    message = await Message.find({ chat: isChat._id }).populate("sender");
    message.forEach((item) => {
      item.timeChat = util.getDate(item.time, true);
    });
    return res.render("shop/chat", {
      chatWith: chatWith,
      userChat: arrChat,
      message: message,
      chatId: isChat._id,
    });
  } else {
    const chat = new Chat({
      users: [userPostId, userId],
    });
    const newChat = await chat.save();
    return res.render("shop/chat", {
      chatWith: chatWith,
      userChat: arrChat,
      message: message,
      chatId: newChat._id,
    });
  }
};

exports.postChatWith = async (req, res, next) => {
  const chatWithId = req.params.chatWithId;
  const chatId = req.body.chatId;
  const content = req.body.content;
  const message = new Message({
    sender: req.user._id,
    content: content,
    chat: chatId,
    time: new Date(),
  });
  const messageSave = await (await message.save()).populate("sender");

  res.send(messageSave);
};
