"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Button, Divider, Input } from "@nextui-org/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Card, CardBody, CardHeader } from "@nextui-org/card";

import MatrixService from "@/services/MatrixService";

interface SettingsInfo {
  oldPassword: string;
  newPassword: string;
}

export default function Settings() {
  const router = useRouter();
  const [isOldPwdVisible, setIsOldPwdVisible] = useState(false);
  const [isNewPwdVisible, setIsNewPwdVisible] = useState(false);
  const [settingsInfo, setSettingsInfo] = useState<SettingsInfo>({
    oldPassword: "",
    newPassword: "",
  });

  const toggleOldPwdVisibility = () => setIsOldPwdVisible(!isOldPwdVisible);
  const toggleNewPwdVisibility = () => setIsNewPwdVisible(!isNewPwdVisible);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsInfo({
      ...settingsInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await MatrixService.changePassword(
        settingsInfo.oldPassword,
        settingsInfo.newPassword,
      );
      toast.success("Password change successful!");
      router.push("/login"); // Redirect to login page after changing password
    } catch (error: any) {
      toast.error(error.message || "Password change failed. Please try again.");
    }
  };

  const isValidPassword = (password: string) => {
    // Add any specific validation for username if needed
    return password.trim().length > 0;
  };

  return (
    <Card className="min-w-96 shadow border-1 dark:border-0">
      <CardHeader className="flex flex-row justify-center">
        <p className="text-md text-2xl">Settings</p>
      </CardHeader>
      <Divider />
      <CardBody className="w-full flex flex-col gap-3">
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <Input
            isRequired
            endContent={
              <button
                aria-label="toggle password visibility"
                className="focus:outline-none"
                type="button"
                onClick={toggleOldPwdVisibility}
              >
                {isOldPwdVisible ? (
                  <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <FaEye className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
            label="Password"
            name="oldPassword"
            placeholder="Enter your password"
            size="sm"
            type={isOldPwdVisible ? "text" : "password"}
            value={settingsInfo.oldPassword}
            onChange={handleChange}
          />
          <Input
            isRequired
            endContent={
              <button
                aria-label="toggle password visibility"
                className="focus:outline-none"
                type="button"
                onClick={toggleNewPwdVisibility}
              >
                {isNewPwdVisible ? (
                  <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <FaEye className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
            label="New Password"
            name="newPassword"
            placeholder="Enter your new password"
            size="sm"
            type={isNewPwdVisible ? "text" : "password"}
            value={settingsInfo.newPassword}
            onChange={handleChange}
          />
          <Button
            className="w-full"
            color="primary"
            isDisabled={
              !isValidPassword(settingsInfo.oldPassword) ||
              !isValidPassword(settingsInfo.newPassword)
            }
            size="sm"
            type="submit"
          >
            Change Password
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
