const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const generateToken = require("../database/generateToken");
const protect = require("../middleware/middleWare");

router.get("/", (req, res) => {
  res.send("Testing API");
});

// ✅ Register User
router.post("/user", async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please enter all required fields" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      ...(pic && { pic }),
    });

    const newUser = await user.save();

    return res.status(201).json({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      pic: newUser.pic,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Search Users
router.get("/user", protect, async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  try {
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    return res.send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ One-to-One Chat
router.post("/accessChat", protect, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      return res.send(isChat[0]);
    }

    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findById(createdChat._id).populate(
      "users",
      "-password"
    );
    return res.status(200).json(fullChat);
  } catch (error) {
    console.error("Error accessing chat:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Fetch All Chats
router.get("/fetchChats", protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const fullChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    return res.send(fullChats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Create Group Chat
router.post("/group", protect, async (req, res) => {
  const { name, users } = req.body;

  if (!name || !users) {
    return res.status(400).json({ message: "Please fill all the details" });
  }

  try {
    const parsedUsers = JSON.parse(users);
    if (parsedUsers.length < 2) {
      return res.status(400).json({ message: "At least 2 users required" });
    }

    const groupChat = await Chat.create({
      chatName: name,
      users: [...parsedUsers, req.user._id],
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(fullGroupChat);
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Rename Group Chat
router.put("/renameGroup", protect, async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error renaming group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Add User to Group
router.put("/addtoGroup", protect, async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error adding to group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Remove Group
router.put("/removeGroup", protect, async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

//message

router.post("/message", protect, async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

router.get("/messages/:chatId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
module.exports = router;
