import { ViewIcon } from "@chakra-ui/icons";
import { IconButton, Image, Text, useDisclosure } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import React from "react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>

        {children ? (
          <span onClick={onOpen}>{children}</span>
        ) : (
          <IconButton
            display={{ base: "flex" }}
            icon={<ViewIcon />}
            onClick={onOpen}
          />
        )}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
          <ModalOverlay />
          <ModalContent h="400px">
            <ModalHeader
              fontSize="40px"
              fontFamily="work-sans"
              display="flex"
              justifyContent="center"
            >
              {user.name}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody
              display="flex"
              justifyContent="center"
              flexDirection="column"
              alignItems="center"
            >
              <Image
                src={user.pic}
                h="150px"
                alt={user.name}
                borderRadius="50%"
              />
              <Text fontSize={{base:"18px", md:"30px"}}>Email:{user.email}</Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    
    </>
  );
};

export default ProfileModal;
