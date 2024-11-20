// components/authentication/RegisterForm.tsx
"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import MatrixService from "@/services/MatrixService";
import { toast } from "react-hot-toast";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button, Divider, Input } from "@nextui-org/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "@nextui-org/link";

interface RegisterInfo {
  username: string;
  password: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [registerInfo, setRegisterInfo] = useState<RegisterInfo>({
    username: "",
    password: "",
  });

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterInfo({
      ...registerInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await MatrixService.register(registerInfo.username, registerInfo.password);
      toast.success("Registration successful! Redirecting to login...");
      router.push("/login"); // Redirect to login page after registration
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    }
  };

  const isValidUsername = (username: string) => {
    // Add any specific validation for username if needed
    return username.trim().length > 0;
  };

  const isValidPassword = (password: string) => {
    // Add any specific validation for password if needed
    return password.trim().length > 0;
  };

  const isFormValid = () => {
    return isValidUsername(registerInfo.username) && isValidPassword(registerInfo.password);
  };

  return (
    <div className="flex items-center justify-center mt-16">
      <Card className="min-w-96 shadow border-1 dark:border-0">
        <CardHeader className="flex flex-row justify-center">
          <p className="text-md text-2xl">Register</p>
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
              value={registerInfo.username}
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
              value={registerInfo.password}
              onChange={handleChange}
            />
            <Button
              className="w-full"
              color="primary"
              isDisabled={!isFormValid()}
              size="sm"
              type="submit"
            >
              Register
            </Button>
          </form>
          <div className="w-full flex flex-row justify-end">
            <Link className="!text-sm text-indigo-500" href="/login">
              Already have an account?
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
