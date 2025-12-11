"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "../../../sca-dashboard/components/ui/button";
import { Input } from "../../../sca-dashboard/components/ui/input";
import { Combobox, type ComboboxOption } from "../../../sca-dashboard/components/ui/combobox";
import Image from "next/image";
import type { Product } from "~/lib/types";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

const CATEGORIES = [
  "Apparel",
  "Accessories",
  "Elite Volleyball"
];

const SHOP_TYPES: ComboboxOption[] = [
  { label: "Regular Shop", value: "regular-shop" },
  { label: "Spirit Wear", value: "spirit-wear" }
];

const SCHOOLS: ComboboxOption[] = [
  { label: "Moline", value: "moline" },
  { label: "United Township", value: "united-township" },
  { label: "Rock Island", value: "rock-island" },
  { label: "North", value: "north" }
];

export function ProductFormModal({ open, onOpenChange, product, onSuccess }: ProductFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  
  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>("");
  const [shopType, setShopType] = useState<ComboboxOption | null>(null);
  const [school, setSchool] = useState<ComboboxOption | null>(null);
  const [inStock, setInStock] = useState(true);
  const [sizes, setSizes] = useState<string>("");
  const [colors, setColors] = useState<string>("");
  
  // Images
  const [primaryImage, setPrimaryImage] = useState<string>("");
  const [additionalImages, setAdditionalImages] = useState<Array<{ url: string; file?: File }>>([]);
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);

  // Reset form when product changes or modal opens/closes
  useEffect(() => {
    if (open) {
      if (product) {
        // Edit mode - populate form
        setName(product.name || "");
        setDescription(product.description || "");
        setPrice(product.price?.toString() || "");
        setCategory(product.category || "");
        setShopType(product.shopType ? SHOP_TYPES.find(s => s.value === product.shopType) || null : null);
        setSchool(product.school ? SCHOOLS.find(s => s.value === product.school) || null : null);
        setInStock(product.inStock !== false);
        setSizes(product.sizes?.join(", ") || "");
        setColors(product.colors?.join(", ") || "");
        setPrimaryImage(product.image || "");
        setAdditionalImages(
          product.images?.map(img => ({
            url: typeof img === 'string' ? img : img.dataUri,
            file: undefined
          })) || []
        );
      } else {
        // Add mode - reset form
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setShopType(null);
        setSchool(null);
        setInStock(true);
        setSizes("");
        setColors("");
        setPrimaryImage("");
        setAdditionalImages([]);
        setPrimaryImageFile(null);
      }
      setUploadError("");
    }
  }, [product, open]);

  const handlePrimaryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('Image size must be less than 25MB');
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = sessionStorage.getItem("adminToken");
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      setPrimaryImage(data.url);
      setPrimaryImageFile(file);
      setUploadError("");
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('Image size must be less than 25MB');
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = sessionStorage.getItem("adminToken");
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      setAdditionalImages(prev => [...prev, { url: data.url, file }]);
      setUploadError("");
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price || parseFloat(price) <= 0) {
      setUploadError('Please fill in all required fields');
      return;
    }

    if (!primaryImage) {
      setUploadError('Please upload a primary image');
      return;
    }

    setIsSubmitting(true);
    setUploadError("");

    try {
      const token = sessionStorage.getItem("adminToken");
      
      // Prepare product data
      const productData: Partial<Product> = {
        name,
        description: description || '',
        price: parseFloat(price),
        image: primaryImage,
        category: category || 'Apparel',
        shopType: shopType?.value as 'spirit-wear' | 'regular-shop' | undefined,
        school: school?.value as 'moline' | 'united-township' | 'rock-island' | 'north' | undefined,
        inStock,
        sizes: sizes ? sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: colors ? colors.split(',').map(c => c.trim()).filter(Boolean) : [],
        images: additionalImages.map(img => ({
          id: `img_${Date.now()}_${Math.random()}`,
          imageId: '',
          dataUri: img.url,
          mimeType: 'image/png',
          filename: img.url.split('/').pop() || 'image.png'
        }))
      };

      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save product');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 m-auto h-fit w-full max-w-4xl border border-neutral-200 bg-white shadow-xl sm:rounded-2xl overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 sticky top-0 bg-white z-10">
            <Dialog.Title className="text-xl font-semibold text-neutral-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {uploadError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-sm font-medium text-red-800">{uploadError}</p>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Information */}
              <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1">Basic Information</h3>
                <p className="text-sm text-neutral-500">Enter the product details</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
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
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description"
                  rows={3}
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Category
                  </label>
                  <Combobox
                    options={CATEGORIES.map(cat => ({ label: cat, value: cat }))}
                    selected={category ? { label: category, value: category } : null}
                    setSelected={(option: ComboboxOption<string> | null) => setCategory(option?.value || "")}
                    placeholder="Select category"
                    buttonProps={{ className: "w-full" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Shop Type
                  </label>
                  <Combobox
                    options={SHOP_TYPES}
                    selected={shopType}
                    setSelected={setShopType}
                    placeholder="Select shop type"
                    buttonProps={{ className: "w-full" }}
                  />
                </div>

                {shopType?.value === 'spirit-wear' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      School
                    </label>
                    <Combobox
                      options={SCHOOLS}
                      selected={school}
                      setSelected={setSchool}
                      placeholder="Select school"
                      buttonProps={{ className: "w-full" }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Sizes (comma-separated)
                  </label>
                  <Input
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    placeholder="S, M, L, XL, XXL"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Colors (comma-separated)
                  </label>
                  <Input
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    placeholder="Black, White, Red"
                    className="w-full"
                  />
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
                <label htmlFor="inStock" className="text-sm font-medium text-neutral-700">
                  In Stock
                </label>
              </div>
            </div>

              {/* Right Column - Images */}
              <div className="space-y-6">
                {/* Primary Image */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900 mb-1">Primary Image <span className="text-red-500">*</span></h3>
                    <p className="text-sm text-neutral-500">This will be the main product image displayed in the shop</p>
                  </div>
              
              {primaryImage ? (
                <div className="relative w-full aspect-square max-w-sm border-2 border-neutral-200 rounded-xl overflow-hidden bg-neutral-100 shadow-sm">
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
                    className="absolute top-3 right-3 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 p-2 rounded-full shadow-md transition-all border border-red-200"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 right-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById('primary-image-input')?.click()}
                      className="w-full bg-white/90 hover:bg-white text-neutral-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors border border-neutral-200"
                    >
                      Change Image
                    </button>
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
                <label className="flex flex-col items-center justify-center w-full aspect-square max-w-sm border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-[#737373] hover:bg-[#737373]/5 transition-all bg-neutral-50 group">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-10 w-10 animate-spin text-[#737373] mb-3" />
                      <span className="text-sm font-medium text-neutral-700">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <div className="bg-[#737373]/10 group-hover:bg-[#737373]/20 rounded-full p-4 mb-4 transition-colors">
                        <Upload className="h-8 w-8 text-[#737373]" />
                      </div>
                      <span className="text-sm font-medium text-neutral-700 mb-1">Click to upload</span>
                      <span className="text-xs text-neutral-500">PNG, JPG, GIF up to 25MB</span>
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
              )}
                </div>

                {/* Additional Images */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900 mb-1">Additional Images</h3>
                    <p className="text-sm text-neutral-500">Add more images to showcase different angles or variants</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                {additionalImages.map((img, index) => (
                  <div key={index} className="relative aspect-square border-2 border-neutral-200 rounded-xl overflow-hidden bg-neutral-100 shadow-sm group">
                    <Image
                      src={img.url}
                      alt={`Additional image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute top-2 right-2 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 p-1.5 rounded-full transition-all shadow-md border border-red-200 opacity-0 group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-[#737373] hover:bg-[#737373]/5 transition-all bg-neutral-50 group">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#737373]" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-neutral-400 group-hover:text-[#737373] mb-1 transition-colors" />
                      <span className="text-xs text-neutral-600 group-hover:text-[#737373] transition-colors">Add Image</span>
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
            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-neutral-200">
              <Dialog.Close asChild>
                <Button variant="outline" type="button" text="Cancel" />
              </Dialog.Close>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting || isUploading}
                className="min-w-[140px]"
                text={isSubmitting ? (product ? 'Updating...' : 'Creating...') : (product ? 'Update Product' : 'Create Product')}
                icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              />
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

