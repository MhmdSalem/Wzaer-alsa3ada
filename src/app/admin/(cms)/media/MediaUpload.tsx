"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MediaUpload() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onFiles(files: FileList) {
    setBusy(true);
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      await fetch("/api/admin/upload", { method: "POST", body });
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-deep">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16V4m0 0L7 9m5-5 5 5M4 20h16" />
      </svg>
      {busy ? "بيرفع..." : "رفع صور"}
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) void onFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}
