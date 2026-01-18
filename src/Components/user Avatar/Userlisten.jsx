import { Avatar, Box, Text } from "@chakra-ui/react";
import React from "react";

const Userlisten = ({ user, handleFunction }) => {
  // console.log("Rendering user:", user);

  return (
    <Box
      onClick={() => handleFunction(user)}
      cursor="pointer"
      _hover={{ bg: "teal.500", color: "white" }}
      _active={{ bg: "gray.400" }}
      borderRadius="md"
      p={3}
      w="100%"
      display="flex"
      alignItems="center"
      bg="gray.100"
      mb={2}
      gap={3}
    >
      <Avatar size="sm" name={user?.name} src={user?.pic} />
      <Box>
        <Text fontWeight="bold">{user.name}</Text>
        <Text fontSize="xs">
          <b>Email:</b> {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default Userlisten;
