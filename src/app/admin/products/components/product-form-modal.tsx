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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);

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
  const [additionalImages, setAdditionalImages] = useState<
    Array<{ url: string; file?: File }>
  >([]);
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);

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
      setUploadError("");
    }
  }, [product, open]);

  const handlePrimaryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("Image size must be less than 25MB");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

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
      setPrimaryImage(data.url);
      setPrimaryImageFile(file);
      setUploadError("");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image",
      );
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
      setUploadError("Please select an image file");
      return;
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("Image size must be less than 25MB");
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

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
      setAdditionalImages((prev) => [...prev, { url: data.url, file }]);
      setUploadError("");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || parseFloat(price) <= 0) {
      setUploadError("Please fill in all required fields");
      return;
    }

    if (!primaryImage) {
      setUploadError("Please upload a primary image");
      return;
    }

    setIsSubmitting(true);
    setUploadError("");

    try {
      const token = sessionStorage.getItem("adminToken");

      // Prepare product data
      const productData: Partial<Product> = {
        name,
        description: description || "",
        price: parseFloat(price),
        image: primaryImage,
        category: category || "Apparel",
        inStock,
        topNotes: topNotes || undefined,
        middleNotes: middleNotes || undefined,
        baseNotes: baseNotes || undefined,
        scentFamily: scentFamily || undefined,
        burnTime: burnTime || undefined,
        images: additionalImages.map((img) => ({
          id: `img_${Date.now()}_${Math.random()}`,
          imageId: "",
          dataUri: img.url,
          mimeType: "image/png",
          filename: img.url.split("/").pop() || "image.png",
        })),
      };

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

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Save error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to save product",
      );
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
            {uploadError && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">
                  {uploadError}
                </p>
              </div>
            )}

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
                      Primary Image <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-sm text-neutral-500">
                      This will be the main product image displayed in the shop
                    </p>
                  </div>

                  {primaryImage ? (
                    <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-xl border-2 border-neutral-200 bg-neutral-100 shadow-sm">
                      <Image
                        src={primaryImage}
                        alt="Primary product image"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPrimaryImage("");
                          setPrimaryImageFile(null);
                        }}
                        className="absolute right-3 top-3 rounded-full border border-red-200 bg-white p-2 text-red-600 shadow-md transition-all hover:bg-red-50 hover:text-red-700"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
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
                            Change Image
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
                  ) : (
                    <div className="space-y-3">
                      <label className="group flex aspect-square w-full max-w-sm cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-all hover:border-[#737373] hover:bg-[#737373]/5">
                        {isUploading ? (
                          <>
                            <Loader2 className="mb-3 h-10 w-10 animate-spin text-[#737373]" />
                            <span className="text-sm font-medium text-neutral-700">
                              Uploading...
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="mb-4 rounded-full bg-[#737373]/10 p-4 transition-colors group-hover:bg-[#737373]/20">
                              <Upload className="h-8 w-8 text-[#737373]" />
                            </div>
                            <span className="mb-1 text-sm font-medium text-neutral-700">
                              Click to upload
                            </span>
                            <span className="text-xs text-neutral-500">
                              PNG, JPG, GIF up to 25MB
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePrimaryImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>

                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-neutral-200"></div>
                        <span className="text-xs text-neutral-500">or</span>
                        <div className="h-px flex-1 bg-neutral-200"></div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsLibraryModalOpen(true)}
                        className="flex w-full max-w-sm items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Select from Image Library
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Images */}
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
              setPrimaryImage(imageUri);
              setIsLibraryModalOpen(false);
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
