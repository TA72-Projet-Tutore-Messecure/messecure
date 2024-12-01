"use client";

import React, { useState } from 'react';
import { toast } from "react-hot-toast";
import { Button, Divider, Input } from "@nextui-org/react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";

import MatrixService from "@/services/MatrixService";

interface SettingsInfo {
    oldPassword: string;
    new_password: string;
}

export default function Settings() {
  const [settingsInfo, setSettingsInfo] = useState<SettingsInfo>({
    oldPassword: "",
    new_password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsInfo({
      ...settingsInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      await MatrixService.changePassword(settingsInfo.oldPassword, settingsInfo.new_password);
      toast.success("Password change successful!");
    } catch (error: any) {
      toast.error(error.message || "Password change failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center mt-16">
      <Card className="min-w-96 shadow border-1 dark:border-0">
        <CardHeader className="flex flex-row justify-center">
          <p className="text-md text-2xl">Settings</p>
        </CardHeader>
        <Divider />
          <CardBody className="w-full flex flex-col gap-3">
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
              isRequired
              label="Password"
              name="old_password"
              placeholder="Enter your password"
              size="sm"
              type="password"
              defaultValue={settingsInfo.oldPassword}
              onChange={handleChange}
            />
            <Input
              isRequired
              label="New Password"
              name="new_password"
              placeholder="Enter your new password"
              size="sm"
              type="password"
              defaultValue={settingsInfo.new_password}
              onChange={handleChange}
            />
            <Button
              className="w-full"
              color="primary"
              // TODO isDisabled={!isFormValid()}
              size="sm"
              type="submit"
              onClick={handleSubmit}
            >
              Change Password
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
