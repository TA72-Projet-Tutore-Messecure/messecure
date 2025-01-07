import React, { useState } from "react";
import Image from "next/image";
import { FaPlus } from "react-icons/fa6";
import { IconContext } from "react-icons";

interface AvatarSettingsProps {
  onImageUpload?: (file: File | null) => void;
}

const AvatarSettings: React.FC<AvatarSettingsProps> = ({ onImageUpload }) => {
  interface ImageState {
    file: File;
    previewUrl: string;
  }

  const [image, setImage] = useState<ImageState | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files?.[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);

      setImage({ file, previewUrl });
      if (onImageUpload) {
        onImageUpload(file);
      }
    }
  };

  return (
    <div className="avatar-settings">
      <div style={{ textAlign: "center" }}>
        <input
          accept="image/*"
          id="avatar-upload"
          style={{ display: "none" }}
          type="file"
          onChange={handleFileChange}
        />
        <label
          htmlFor="avatar-upload"
          style={{
            display: "inline-block",
            color: "#fff",
            borderRadius: "4px",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          {image ? (
            <div className="preview-container" style={{ textAlign: "center" }}>
              <Image
                alt="Preview"
                height={150}
                src={image.previewUrl}
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                width={150}
              />
            </div>
          ) : (
            <IconContext.Provider value={{ size: "40px" }}>
              <div
                style={{
                  textAlign: "center",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundColor: "#27272A",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FaPlus className="text-2xl text-default-400 pointer-events-none" />
              </div>
            </IconContext.Provider>
          )}
        </label>
      </div>
    </div>
  );
};

export default AvatarSettings;
