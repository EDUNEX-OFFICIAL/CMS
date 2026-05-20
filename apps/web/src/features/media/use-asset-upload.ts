"use client";

import { useCallback, useState } from "react";
import { completeAssetUpload, createAssetUploadRequest } from "@/lib/api";

export function useAssetUpload(workspaceId: string) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File, folderId?: string | null) => {
      setUploading(true);
      setError(null);

      const request = await createAssetUploadRequest(workspaceId, {
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        folderId: folderId ?? null,
      });

      if (!request.success) {
        setUploading(false);
        setError(request.error.message);
        return null;
      }

      const putResponse = await fetch(request.data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (!putResponse.ok) {
        setUploading(false);
        setError(
          `Upload to storage failed (${putResponse.status}). Check MinIO is running and CORS is configured.`,
        );
        return null;
      }

      const complete = await completeAssetUpload(
        workspaceId,
        request.data.assetId,
      );

      setUploading(false);

      if (!complete.success) {
        setError(complete.error.message);
        return null;
      }

      return complete.data;
    },
    [workspaceId],
  );

  return { uploadFile, uploading, error, clearError: () => setError(null) };
}
