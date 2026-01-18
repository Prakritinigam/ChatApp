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
  useToast,
  FormControl,
  Input,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { chatState } from "../../Context/ChatProvider";
import Userlisten from "../user Avatar/Userlisten";
import UserBadgeItem from "../user Avatar/UserBadgeItem";
const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, chats, setChats } = chatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
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
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      console.log(data);
      setSearchResults(data);
      setLoading(false);
      setSearch("");
    } catch (error) {
      toast({ title: "Error fetching users", duration: 5000 });
    }
  };
  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({ title: "Please fill all the details", duration: 5000 });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `/api/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      console.log(data);
      setLoading(false);
      setChats([data, ...chats]);
      onClose();
      toast({ title: "Group chat created successfully", duration: 5000 });
    } catch (error) {
      toast({ title: "Error creating group chat", duration: 5000 });
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({ title: "User already selected", duration: 5000 });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };
  const handleDelete = (userDelete) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userDelete._id));
  };
  const toast = useToast();
  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="work sans"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" alignItems="center">
            <FormControl mb="5px">
              <Input
                type="text"
                placeholder="Chat Name"
                onChange={(e) => setGroupChatName(e.target.value)}
                mb="20px"
              ></Input>
              <Input
                type="text"
                placeholder="Add Users eg: Piyish, John,Jame"
                onChange={(e) => handleSearch(e.target.value)}
              ></Input>
            </FormControl>
            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                {searchResults.length > 0 ? (
                  searchResults.slice(0, 4).map((user) => {
                    return (
                      <Userlisten
                        key={user._id}
                        user={user}
                        handleFunction={() => handleGroup(user)}
                      ></Userlisten>
                    );
                  })
                ) : (
                  <div>No User found</div>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
