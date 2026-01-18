const chats = [
  {
    isGroupChat: false,
    users: [
      { name: "John Doe", email: "john@example.com" },
      { name: "Piyush", email: "piyush@example.com" },
    ],
    _id: "617a077e18c25468bc7c4dd4",
    chatName: "John Doe",
  },
  {
    isGroupChat: true,
    users: [
      { name: "John Doe", email: "jon@example.com" },
      { name: "Piyush", email: "piyush@example.com" },
      { name: "Guest User", email: "guest@example.com" },
    ],
    _id: "617a518c4081150716472c78",
    chatName: "Friends",
    groupAdmin: { name: "Guest User", email: "guest@example.com" },
  },
];

module.exports = chats;
