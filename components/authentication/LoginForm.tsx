// app/login/page.tsx

"use client";

// Define the LoginInfo interface
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button, Divider, Input } from "@nextui-org/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "@nextui-org/link";

import MatrixService from "@/services/MatrixService";

interface LoginInfo {
  username: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [loginInfo, setLoginInfo] = useState<LoginInfo>({
    username: "",
    password: "",
  });
  // Removed the 'message' state as it's unused. Alternatively, see the optional usage below.

  // Optional: If you want to display the message in the UI, uncomment the following line
  // const [message, setMessage] = useState("");

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginInfo({
      ...loginInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await MatrixService.login(loginInfo.username, loginInfo.password);
      toast.success("Login successful!");
      router.push("/chat"); // Redirect to dashboard after login
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
      // Optional: If using the message state, uncomment the following line
      // setMessage(`Login failed: ${error.message}`);
    }
  };

  const isValidUsername = (username: string) => {
    // Add any specific validation for username if needed
    return username.trim().length > 0;
  };

  return (
    <div className="flex items-center justify-center mt-16">
      <Card className="min-w-96 shadow border-1 dark:border-0">
        <CardHeader className="flex flex-row justify-center">
          <p className="text-md text-2xl">Login</p>
        </CardHeader>
        <Divider />
        <CardBody className="w-full flex flex-col gap-3">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
              isRequired
              label="Username"
              name="username"
              placeholder="Enter your username"
              size="sm"
              type="text"
              value={loginInfo.username}
              onChange={handleChange}
            />
            <Input
              isRequired
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <FaEye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              label="Password"
              name="password"
              placeholder="Enter your password"
              size="sm"
              type={isVisible ? "text" : "password"}
              value={loginInfo.password}
              onChange={handleChange}
            />
            <Button
              className="w-full"
              color="primary"
              isDisabled={!isValidUsername(loginInfo.username)}
              size="sm"
              type="submit"
            >
              Login
            </Button>
          </form>
          {/* Optional: If using the message state, uncomment the following block */}
          {/* {message && (
            <div className="text-red-500 text-sm mt-2">
              {message}
            </div>
          )} */}
          <div className="w-full flex flex-row justify-end">
            <Link className="!text-sm text-indigo-500" href="/register">
              Don&apos;t have an account?
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
