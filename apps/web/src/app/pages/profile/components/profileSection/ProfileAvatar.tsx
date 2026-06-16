"use client";

import { Camera, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import {
  FileUpload,
  FileUploadTrigger,
} from "@/shared/components/ui/file-upload";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

type ProfileAvatarProps = {
  avatarUrl?: string;
};

// function UploadingOverlay({ isUploading }: { isUploading: boolean }) {

function UploadError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="size-3" />
      <span>{message}</span>
    </div>
  );
}

export const ProfileAvatar = ({
  avatarUrl,
}: ProfileAvatarProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  // Sync avatar from prop on mount and when prop changes
  useEffect(() => {
    setAvatar(avatarUrl ?? "/avatars/default.png");
  }, [avatarUrl]);

  // pass pa
  const handleFileUpload = async (fileUpload: File[]) => {
    if(error){
      setError(false);
      }

    const file = fileUpload[0];
    if (!file) return;

    // // Show local preview immediately while uploading
    // setAvatar(URL.createObjectURL(file));

    try {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profiles/me/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Upload failed");
      }

      const data = await res.json();
      setErrorMessage(null);
      setAvatar(data.avatarUrl); // replace local preview with real server URL
      console.log("New avatar URL:", data.avatarUrl);
    } catch (err) {
      // fetch only sees as errir when not able to deliver a response and catch is to cover these
      console.error("POST: Avatar upload error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Upload failed");
      setAvatar(avatarUrl ?? "/avatars/default.png"); // revert on failure
      setFiles([]);
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative transform items-center justify-center transition-all duration-300">
        {/* File component already handles
         - file selection
          - validation (type and size)
          - error handling for rejections
          - so we just need to provide an onValueChange callback to handle the file and show a preview while uploading
        */}
        <FileUpload
          value={files} //value is the file list that stores the selected file(s)
          onValueChange={handleFileUpload}
          // onValueChange={handleFileChange}
          accept={ALLOWED_TYPES.join(",")}
          maxFiles={1}
          maxSize={MAX_SIZE}
          // disabled={isUploading}
          onFileReject={(file, message) => {
            console.error(`File rejected: ${message}`, file);
            setError(true);
            setErrorMessage(message);
            setFiles([]);
          }}
        >
          <FileUploadTrigger asChild>
            {/* Button is the avatar to upload */}
            <button
              className="group relative size-24 cursor-pointer md:size-32"
              // disabled={isUploading}
            >
              <Avatar className="size-full rounded-none ring-2 ring-gray-300 ring-offset-2 ring-offset-white">
                <AvatarImage
                  src={avatar ?? "/avatars/default.png"}
                  alt="Avatar"
                  onError={() => setAvatar("/avatars/default.png")}
                />
                <AvatarFallback>
                  <img
                    src="/avatars/default.png"
                    alt="fallback"
                    className="size-full object-cover"
                  />
                </AvatarFallback>
              </Avatar>
              {
                /* <UploadingOverlay isUploading={isUploading} /> */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="size-6" />
                  <p className="text-xs">Upload a profile picture</p>
                </div>
              }
            </button>
          </FileUploadTrigger>
        </FileUpload>
      </div>
      <UploadError message={errorMessage} />
    </div>
  );
};
