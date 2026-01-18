const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./router/Routes");
require("./database/conn");

dotenv.config();
const app = express();

/* ---------------- Middleware ---------------- */
app.use(express.json());
app.use(cors());

/* ---------------- API Routes ---------------- */
app.use("/api", router);
app.get("/", (req,res)=>{
  res.send("API is Running Succesffully")
})
/* ---------------- Server ---------------- */
const PORT = process.env.PORT || 8003;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ---------------- Socket.IO ---------------- */
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});
