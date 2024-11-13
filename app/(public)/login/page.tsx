// app/login/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import MatrixService from "@/services/MatrixService";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await MatrixService.login(username, password);
      setMessage("Login successful!");
      router.push("/chat"); // Redirect to dashboard after login
    } catch (error) {
      // @ts-ignore
      setMessage(`Login failed: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block" htmlFor="username">
            Username:
          </label>
          <input
            required
            className="border p-2 w-full"
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block" htmlFor="password">
            Password:
          </label>
          <input
            required
            className="border p-2 w-full"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="bg-blue-500 text-white p-2" type="submit">
          Login
        </button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
