"use client";

import defaultAvatar from "../../../../../assets/default_images/default-avatar.png";

import { Camera, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { Avatar, AvatarImage } from "@/shared/components/ui/avatar";
import {
  FileUpload,
  FileUploadTrigger,
} from "@/shared/components/ui/file-upload";

// export const title = "Avatar Upload";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

type UploadStatus =
  | { phase: "idle" }
  | { phase: "uploading" }
  | { phase: "error"; message: string }
  | { phase: "done"; avatarUrl: string };


type UploadAvatarButtonProps = {
  avatar?: string;
  onAvatarChange?: (url: string) => void;
};

function UploadingOverlay({ isUploading }: { isUploading: boolean }) {
  console.log("📸 Avatar being uploaded", isUploading);
  if (isUploading)
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 text-white">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-xs">Uploading...</p>
      </div>
    );
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
      <Camera className="size-6" />
      <p className="text-xs">Upload a profile picture</p>
    </div>
  );
}

function UploadError({ message }: { message: string }) {
  console.log("⚠️ Avatar upload error:", message);
  if (!message) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="size-3" />
      <span>{message}</span>
    </div>
  );
}

export const UploadAvatarButton = ({
  avatar,
  onAvatarChange,
}: UploadAvatarButtonProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (!uploadError) return;
    const timer = setTimeout(() => setUploadError(null), 5000);
    return () => clearTimeout(timer);
  }, [uploadError]);

  const handleFileChange = useCallback(
    async (newFiles: File[]) => {
      setFiles(newFiles);
      setUploadError(null);

      const file = newFiles[0];
      if (!file) return;

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError("Only JPEG, PNG, and WebP images are allowed.");
        setFiles([]);
        return;
      }

      setIsUploading(true);

      try {
        const token = localStorage.getItem("auth_token");
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/profiles/me/avatar", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        const newAvatarUrl = data.avatarUrl as string;

        // Show preview immediately
        setPreviewUrl(newAvatarUrl);

        // Notify parent so it can refresh user data
        onAvatarChange?.(newAvatarUrl);
      } catch (err) {
        console.error("Avatar upload error:", err);
        setUploadError(
          err.message
          // err instanceof Error ? err.message : "Failed to upload avatar.",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onAvatarChange],
  );

  // const displayedAvatar = previewUrl ?? avatar ?? defaultAvatar;

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative transform items-center justify-center transition-all duration-300">
        <FileUpload
          value={files}
          onValueChange={handleFileChange}
          accept={ALLOWED_TYPES.join(",")}
          maxFiles={1}
          maxSize={MAX_SIZE}
          disabled={isUploading}
        >
          <FileUploadTrigger asChild>
            {/* Button is the avatar to upload */}
            <button
              className="group relative size-24 cursor-pointer md:size-32"
              disabled={isUploading}
            >
              <Avatar className="size-full rounded-none ring-2 ring-gray-300 ring-offset-2 ring-offset-white">
                <AvatarImage src={avatar} alt="Avatar" />
              </Avatar>
              <UploadingOverlay isUploading={isUploading} />
            </button>
          </FileUploadTrigger>
        </FileUpload>
      </div>

      <UploadError message={uploadError} />
    </div>
  );
};
