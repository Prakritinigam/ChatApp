import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  IconButton,
  useToast,
  Box,
  FormControl,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { chatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../user Avatar/UserBadgeItem";
import axios from "axios";
import Userlisten from "../user Avatar/Userlisten";

const UpdateGroupChatModal = ({fetchMessages, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const toast = useToast();

  const { user, selectedChat, setSelectedChat } = chatState();

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      console.log("Renaming group to:", groupChatName);
      setRenameLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(
        "/api/renameGroup",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      console.log("Rename success:", data);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      toast({
        title: "Group name updated successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.log("Rename error:", error);
      toast({
        title: "Error renaming chat",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setRenameLoading(false);
      setGroupChatName("");
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResults(data);
    } catch (error) {
      toast({
        title: "Failed to Load Search Results",
        description: error?.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "Error adding user",
        description: "User is already a member of the group",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Error adding user",
        description: "Only the group admin can add users",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.put(
        `/api/addtoGroup`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
      setLoading(false);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      console.log("Error adding user:", error);
      toast({
        title: "Error adding user",
        description: error?.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(
        "/api/removeGroup",
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      console.log("Response from removeGroup:", data);

      if (!data) {
        throw new Error("No data returned from removeGroup API");
      }

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error?.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
      setGroupChatName("");
    }
  };

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontFamily="work sans"
            display="flex"
            justifyContent="center"
            fontSize="35px"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
              <FormControl display="flex" gap="10px" mt={3}>
                <Input
                  placeholder="Chat Name"
                  mb={3}
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <Button
                  colorScheme="teal"
                  variant="solid"
                  isLoading={renameLoading}
                  onClick={handleRename}
                >
                  Update
                </Button>
              </FormControl>
              <FormControl>
                <Input
                  placeholder="Add User to group"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </FormControl>
              {loading ? (
                <>
                  <Spinner size="lg" />
                </>
              ) : (
                <>
                  {searchResults.map((user) => {
                    return (
                      <Userlisten
                        key={user._id}
                        user={user}
                        handleFunction={() => handleAddUser(user)}
                      />
                    );
                  })}
                </>
              )}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
