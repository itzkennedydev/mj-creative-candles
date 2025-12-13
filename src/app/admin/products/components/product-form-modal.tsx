"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import { Button } from "../../../sca-dashboard/components/ui/button";
import { Input } from "../../../sca-dashboard/components/ui/input";
import {
  Combobox,
  type ComboboxOption,
} from "../../../sca-dashboard/components/ui/combobox";
import Image from "next/image";
import type { Product } from "~/lib/types";
import { getProductPrice } from "~/lib/types";
import { ImageLibraryModal } from "./image-library-modal";
import { ImageCropperModal } from "./image-cropper-modal";
import { useToast } from "~/lib/toast-context";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

const CATEGORIES = ["Apparel", "Accessories", "Elite Volleyball"];

export function ProductFormModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductFormModalProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isCropperModalOpen, setIsCropperModalOpen] = useState(false);
  const [tempImageForCrop, setTempImageForCrop] = useState<string>("");
  const [cropType, setCropType] = useState<"primary" | "additional">("primary");

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>("");
  const [inStock, setInStock] = useState(true);

  // Candle-specific fields
  const [topNotes, setTopNotes] = useState<string>("");
  const [middleNotes, setMiddleNotes] = useState<string>("");
  const [baseNotes, setBaseNotes] = useState<string>("");
  const [scentFamily, setScentFamily] = useState<string>("");
  const [burnTime, setBurnTime] = useState<string>("");

  // Images
  const [primaryImage, setPrimaryImage] = useState<string>("");
  const [imageKey, setImageKey] = useState<number>(0); // Force image re-render
  const [additionalImages, setAdditionalImages] = useState<
    Array<{ url: string; file?: File }>
  >([]);
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);

  // Debug: Log primaryImage state changes
  useEffect(() => {
    console.log("Primary image state changed:", {
      hasImage: !!primaryImage,
      length: primaryImage?.length || 0,
      preview: primaryImage?.substring(0, 50) || "empty",
    });
  }, [primaryImage]);

  // Reset form when product changes or modal opens/closes
  useEffect(() => {
    if (open) {
      if (product) {
        // Edit mode - populate form
        setName(product.name || "");
        setDescription(product.description || "");
        setPrice(getProductPrice(product).toString() || "");
        setCategory(product.category || "");
        setInStock(product.inStock !== false);
        setTopNotes(product.topNotes || "");
        setMiddleNotes(product.middleNotes || "");
        setBaseNotes(product.baseNotes || "");
        setScentFamily(product.scentFamily || "");
        setBurnTime(product.burnTime || "");
        setPrimaryImage(product.image || "");
        setAdditionalImages(
          product.images?.map((img) => ({
            url: typeof img === "string" ? img : img.dataUri,
            file: undefined,
          })) || [],
        );
      } else {
        // Add mode - reset form
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setInStock(true);
        setTopNotes("");
        setMiddleNotes("");
        setBaseNotes("");
        setScentFamily("");
        setBurnTime("");
        setPrimaryImage("");
        setAdditionalImages([]);
        setPrimaryImageFile(null);
      }
    }
  }, [product, open]);

  const handlePrimaryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      addToast({
        title: "Invalid file type",
        description: "Please select an image file",
        type: "error",
      });
      return;
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      addToast({
        title: "File too large (max 25MB)",
        description: "",
        type: "error",
      });
      return;
    }

    // Convert file to data URL for cropper
    const reader = new FileReader();
    reader.onload = () => {
      setTempImageForCrop(reader.result as string);
      setCropType("primary");
      setIsCropperModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", croppedBlob, "cropped-image.jpg");

      const token = sessionStorage.getItem("adminToken");
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await response.json();

      if (cropType === "primary") {
        setPrimaryImage(data.url);
        setPrimaryImageFile(null);
        setImageKey((prev) => prev + 1); // Force re-render
      } else {
        setAdditionalImages((prev) => [...prev, { url: data.url }]);
      }

      addToast({
        title: "Image uploaded",
        description:
          cropType === "primary"
            ? "Primary image uploaded successfully"
            : "Additional image uploaded successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Upload error:", error);
      addToast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdditionalImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      addToast({
        title: "Invalid file type",
        description: "Please select an image file",
        type: "error",
      });
      return;
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      addToast({
        title: "File too large (max 25MB)",
        description: "",
        type: "error",
      });
      return;
    }

    // Convert file to data URL for cropper
    const reader = new FileReader();
    reader.onload = () => {
      setTempImageForCrop(reader.result as string);
      setCropType("additional");
      setIsCropperModalOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = "";
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || parseFloat(price) <= 0) {
      addToast({
        title: "Missing fields",
        description: "Please fill in all required fields (name and price)",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem("adminToken");

      // If no primary image but we have additional images, promote the first additional image
      let finalPrimaryImage = primaryImage;
      let finalAdditionalImages = [...additionalImages];

      if (!primaryImage && additionalImages.length > 0) {
        finalPrimaryImage = additionalImages[0]?.url || "";
        finalAdditionalImages = additionalImages.slice(1);

        addToast({
          title: "Image promoted",
          description: "First additional image promoted to primary image",
          type: "info",
        });
      }

      // Prepare product data
      const productData: Partial<Product> = {
        name,
        description: description || "",
        price: parseFloat(price),
        image: finalPrimaryImage,
        category: category || "Apparel",
        inStock,
        topNotes: topNotes || undefined,
        middleNotes: middleNotes || undefined,
        baseNotes: baseNotes || undefined,
        scentFamily: scentFamily || undefined,
        burnTime: burnTime || undefined,
        images: finalAdditionalImages.map((img) => ({
          id: `img_${Date.now()}_${Math.random()}`,
          imageId: "",
          dataUri: img.url,
          mimeType: "image/png",
          filename: img.url.split("/").pop() || "image.png",
        })),
      };

      // Only use placeholder if creating a NEW product with no images at all
      if (!product && !finalPrimaryImage) {
        productData.image =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e5e5' width='400' height='400'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
      }

      console.log("Saving product with data:", {
        isEditing: !!product,
        primaryImage: finalPrimaryImage,
        primaryImageState: primaryImage,
        additionalImagesCount: finalAdditionalImages.length,
        images: productData.images,
        willUsePlaceholder: !product && !finalPrimaryImage,
      });

      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save product");
      }

      addToast({
        title: "Success",
        description: product
          ? "Product updated successfully"
          : "Product created successfully",
        type: "success",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Save error:", error);
      addToast({
        title: "Save failed",
        description:
          error instanceof Error ? error.message : "Failed to save product",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 m-auto h-fit max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-neutral-200 bg-white shadow-xl sm:rounded-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
            <Dialog.Title className="text-xl font-semibold text-neutral-900">
              {product ? "Edit Product" : "Add New Product"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left Column - Basic Information */}
              <div className="space-y-5">
                <div>
                  <h3 className="mb-1 text-base font-semibold text-neutral-900">
                    Basic Information
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Enter the product details
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter product name"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                    className="w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                      Category
                    </label>
                    <Combobox
                      options={CATEGORIES.map((cat) => ({
                        label: cat,
                        value: cat,
                      }))}
                      selected={
                        category ? { label: category, value: category } : null
                      }
                      setSelected={(option: ComboboxOption<string> | null) =>
                        setCategory(option?.value || "")
                      }
                      placeholder="Select category"
                      buttonProps={{ className: "w-full" }}
                    />
                  </div>
                </div>

                {/* Candle Scent Information Section */}
                <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Scent Profile
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        Top Notes
                      </label>
                      <Input
                        value={topNotes}
                        onChange={(e) => setTopNotes(e.target.value)}
                        placeholder="e.g., Citrus, Bergamot"
                        className="w-full bg-white"
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Initial scent impression
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        Middle Notes
                      </label>
                      <Input
                        value={middleNotes}
                        onChange={(e) => setMiddleNotes(e.target.value)}
                        placeholder="e.g., Lavender, Jasmine"
                        className="w-full bg-white"
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Heart of the fragrance
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        Base Notes
                      </label>
                      <Input
                        value={baseNotes}
                        onChange={(e) => setBaseNotes(e.target.value)}
                        placeholder="e.g., Vanilla, Sandalwood"
                        className="w-full bg-white"
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Lasting impression
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                          Scent Family
                        </label>
                        <Input
                          value={scentFamily}
                          onChange={(e) => setScentFamily(e.target.value)}
                          placeholder="e.g., Citrus, Floral"
                          className="w-full bg-white"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                          Burn Time
                        </label>
                        <Input
                          value={burnTime}
                          onChange={(e) => setBurnTime(e.target.value)}
                          placeholder="e.g., 40-50 hours"
                          className="w-full bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded border-neutral-300"
                  />
                  <label
                    htmlFor="inStock"
                    className="text-sm font-medium text-neutral-700"
                  >
                    In Stock
                  </label>
                </div>
              </div>

              {/* Right Column - Images */}
              <div className="space-y-6">
                {/* Primary Image */}
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-neutral-900">
                      Primary Image
                    </h3>
                    <p className="text-sm text-neutral-500">
                      This will be the main product image displayed in the shop
                    </p>
                  </div>

                  {/* Always show preview box - display image or placeholder */}
                  <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-xl border-2 border-neutral-200 bg-neutral-100 shadow-sm">
                    {primaryImage ? (
                      <Image
                        key={`primary-${imageKey}`}
                        src={primaryImage}
                        alt="Primary product image"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="100%"
                          height="100%"
                          viewBox="0 0 400 400"
                        >
                          <rect fill="#e5e5e5" width="400" height="400" />
                          <text
                            fill="#999"
                            fontFamily="sans-serif"
                            fontSize="24"
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            No Image
                          </text>
                        </svg>
                      </div>
                    )}
                    {primaryImage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Removing primary image");
                          setPrimaryImage("");
                          setPrimaryImageFile(null);
                          setImageKey((prev) => prev + 1); // Force re-render
                        }}
                        className="absolute right-3 top-3 z-10 rounded-full border border-red-200 bg-white p-2 text-red-600 shadow-md transition-all hover:bg-red-50 hover:text-red-700"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("primary-image-input")
                              ?.click()
                          }
                          className="flex-1 rounded-lg border border-neutral-200 bg-white/90 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-white"
                        >
                          {primaryImage ? "Change Image" : "Upload Image"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsLibraryModalOpen(true)}
                          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white/90 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-white"
                        >
                          <ImageIcon className="h-4 w-4" />
                          Library
                        </button>
                      </div>
                      <input
                        id="primary-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handlePrimaryImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Images - Only show if primary image exists */}
                {primaryImage && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-1 text-base font-semibold text-neutral-900">
                        Additional Images
                      </h3>
                      <p className="text-sm text-neutral-500">
                        Add more images to showcase different angles or variants
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {additionalImages.map((img, index) => (
                        <div
                          key={index}
                          className="group relative aspect-square overflow-hidden rounded-xl border-2 border-neutral-200 bg-neutral-100 shadow-sm"
                        >
                          <Image
                            src={img.url}
                            alt={`Additional image ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute right-2 top-2 rounded-full border border-red-200 bg-white p-1.5 text-red-600 opacity-0 shadow-md transition-all hover:bg-red-50 hover:text-red-700 group-hover:opacity-100"
                            aria-label="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      <label className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-all hover:border-[#737373] hover:bg-[#737373]/5">
                        {isUploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-[#737373]" />
                        ) : (
                          <>
                            <Upload className="mb-1 h-6 w-6 text-neutral-400 transition-colors group-hover:text-[#737373]" />
                            <span className="text-xs text-neutral-600 transition-colors group-hover:text-[#737373]">
                              Add Image
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAdditionalImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-200 pt-6">
              <Dialog.Close asChild>
                <Button variant="outline" type="button" text="Cancel" />
              </Dialog.Close>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || isUploading}
                className="min-w-[140px]"
                text={
                  isSubmitting
                    ? product
                      ? "Updating..."
                      : "Creating..."
                    : product
                      ? "Update Product"
                      : "Create Product"
                }
                icon={
                  isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : undefined
                }
              />
            </div>
          </form>

          {/* Image Library Modal */}
          <ImageLibraryModal
            isOpen={isLibraryModalOpen}
            onClose={() => setIsLibraryModalOpen(false)}
            onSelect={(imageUri) => {
              console.log("Image selected from library:", {
                length: imageUri.length,
                preview: imageUri.substring(0, 100) + "...",
              });
              setPrimaryImage(imageUri);
              setImageKey((prev) => prev + 1); // Force re-render
              console.log("Primary image state updated");
              setIsLibraryModalOpen(false);
            }}
          />

          {/* Image Cropper Modal */}
          <ImageCropperModal
            open={isCropperModalOpen}
            onOpenChange={setIsCropperModalOpen}
            imageSrc={tempImageForCrop}
            onCropComplete={handleCropComplete}
            aspect={1}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
