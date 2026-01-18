import axios from "axios";
import React, { useEffect, useState } from "react";
import "./Homepage.css";
import { chatState } from "../Context/ChatProvider";
import SideDrawer from "../Components/miscelenous/SideDrawer";
import { Box } from "@chakra-ui/react";
import Mychats from "../Components/miscelenous/Mychats";
import ChatBox from "../Components/miscelenous/ChatBox";

const ChatPage = () => {
  const { user } = chatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  return (
    <>
      <div style={{ width: "100%" }}>
        {user && <SideDrawer />}
        <Box
          display="flex"
          justifyContent="space-between"
          w="100%"
          h="91.5vh"
          p="10px"
        >
          {user && (
            <Mychats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          )}
          {user && (
            <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          )}
        </Box>
      </div>
    </>
  );
};

export default ChatPage;
