import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const handlePassword = () => {
    setShow(!show);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLoading(true);
      toast({
        title: "Please fill all the details",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const data = await axios.post(
        "/api/login",
        {
          email,
          password,
        },
        config
      );
      toast({
        title: "Logged In ",
        duration: 5000,
        status: "success",
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      localStorage.setItem("logindata", JSON.stringify(data.data));
      navigate("/chats");
    } catch (error) {
      console.error("Something went wrong", error);
      toast({
        title: "Failed to sign in",
        duration: 5000,
        status: "warning",
        isClosable: true,
        position: "top",
      });
    }
  };
  const handleGuest = () => {
    setEmail("guest@gmail.com");
    setPassword("guest");
  };
  return (
    <VStack>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          value={email}
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
        ></Input>
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            value={password}
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            onChange={(e) => setPassword(e.target.value)}
          ></Input>
          <InputRightElement>
            <Button h="1.75rem" size="sm" onClick={handlePassword}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        isLoading={loading}
        style={{ marginTop: 15 }}
        onClick={submitHandler}
      >
        Login
      </Button>
      <Button
        colorScheme="red"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={handleGuest}
      >
        Get Guest user Credentials
      </Button>
    </VStack>
  );
};

export default Login;
