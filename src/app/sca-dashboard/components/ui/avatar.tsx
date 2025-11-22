import { cn } from "@sca/utils";
import { sha256 } from "js-sha256";
import { useState, useEffect } from "react";

type User = {
  id?: string | null | undefined;
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
};

export function getUserAvatarUrl(user?: User | null) {
  if (user?.image) return user.image;

  // Use email to generate avatar URL (Vercel-style)
  if (user?.email) {
    // Generate a deterministic ID from email for avatar
    const emailHash = sha256(user.email);
    return `https://avatar.vercel.sh/${emailHash}`;
  }

  if (user?.id) {
    return `https://avatar.vercel.sh/${user.id}`;
  }

  return "https://avatar.vercel.sh/default";
}

export function Avatar({
  user = {},
  className,
}: {
  user?: User;
  className?: string;
}) {
  if (!user) {
    return (
      <div
        className={cn(
          "size-7 flex-none shrink-0 overflow-hidden rounded-full animate-pulse bg-neutral-200",
          className,
        )}
      />
    );
  }

  const [url, setUrl] = useState(() => getUserAvatarUrl(user));
  
  // Update URL if user changes
  useEffect(() => {
    const newUrl = getUserAvatarUrl(user);
    setUrl(newUrl);
  }, [user.email, user.id, user.image]);

  return (
    <img
      alt={`Avatar for ${user.name || user.email}`}
      referrerPolicy="no-referrer"
      src={url}
      className={cn(
        "blur-0 size-7 flex-none shrink-0 overflow-hidden rounded-full bg-neutral-100",
        className,
      )}
      draggable={false}
      loading="lazy"
      decoding="async"
      width={28}
      height={28}
      style={{ color: "transparent" }}
      onError={() => {
        // Fallback to a gradient avatar based on email hash
        if (user.email) {
          const emailHash = sha256(user.email);
          setUrl(`https://avatar.vercel.sh/${emailHash}`);
        } else if (user.id) {
          setUrl(`https://avatar.vercel.sh/${user.id}`);
        }
      }}
    />
  );
}

export function TokenAvatar({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return (
    <img
      src={`https://api.dicebear.com/9.x/shapes/svg?seed=${id}`}
      alt="avatar"
      className={cn("h-10 w-10 rounded-full", className)}
      draggable={false}
    />
  );
}
