import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [Showpassword, setShowpassword] = useState(false);
  const toast = useToast();

  const handlePassword = () => {
    setShow(!show);
  };
  const handleconfirmPassword = () => {
    setShowpassword(!Showpassword);
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please fill all the details",
        duration: 5000,
        status: "warning",
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      toast({
        title: "Confirm Password does not match",
        duration: 5000,
        status: "warning",
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user",
        {
          name,
          email,
          password,
          pic: "",
        },
        config
      );

      toast({
        title: "Registration Successful",
        duration: 5000,
        isClosable: true,
        status: "success",
        position: "top",
      });

      localStorage.setItem("userdata", JSON.stringify(data));
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error occurred!",
        description: error.response?.data?.message || error.message,
        duration: 5000,
        isClosable: true,
        status: "error",
        position: "top",
      });
      setLoading(false);
    }
  };

  return (
    <>
    
      <VStack spacing="4" align="stretch">
        <FormControl id="name-input" isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Enter Your Name"
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>

        <FormControl id="email-input" isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            placeholder="Enter Your Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              id="password-input"
              type={show ? "text" : "password"}
              placeholder="Enter Your Password"
              onChange={(e) => setPassword(e.target.value.trim())}
            />
            <InputRightElement>
              <Button h="1.75rem" size="sm" onClick={handlePassword}>
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl id="confirm-password" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <Input
              type={Showpassword ? "text" : "password"}
              placeholder="Confirm Your Password"
              id="confirm-password-input"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <InputRightElement>
              <Button h="1.75rem" size="sm" onClick={handleconfirmPassword}>
                {Showpassword ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Button
          colorScheme="blue"
          width="100%"
          mt={4}
          isLoading={loading}
          onClick={submitHandler}
        >
          Sign Up
        </Button>
      </VStack>
    </>
  );
};

export default SignUp;
