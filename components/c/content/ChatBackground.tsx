import React from "react";
import { useTheme } from "next-themes";

export const ChatBackground: React.FC = () => {
  const { theme } = useTheme();

  const isDarkTheme = theme === "dark";

  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: isDarkTheme
          ? 'url("/chat-background.svg")'
          : 'url("/chat-background.svg"), linear-gradient(to bottom left, rgba(217, 249, 157, 0.8), rgba(52, 211, 153, 0.8), rgba(22, 163, 74, 0.8))',
        filter: isDarkTheme ? "invert(1)" : "none",
        backgroundSize: "auto", // This ensures the entire image is visible
        backgroundRepeat: "repeat", // Prevents the image from repeating
        backgroundPosition: "center", // Keeps the image centered
      }}
    />
  );
};

export default ChatBackground;
