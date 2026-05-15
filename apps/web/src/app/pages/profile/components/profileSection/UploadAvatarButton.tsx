"use client";

import defaultAvatar from "../../../../../assets/default_images/default-avatar.png";

import { Camera } from "lucide-react";
import * as React from "react";

import {
  Avatar,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  FileUpload,
  FileUploadTrigger,
} from "@/shared/components/ui/file-upload";

export const title = "Avatar Upload";

type UploadAvatarButtonProps = {
  avatar?: string;
};

export const UploadAvatarButton = ({ avatar }: UploadAvatarButtonProps) => {
  const [files, setFiles] = React.useState<File[]>([]);

  console.log("Avatar path:", avatar);

  return (
    <div className="relative transform items-center justify-center transition-all duration-300">
      <FileUpload
        value={files}
        onValueChange={setFiles}
        accept="image/*"
        maxFiles={1}
        maxSize={2 * 1024 * 1024}
      >
        <FileUploadTrigger asChild>
          <button className="group relative cursor-pointer ">
            <Avatar className="size-full rounded-none">
              <AvatarImage src={avatar ? avatar : defaultAvatar} alt="Avatar" />
            </Avatar>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-6" />
              <p className="text-xs ">Upload a profile picture</p>
            </div>
          </button>
        </FileUploadTrigger>
      </FileUpload>
    </div>
  );
};

export default UploadAvatarButton;
