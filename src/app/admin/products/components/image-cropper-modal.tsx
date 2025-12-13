"use client";

import { useState, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Cropper from "react-easy-crop";
import { X, Crop } from "lucide-react";
import { Button } from "../../../sca-dashboard/components/ui/button";
import type { Area } from "react-easy-crop";

interface ImageCropperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  aspect?: number;
}

export function ImageCropperModal({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  aspect = 1,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Set canvas size to the cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    // Return as blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/jpeg",
        0.9,
      );
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      onOpenChange(false);
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 m-auto h-fit max-h-[90vh] w-full max-w-4xl overflow-hidden border border-neutral-200 bg-white shadow-xl sm:rounded-2xl">
          <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <Crop className="h-5 w-5 text-neutral-700" />
              <Dialog.Title className="text-xl font-semibold text-neutral-900">
                Crop Image
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                className="rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="relative h-[500px] w-full bg-neutral-900">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteCallback}
              onZoomChange={onZoomChange}
            />
          </div>

          <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                text="Cancel"
                disabled={isProcessing}
              />
              <Button
                variant="secondary"
                onClick={handleSave}
                text={isProcessing ? "Processing..." : "Save"}
                icon={isProcessing ? undefined : <Crop className="h-4 w-4" />}
                disabled={isProcessing}
                className="bg-neutral-900 text-white hover:bg-neutral-800"
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
