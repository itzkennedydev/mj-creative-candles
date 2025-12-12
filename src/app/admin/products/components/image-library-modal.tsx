"use client";

import { useState, useEffect } from "react";
import { X, Search, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "~/app/sca-dashboard/components/ui/button";
import { Input } from "~/app/sca-dashboard/components/ui/input";

interface LibraryImage {
  _id: string;
  name: string;
  dataUri: string;
  originalName: string;
  size: number;
  width?: number;
  height?: number;
  tags: string[];
}

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUri: string) => void;
}

export function ImageLibraryModal({
  isOpen,
  onClose,
  onSelect,
}: ImageLibraryModalProps) {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

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

  const filteredImages = images.filter(
    (img) =>
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const handleSelect = (imageUri: string) => {
    onSelect(imageUri);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">
              Select from Library
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-neutral-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4">
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
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 py-20">
              <ImageIcon className="mb-4 h-12 w-12 text-neutral-400" />
              <p className="text-lg font-medium text-neutral-900">
                {searchQuery ? "No images found" : "No images in library"}
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                {searchQuery
                  ? "Try a different search term"
                  : "Upload images to the Image Library first"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredImages.map((image) => (
                <button
                  key={image._id}
                  onClick={() => handleSelect(image.dataUri)}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-all hover:border-neutral-900 hover:shadow-md"
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
                  <div className="p-2">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {image.name}
                    </p>
                    {image.width && image.height && (
                      <p className="text-xs text-neutral-600">
                        {image.width} × {image.height}
                      </p>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                    <div className="translate-y-4 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
                        Select
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
