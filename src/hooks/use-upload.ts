"use client";

import { useMutation } from "@tanstack/react-query";

export function usePresignedUpload() {
  return useMutation({
    mutationFn: async ({
      filename,
      contentType,
      folder,
    }: {
      filename: string;
      contentType: string;
      folder?: "events" | "avatars" | "categories";
    }) => {
      const params = new URLSearchParams({ filename, contentType });
      if (folder) params.set("folder", folder);

      const res = await fetch(`/api/v1/upload/presigned?${params}`);
      if (!res.ok) throw new Error("Failed to get upload URL");
      return res.json();
    },
  });
}

export function useUploadFile() {
  const presignedMutation = usePresignedUpload();

  return useMutation({
    mutationFn: async ({
      file,
      folder,
    }: {
      file: File;
      folder?: "events" | "avatars" | "categories";
    }) => {
      // Step 1: Get presigned URL
      const { data } = await presignedMutation.mutateAsync({
        filename: file.name,
        contentType: file.type,
        folder,
      });

      // Step 2: Upload to R2 via presigned URL
      const uploadRes = await fetch(data.presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      // Step 3: Return public URL
      return { publicUrl: data.publicUrl, key: data.key };
    },
  });
}
