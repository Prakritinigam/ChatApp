import { useNavigate } from "react-router-dom";

import { createContext, useState, useContext, useEffect } from "react";
const ChatContext = createContext();
const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState(() => {
    const storedChats = localStorage.getItem("chats");
    return storedChats ? JSON.parse(storedChats) : [];
  });
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("logindata"));
    setUser(userInfo);
    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        setSelectedChat,
        selectedChat,
        chats,
        setChats,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
export const chatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
