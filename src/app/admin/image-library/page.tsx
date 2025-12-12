"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, Search, Image as ImageIcon, X } from "lucide-react";
import { Button } from "~/app/sca-dashboard/components/ui/button";
import { Input } from "~/app/sca-dashboard/components/ui/input";
import Image from "next/image";

interface LibraryImage {
  _id: string;
  name: string;
  dataUri: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  tags: string[];
  uploadedAt: string;
}

export default function ImageLibraryPage() {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<LibraryImage | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/admin/image-library", {
        headers: {
          "x-api-key": API_KEY || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.images);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert("Image size must be less than 25MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);

      const response = await fetch("/api/admin/image-library", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY || "",
        },
        body: formData,
      });

      if (response.ok) {
        await fetchImages();
        e.target.value = ""; // Reset input
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch(`/api/admin/image-library/${imageId}`, {
        method: "DELETE",
        headers: {
          "x-api-key": API_KEY || "",
        },
      });

      if (response.ok) {
        setImages(images.filter((img) => img._id !== imageId));
        if (selectedImage?._id === imageId) {
          setSelectedImage(null);
        }
      } else {
        alert("Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image");
    }
  };

  const filteredImages = images.filter(
    (img) =>
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Image Library
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Manage and organize your product images
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="upload-input" className="cursor-pointer">
              <div
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                  isUploading
                    ? "cursor-not-allowed bg-neutral-400 text-white"
                    : "bg-neutral-900 text-white hover:bg-neutral-800"
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </>
                )}
              </div>
              <input
                id="upload-input"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search by name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-neutral-900">
              {images.length}
            </div>
            <div className="text-sm text-neutral-600">Total Images</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-neutral-900">
              {formatFileSize(images.reduce((acc, img) => acc + img.size, 0))}
            </div>
            <div className="text-sm text-neutral-600">Total Size</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-neutral-900">
              {filteredImages.length}
            </div>
            <div className="text-sm text-neutral-600">Filtered Results</div>
          </div>
        </div>

        {/* Image Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-white py-20">
            <ImageIcon className="mb-4 h-12 w-12 text-neutral-400" />
            <p className="text-lg font-medium text-neutral-900">
              {searchQuery ? "No images found" : "No images in library"}
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {searchQuery
                ? "Try a different search term"
                : "Upload your first image to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredImages.map((image) => (
              <div
                key={image._id}
                className="group relative cursor-pointer overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md"
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={image.dataUri}
                    alt={image.name}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {image.name}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {image.width} × {image.height} •{" "}
                    {formatFileSize(image.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(image._id);
                  }}
                  className="absolute right-2 top-2 rounded-md bg-red-600 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 z-10 rounded-md bg-white p-2 shadow-lg hover:bg-neutral-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              <div className="mb-4 aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
                <Image
                  src={selectedImage.dataUri}
                  alt={selectedImage.name}
                  width={800}
                  height={800}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {selectedImage.name}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {selectedImage.originalName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-neutral-700">
                      Dimensions:
                    </span>
                    <p className="text-neutral-600">
                      {selectedImage.width} × {selectedImage.height}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Size:</span>
                    <p className="text-neutral-600">
                      {formatFileSize(selectedImage.size)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Type:</span>
                    <p className="text-neutral-600">{selectedImage.mimeType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">
                      Uploaded:
                    </span>
                    <p className="text-neutral-600">
                      {new Date(selectedImage.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedImage.tags.length > 0 && (
                  <div>
                    <span className="font-medium text-neutral-700">Tags:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedImage.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 border-t border-neutral-200 pt-4">
                  <Button
                    onClick={() => {
                      // Copy data URI to clipboard
                      navigator.clipboard.writeText(selectedImage.dataUri);
                      alert("Image URL copied to clipboard!");
                    }}
                    className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800"
                  >
                    Copy URL
                  </Button>
                  <Button
                    onClick={() => handleDelete(selectedImage._id)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
