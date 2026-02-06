"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface ImageUploaderProps {
  projectId: string;
  currentImages: string[];
  coverImage: string | null;
  onImagesChange: (images: string[]) => void;
  onCoverChange: (url: string | null) => void;
}

export default function ImageUploader({
  projectId,
  currentImages,
  coverImage,
  onImagesChange,
  onCoverChange,
}: ImageUploaderProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("project-images")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Error uploading image:", err);
      return null;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      // Validate file type
      if (!isImage && !isVideo) {
        setError("Solo se permiten archivos de imagen o video");
        continue;
      }

      // Validate file size (5MB for images, 50MB for videos)
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(isVideo ? "Los videos deben ser menores a 50MB" : "Las imágenes deben ser menores a 5MB");
        continue;
      }

      const url = await uploadImage(file);
      if (url) {
        newUrls.push(url);

        // Save to media table
        await supabase.from("media").insert({
          entity_type: "project" as const,
          entity_id: projectId,
          type: isVideo ? ("video" as const) : ("image" as const),
          url: url,
          order_index: currentImages.length + newUrls.length - 1,
        });
      }
    }

    if (newUrls.length > 0) {
      const updatedImages = [...currentImages, ...newUrls];
      onImagesChange(updatedImages);

      // Set first image as cover if none exists (only images, not videos)
      if (!coverImage) {
        const firstImage = updatedImages.find(url => !isVideoUrl(url));
        if (firstImage) {
          onCoverChange(firstImage);
        }
      }
    }

    setUploading(false);
  };

  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [currentImages, coverImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleRemoveImage = async (url: string) => {
    // Remove from media table
    await supabase.from("media").delete().eq("url", url);

    // Update local state
    const newImages = currentImages.filter((img) => img !== url);
    onImagesChange(newImages);

    // Update cover if needed
    if (coverImage === url) {
      const nextImage = newImages.find(u => !isVideoUrl(u));
      onCoverChange(nextImage || null);
    }

    // Try to delete from storage (extract path from URL)
    try {
      const urlParts = url.split("/project-images/");
      if (urlParts.length > 1) {
        await supabase.storage.from("project-images").remove([urlParts[1]]);
      }
    } catch (err) {
      console.error("Error deleting from storage:", err);
    }
  };

  const handleSetCover = (url: string) => {
    onCoverChange(url);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? "border-emerald-500 bg-emerald-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div>
            <label
              htmlFor="image-upload"
              className="cursor-pointer text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Subir imágenes o videos
            </label>
            <span className="text-gray-500"> o arrastra y suelta</span>
          </div>

          <p className="text-xs text-gray-400">
            Imágenes: PNG, JPG, WEBP hasta 5MB | Videos: MP4, WEBM, MOV hasta 50MB
          </p>
        </div>

        {uploading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm">Subiendo...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Media Gallery */}
      {currentImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Archivos del proyecto ({currentImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentImages.map((url, index) => {
              const isVideo = isVideoUrl(url);
              return (
                <div
                  key={url}
                  className={`relative group aspect-video rounded-lg overflow-hidden border-2 ${
                    coverImage === url ? "border-emerald-500" : "border-transparent"
                  }`}
                >
                  {isVideo ? (
                    <video
                      src={url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : (
                    <Image
                      src={url}
                      alt={`Imagen ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}

                  {/* Video badge */}
                  {isVideo && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Video
                    </div>
                  )}

                  {/* Cover badge */}
                  {coverImage === url && (
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                      Portada
                    </div>
                  )}

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {coverImage !== url && !isVideo && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(url)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Establecer como portada"
                      >
                        <svg
                          className="w-4 h-4 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(url)}
                      className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-500">
        La primera imagen se usará como portada si no seleccionas una. Puedes hacer clic en la estrella para cambiar la portada. Los videos no pueden ser portada.
      </p>
    </div>
  );
}
