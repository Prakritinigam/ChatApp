import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import React, { useState } from "react";
import { chatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import Userlisten from "../user Avatar/Userlisten";
import { getSender } from "../../config/chatLogics";

const SideDrawer = () => {
  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notifications,
    setNotifications,
  } = chatState();

  const navigate = useNavigate();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const logouthandler = () => {
    localStorage.removeItem("logindata");
    navigate("/");
  };

  // 🔍 SEARCH USERS
  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/user?search=${search}`,
        config
      );

      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to search users",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // 💬 ACCESS CHAT
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `/api/accessChat`,
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      setLoadingChat(false);
      toast({
        title: "Error",
        description: "Cannot open chat",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      {/* TOP BAR */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
        bg="white"
        p="5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search Chat
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans">
          Talk-A-Tive
        </Text>

        <Box display="flex" alignItems="center" gap={2}>
          {/* NOTIFICATIONS */}
          <Menu>
            <MenuButton p={1} position="relative">
              <BellIcon fontSize="2xl"  onClick={() => {
    console.log("🔔 Bell clicked");
    console.log("All Notifications:", notifications);
  }}/>
              {notifications.length > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  borderRadius="full"
                  bg="red.500"
                  color="white"
                  fontSize="0.7em"
                >
                  {notifications.length}
                </Badge>
              )}
            </MenuButton>
            <MenuList>
              {!notifications.length ? (
                <Text px={3}>No New Messages</Text>
              ) : (
                notifications.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotifications(
                        notifications.filter((n) => n !== notif)
                      );
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(
                          user,
                          notif.chat.users
                        )}`}
                  </MenuItem>
                ))
              )}
            </MenuList>
          </Menu>

          {/* USER MENU */}
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" src={user.pic} />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logouthandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      {/* DRAWER */}
      <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" mb={2}>
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button ml={2} onClick={handleSearch}>
                Go
              </Button>
            </Box>

            {loading && <ChatLoading />}

            {/* ✅ SHOW ONLY USERS FROM ONE-TO-ONE CHATS */}
            {!search &&
              chats
                .filter((chat) => !chat.isGroupChat)
                .map((chat) => {
                  const otherUser = chat.users.find(
                    (u) => u._id !== user._id
                  );

                  return (
                    <Userlisten
                      key={chat._id}
                      user={otherUser}
                      handleFunction={() => {
                        setSelectedChat(chat);
                        onClose();
                      }}
                    />
                  );
                })}

            {/* 🔍 SEARCH RESULT USERS */}
            {search &&
              searchResult.map((u) => (
                <Userlisten
                  key={u._id}
                  user={u}
                  handleFunction={() => accessChat(u._id)}
                />
              ))}

            {loadingChat && <Spinner mt={4} />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
