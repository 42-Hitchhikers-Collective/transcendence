"use client";

import { Camera, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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
// Fixed delay (ms) the spinner stays visible after the upload resolves
// so the user registers that something happened
const SPINNER_DELAY_MS = 1000;

type ProfileAvatarProps = {
  avatarUrl?: string;
};

function UploadError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center  bg-red-500/90 px-3 text-white text-xs font-medium text-center shadow-lg animate-in fade-in zoom-in whitespace-normal pointer-events-none">
      <span className="leading-snug">{message}</span>
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
  // Tracks whether an upload is in progress — guards against duplicate submissions
  // and drives the loading spinner overlay
  const [isUploading, setIsUploading] = useState(false);
  // ── Tracks whether a delete request is in flight (drives the spinner
  //     overlay and disables the delete button while deleting) ──
  const [isDeleting, setIsDeleting] = useState(false);
  // ── Ref‑based guard that survives React StrictMode double‑fires (state updates
  // can lag behind in dev, letting two calls slip through before isUploading flips)
  const uploadingRef = useRef(false);
  // ── Tracks the last successfully displayed avatar URL so that on error we
  //     revert to the *actual* current image, not the stale prop from auth
  //     context (which isn't updated after every successful upload) ──
  const lastGoodAvatarRef = useRef<string | null>(null);

  // ── Derived: whether the current avatar is the fallback default ──
  const isDefaultAvatar = !avatar || avatar.includes("default");
  // ── Busy flag: uploading OR deleting — used to disable all interactions ──
  const isBusy = isUploading || isDeleting;

  // Sync avatar from prop on mount and when prop changes
  useEffect(() => {
    const url = avatarUrl ?? "/avatars/default.png";
    setAvatar(url);
    lastGoodAvatarRef.current = url;  // ── seed the ref on initial load / prop change
  }, [avatarUrl]);

  // ── Auto-dismiss error messages after 2 seconds (toast-like behavior).
  //     If a new error arrives before the previous one expires, the old
  //     timer is cancelled and a fresh 2-second timer starts. ──
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const handleFileUpload = async (fileUpload: File[]) => {
    // ── Guard: prevent duplicate requests (FileUpload can fire onChange
    //     multiple times per selection; React StrictMode doubles renders) ──
    if (uploadingRef.current) return;
    uploadingRef.current = true;
    setIsUploading(true);
    setErrorMessage(null);

    const file = fileUpload[0];
    if (!file) {
      uploadingRef.current = false;
      setIsUploading(false);
      return;
    }

    // ── Instant local preview: show the selected image immediately so the UI
    //     feels responsive while the upload is in flight ──
    const localPreview = URL.createObjectURL(file);
    setAvatar(localPreview);

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
        // ── Parse the error body now but DON'T show it yet — the error
        //     message is deferred until after the spinner delay in catch ──
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || "Upload failed");
      }

      const data = await res.json();

      // ── Fixed delay: keep the spinner visible for SPINNER_DELAY_MS after
      //     the upload resolves so the transition doesn't feel instantaneous ──
      await new Promise((r) => setTimeout(r, SPINNER_DELAY_MS));

      // ── Cache‑bust: the same userId always maps to the same file path,
      //     so the browser would otherwise serve the stale cached image.
      //     Appending a query param forces a fresh fetch. ──
      const cacheBustedUrl = `${data.avatarUrl}?t=${Date.now()}`;
      setAvatar(cacheBustedUrl);
      lastGoodAvatarRef.current = cacheBustedUrl;  // ── remember the new avatar for error reverts
      setErrorMessage(null);
      // ── Reset FileUpload state so a subsequent selection of the same file
      //     still triggers onChange ──
      setFiles([]);
      console.log("New avatar URL:", data.avatarUrl);

      // ── Refresh the auth context's cached /api/users/me response so that
      //     other components (navbar, friends list, etc.) pick up the new URL
      //     and stop referencing the old (now‑deleted) avatar ──
      fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .catch(() => {});
    } catch (err) {
      // fetch only enters catch when the request itself fails (network error),
      // so this covers cases where no response was delivered at all
      console.error("POST: Avatar upload error:", err);

      // ── Fixed delay on failure: keep the spinner visible for
      //     SPINNER_DELAY_MS before revealing the error message ──
      await new Promise((r) => setTimeout(r, SPINNER_DELAY_MS));

      // ── Now that the spinner delay is over, reveal the error ──
      setErrorMessage(err instanceof Error ? err.message : "Upload failed");
      // ── Revert to the last known good avatar (ref tracks the real current
      //     image, unlike the avatarUrl prop which may be stale) ──
      setAvatar(lastGoodAvatarRef.current ?? "/avatars/default.png");
      setFiles([]);
    } finally {
      uploadingRef.current = false;
      setIsUploading(false);
      // ── Release the blob URL to avoid memory leaks ──
      URL.revokeObjectURL(localPreview);
    }
  };

  // ── Delete avatar: calls DELETE /api/profiles/me/avatar, then resets
  //     the avatar to the default fallback ──
  const handleDeleteAvatar = async () => {
    if (isBusy) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/profiles/me/avatar", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to delete avatar");
      }

      // ── Fixed delay so the user sees the spinner briefly ──
      await new Promise((r) => setTimeout(r, SPINNER_DELAY_MS));

      // ── Reset to default (cache‑busted so the browser reloads it) ──
      const defaultUrl = `/avatars/default.png?t=${Date.now()}`;
      setAvatar(defaultUrl);
      lastGoodAvatarRef.current = defaultUrl;  // ── update ref after delete
      setErrorMessage(null);
      setFiles([]);

      // ── Refresh auth context so other components pick up the null avatarUrl ──
      fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .catch(() => {});
    } catch (err) {
      console.error("DELETE: Avatar delete error:", err);

      // ── Delay before showing the error ──
      await new Promise((r) => setTimeout(r, SPINNER_DELAY_MS));

      setErrorMessage(err instanceof Error ? err.message : "Failed to delete avatar");
    } finally {
      setIsDeleting(false);
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
          accept={ALLOWED_TYPES.join(",")}
          maxSize={MAX_SIZE}
          disabled={isBusy}  // ── Block file selection while upload or delete is in flight
          onFileReject={(file, message) => {
            console.error(`File rejected: ${message}`, file);
            setError(true);
            setErrorMessage(message);
            setFiles([]);
          }}
        >
          {/* ── Avatar container (NOT a FileUploadTrigger — clicking the
               avatar or overlay does nothing; only the explicit "Change"
               button inside the overlay opens the file picker) ── */}
          <div
            className="group relative size-[clamp(10rem,28vw,14rem)] sm:size-[clamp(10rem,18vw,18rem)] lg:size-[clamp(14rem,16vw,22rem)] cursor-default"
          >
            {/* ── Hover overlay: darkens the whole avatar and shows two
                  actions. "Change" (top) opens the file picker via
                  FileUploadTrigger. "Remove" (bottom) deletes the avatar
                  — only shown when avatar is not the default. ── */}
            {!isBusy && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[clamp(0.5rem,1vw,0.75rem)] bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <FileUploadTrigger asChild>
                  <button
                    type="button"
                    disabled={isBusy}
                    className="inline-flex items-center gap-[clamp(0.25rem,0.4vw,0.4rem)] text-white text-[clamp(0.7rem,1.4vw,1rem)] hover:text-gray-200 cursor-pointer transition-colors"
                  >
                    <Camera className="size-[clamp(0.9rem,1.2vw,1.25rem)]" />
                    Change
                  </button>
                </FileUploadTrigger>
                {!isDefaultAvatar && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="inline-flex items-center gap-[clamp(0.25rem,0.4vw,0.4rem)] text-red-300 hover:text-red-100 text-[clamp(0.7rem,1.4vw,1rem)] cursor-pointer transition-colors"
                    aria-label="Reset to default avatar"
                  >
                    <Trash2 className="size-[clamp(0.9rem,1.2vw,1.25rem)]" />
                    Remove
                  </button>
                )}
              </div>
            )}
            {/* ── Spinner overlay: shown during upload OR delete ── */}
            {isBusy && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-black/50 text-white">
                <svg className="animate-spin size-[clamp(1.25rem,1.6vw,1.5rem)]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-[clamp(0.6rem,0.8vw,0.75rem)]">{isDeleting ? "Removing..." : "Uploading..."}</p>
              </div>
            )}
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
            {/* ── Error overlay: covers the avatar with a red semi‑transparent
                 toast when something goes wrong. Auto‑dismissed after 2 s. ── */}
            <UploadError message={errorMessage} />
          </div>
        </FileUpload>
      </div>
    </div>
  );
};
