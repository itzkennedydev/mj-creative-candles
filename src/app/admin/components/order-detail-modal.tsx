"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Loader2,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../sca-dashboard/components/ui/button";
import {
  Combobox,
  type ComboboxOption,
} from "../../sca-dashboard/components/ui/combobox";
import { useKeyboardShortcut } from "../../sca-dashboard/components/ui/hooks";
import {
  useUpdateOrderStatus,
  useSendStatusEmail,
} from "~/lib/hooks/use-orders";
import type { Order } from "~/lib/order-types";
import { cn } from "../../sca-dashboard/utils";
import { getOptimizedImageUrl } from "~/lib/types";

interface Product {
  _id: string;
  image?: string;
  imageId?: string;
  images?: Array<{ dataUri: string; imageId: string }>;
}

interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: () => void;
}

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Ready for Pickup", value: "ready_for_pickup" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Paid", value: "paid" },
  { label: "Payment Failed", value: "payment_failed" },
];

const STATUSES_THAT_TRIGGER_EMAIL = [
  "processing",
  "ready_for_pickup",
  "delivered",
  "cancelled",
];

export function OrderDetailModal({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: OrderDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ComboboxOption | null>(
    null,
  );
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [productImages, setProductImages] = useState<Record<string, string[]>>(
    {},
  );
  const [products, setProducts] = useState<
    Array<{ id: string; _id?: string; price?: number }>
  >([]);
  const [pickupLocation, setPickupLocation] = useState<string>("");
  const [isStatusComboboxOpen, setIsStatusComboboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const statusComboboxButtonRef = useRef<HTMLButtonElement>(null);

  const updateStatusMutation = useUpdateOrderStatus();
  const sendEmailMutation = useSendStatusEmail();

  // Keyboard shortcut to open status combobox
  useKeyboardShortcut(
    "s",
    () => {
      if (open && !isStatusComboboxOpen) {
        setIsStatusComboboxOpen(true);
      }
    },
    {
      enabled: open,
    },
  );

  // Also handle keyboard events directly
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Open combobox with 's' key
      if (
        e.key === "s" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isStatusComboboxOpen
      ) {
        e.preventDefault();
        e.stopPropagation();
        setIsStatusComboboxOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isStatusComboboxOpen]);

  // Reset combobox state when modal closes
  useEffect(() => {
    if (!open) {
      setIsStatusComboboxOpen(false);
      setCurrentImageIndex(0);
    }
  }, [open]);

  // Reset image index when images change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [productImages]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          setPickupLocation(data.settings?.pickupLocation || "");
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    void fetchSettings();
  }, []);

  useEffect(() => {
    if (order) {
      const currentStatus = STATUS_OPTIONS.find(
        (opt) => opt.value === order.status,
      );
      setSelectedStatus(
        currentStatus
          ? { label: currentStatus.label, value: currentStatus.value }
          : null,
      );
      setNotes(order.notes || "");

      // Fetch all products and match with order items (matching shop page logic)
      if (order.items && order.items.length > 0) {
        const fetchProductsAndMatch = async () => {
          try {
            const token = sessionStorage.getItem("adminToken");
            const productsResponse = await fetch("/api/products", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!productsResponse.ok) {
              console.warn("Failed to fetch products");
              return;
            }

            const productsData = await productsResponse.json();
            const allProducts = productsData.products || productsData || [];

            // Helper function to get image URL (matching shop page logic)
            const getImageUrl = (
              imageId: string | undefined,
              imagePath: string,
            ) => {
              // If it's a public folder path (starts with /), use it directly
              if (imagePath.startsWith("/")) {
                return imagePath;
              }
              // If it's a data URI and we have an imageId, use the optimization endpoint
              if (
                imagePath.startsWith("data:") &&
                imageId &&
                imageId.length > 10
              ) {
                return getOptimizedImageUrl(imageId, imagePath, 600);
              }
              // If it's an http/https URL, use it directly
              if (
                imagePath.startsWith("http://") ||
                imagePath.startsWith("https://")
              ) {
                return imagePath;
              }
              // Otherwise, assume it's a public folder path and add leading slash if needed
              return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
            };

            const imageMap: Record<string, string[]> = {};

            // Store products for price lookup
            setProducts(allProducts);

            // Match order items with products
            order.items.forEach((item: { productId: string }) => {
              const productId = item.productId;
              if (!productId) return;

              // Try to find product by ID (handle both string and ObjectId formats)
              const product = allProducts.find(
                (p: { id: string; _id?: string }) =>
                  p.id === productId ||
                  p._id?.toString() === productId ||
                  p.id?.toString() === productId ||
                  p._id?.toString() === productId?.toString(),
              );

              if (product) {
                const images: string[] = [];

                // Collect primary image if exists
                if (product.image) {
                  const imageUrl = getImageUrl(product.imageId, product.image);
                  images.push(imageUrl);
                }

                // Collect all additional images
                if (
                  product.images &&
                  Array.isArray(product.images) &&
                  product.images.length > 0
                ) {
                  product.images.forEach(
                    (img: {
                      imageId?: string;
                      dataUri?: string;
                      image?: string;
                    }) => {
                      // Handle both old format (string) and new format (object)
                      if (typeof img === "string") {
                        images.push(getImageUrl(undefined, img));
                      } else if (img.dataUri) {
                        images.push(getImageUrl(img.imageId, img.dataUri));
                      } else if (img.image) {
                        images.push(getImageUrl(img.imageId, img.image));
                      }
                    },
                  );
                }

                if (images.length > 0) {
                  imageMap[productId] = images;
                }
              }
            });

            setProductImages(imageMap);
          } catch (error) {
            console.error("Failed to fetch products:", error);
          }
        };

        void fetchProductsAndMatch();
      }
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!order || !selectedStatus || typeof selectedStatus.value !== "string")
      return;

    setIsUpdating(true);
    try {
      const orderId =
        typeof order._id === "string"
          ? order._id
          : (order._id?.toString() ?? "");
      const statusValue = selectedStatus.value;
      const statusChanged = order.status !== statusValue;
      const notesChanged = (order.notes || "") !== notes.trim();

      // Only update if something changed
      if (!statusChanged && !notesChanged) {
        setIsUpdating(false);
        return;
      }

      // Update order status and/or notes
      await updateStatusMutation.mutateAsync({
        orderId,
        status: statusValue,
        notes: notes.trim() || undefined,
      });

      // If status changed and triggers email, send it
      if (statusChanged && STATUSES_THAT_TRIGGER_EMAIL.includes(statusValue)) {
        try {
          await sendEmailMutation.mutateAsync({
            orderId,
            status: statusValue,
          });
        } catch (emailError) {
          console.error("Failed to send status email:", emailError);
          // Don't fail the update if email fails
        }
      }

      // Call the callback to refresh orders list
      if (onOrderUpdated) {
        onOrderUpdated();
      }

      // Close modal after successful update
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("Failed to update order. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmailClick = () => {
    if (order?.customer?.email) {
      window.location.href = `mailto:${order.customer.email}`;
    }
  };

  const handlePhoneClick = () => {
    if (order?.customer?.phone) {
      window.location.href = `tel:${order.customer.phone}`;
    }
  };

  const handleSMSClick = () => {
    if (order?.customer?.phone) {
      window.location.href = `sms:${order.customer.phone}`;
    }
  };

  // Collect all product images from order items (matching shop page logic)
  const allProductImages = useMemo(() => {
    if (!order?.items || order.items.length === 0) return [];
    const images: Array<{ src: string; productName: string }> = [];
    order.items.forEach((item) => {
      const productId = item.productId;
      if (
        productId &&
        productImages[productId] &&
        productImages[productId].length > 0
      ) {
        // Add all images for this product
        productImages[productId].forEach((imgSrc) => {
          images.push({
            src: imgSrc,
            productName: item.productName || "Unknown Product",
          });
        });
      }
    });
    return images;
  }, [order?.items, productImages]);

  if (!order) return null;

  const orderId =
    typeof order._id === "string" ? order._id : (order._id?.toString() ?? "");
  const createdAt =
    order.createdAt instanceof Date
      ? order.createdAt.toISOString()
      : typeof order.createdAt === "string"
        ? order.createdAt
        : "";

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="animate-fade-in fixed inset-0 z-40 bg-neutral-100 bg-opacity-50 backdrop-blur-md" />
        <Dialog.Content className="scrollbar-hide animate-scale-in fixed inset-0 z-40 m-auto h-fit w-full max-w-screen-xl overflow-y-auto border border-neutral-200 bg-white p-0 shadow-xl sm:rounded-2xl">
          {/* Hidden textarea for auto-sizing */}
          <textarea
            tabIndex={-1}
            aria-hidden="true"
            style={{
              minHeight: "0px",
              maxHeight: "none",
              height: "0px",
              visibility: "hidden" as const,
              overflow: "hidden" as const,
              position: "absolute" as const,
              zIndex: -1000,
              top: "0px",
              right: "0px",
              borderWidth: "0px",
              boxSizing: "border-box",
              fontFamily:
                'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
              fontSize: "12px",
              fontStyle: "normal",
              fontWeight: 400,
              letterSpacing: "normal",
              lineHeight: "16px",
              padding: "0px",
              tabSize: 4,
              textIndent: "0px",
              textRendering: "auto",
              textTransform: "none",
              width: "292.664px",
              wordBreak: "normal",
            }}
            data-aria-hidden="true"
          />

          <span
            style={{
              position: "absolute",
              border: "0px",
              width: "1px",
              height: "1px",
              padding: "0px",
              margin: "-1px",
              overflow: "hidden",
              clip: "rect(0px, 0px, 0px, 0px)",
              whiteSpace: "nowrap",
              overflowWrap: "normal",
            }}
          >
            <Dialog.Title>Order {order.orderNumber}</Dialog.Title>
            <p>Order details for {order.orderNumber}</p>
          </span>
          <div className="flex flex-col items-start gap-2 border-b border-neutral-200 px-6 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 max-w-full items-center gap-1">
              <div className="flex min-w-0 items-center gap-2 px-1.5">
                <span className="min-w-0 truncate text-sm font-semibold text-neutral-800">
                  Order {order.orderNumber}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="group hidden rounded-full p-2 text-neutral-500 transition-all duration-75 hover:bg-neutral-100 focus:outline-none active:bg-neutral-200 md:block"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>
          <div className="grid w-full gap-4 max-md:max-h-[calc(100dvh-200px)] max-md:min-h-[min(566px,_calc(100dvh-200px))] max-md:overflow-auto md:grid-cols-[1.5fr_1fr] md:[&>div]:max-h-[calc(100dvh-200px)] md:[&>div]:min-h-[min(566px,_calc(100dvh-200px))]">
            <div className="scrollbar-hide px-6 md:overflow-auto">
              <div className="flex min-h-full flex-col gap-4 pb-0 pt-6">
                {/* Customer Information */}
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-700">
                    Customer Information
                  </h3>
                  <div className="space-y-2 rounded-lg bg-neutral-50 p-4">
                    <div>
                      <span className="text-sm text-neutral-600">Name: </span>
                      <span className="text-sm font-medium text-black">
                        {order.customer.firstName} {order.customer.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600">Email: </span>
                      <span className="text-sm font-medium text-black">
                        {order.customer.email}
                      </span>
                    </div>
                    {order.customer.phone && (
                      <div>
                        <span className="text-sm text-neutral-600">
                          Phone:{" "}
                        </span>
                        <span className="text-sm font-medium text-black">
                          {order.customer.phone}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  {order.customer && (
                    <div className="mt-4">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        {order.customer.email && (
                          <Button
                            variant="secondary"
                            onClick={handleEmailClick}
                            className="flex-1 justify-start bg-white"
                            text="Send Email"
                            icon={<Mail className="h-4 w-4" />}
                          />
                        )}
                        {order.customer.phone && (
                          <>
                            <Button
                              variant="secondary"
                              onClick={handlePhoneClick}
                              className="flex-1 justify-start bg-white"
                              text="Call Customer"
                              icon={<Phone className="h-4 w-4" />}
                            />
                            <Button
                              variant="secondary"
                              onClick={handleSMSClick}
                              className="flex-1 justify-start bg-white"
                              text="Send SMS"
                              icon={<MessageSquare className="h-4 w-4" />}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pickup Location / Shipping Address */}
                {order.shipping && (
                  <div className="mb-6">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700">
                      <MapPin className="h-4 w-4" />
                      {order.shipping.street === "Pickup Only" ||
                      order.shipping.city === "Pickup Location"
                        ? "Pickup Location"
                        : "Shipping Address"}
                    </h3>
                    <div className="rounded-lg bg-neutral-50 p-4">
                      <div className="text-sm text-neutral-600">
                        {order.shipping.street === "Pickup Only" ||
                        order.shipping.city === "Pickup Location" ? (
                          <div>
                            {pickupLocation || "415 13th St, Moline, IL 61265"}
                          </div>
                        ) : (
                          <>
                            {order.shipping.street && (
                              <div>{order.shipping.street}</div>
                            )}
                            {order.shipping.city && order.shipping.state && (
                              <div>
                                {order.shipping.city}, {order.shipping.state}{" "}
                                {order.shipping.zipCode}
                              </div>
                            )}
                            {order.shipping.country && (
                              <div>{order.shipping.country}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-700">
                    Order Items
                  </h3>
                  <div className="rounded-lg bg-neutral-50 p-4">
                    <div className="space-y-3">
                      {order.items.map((item, idx) => {
                        const itemName = item.productName || "Unknown Product";
                        // Handle both 'productPrice' and 'price' for backward compatibility
                        let itemPrice =
                          (item as { productPrice?: number; price?: number })
                            .productPrice ??
                          (item as { productPrice?: number; price?: number })
                            .price ??
                          0;

                        // If price is 0 or missing, try to get it from the product
                        if (itemPrice === 0 && item.productId) {
                          const product = products.find(
                            (p) =>
                              p.id === item.productId ||
                              p._id?.toString() === item.productId ||
                              p.id?.toString() === item.productId ||
                              p._id?.toString() === item.productId?.toString(),
                          );
                          if (product && product.price) {
                            itemPrice = product.price;
                          }
                        }

                        const productImage = item.productId
                          ? productImages[item.productId]
                          : null;

                        return (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-3 last:border-0 last:pb-0"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 text-sm font-medium text-black">
                                {itemName}
                              </div>
                              <div className="space-y-0.5 text-xs text-neutral-600">
                                <div>
                                  Quantity: {item.quantity} ×{" "}
                                  {formatCurrency(itemPrice)}
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0 pt-1 text-sm font-semibold text-black">
                              {formatCurrency(itemPrice * item.quantity)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Product Images Carousel - Separate Container */}
            <div className="scrollbar-hide px-6 md:overflow-auto md:pl-0 md:pr-4">
              <div className="rounded-lg bg-white pt-6">
                <h2 className="mb-3 pr-6 text-sm font-medium text-neutral-700">
                  Product Images
                </h2>
                {allProductImages.length > 0 ? (
                  <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                    {allProductImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          idx === currentImageIndex
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      >
                        {img.src.startsWith("data:") ||
                        img.src.startsWith("http") ? (
                          <img
                            src={img.src}
                            alt={img.productName}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : img.src.startsWith("/api/images/") ? (
                          <Image
                            src={img.src}
                            alt={img.productName}
                            fill
                            className="object-cover"
                            sizes="400px"
                            unoptimized
                          />
                        ) : (
                          <Image
                            src={img.src}
                            alt={img.productName}
                            fill
                            className="object-cover"
                            sizes="400px"
                          />
                        )}
                      </div>
                    ))}

                    {/* Navigation Arrows */}
                    {allProductImages.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImageIndex(
                              currentImageIndex > 0
                                ? currentImageIndex - 1
                                : allProductImages.length - 1,
                            )
                          }
                          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-lg transition-all duration-200 hover:bg-white"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImageIndex(
                              currentImageIndex < allProductImages.length - 1
                                ? currentImageIndex + 1
                                : 0,
                            )
                          }
                          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-lg transition-all duration-200 hover:bg-white"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {/* Image Dots Indicator */}
                    {allProductImages.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-x-1.5">
                        {allProductImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                              currentImageIndex === idx
                                ? "w-4 bg-white"
                                : "bg-white/50 hover:bg-white/70"
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative mx-6 mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                    <p className="text-sm text-neutral-500">
                      No images available
                    </p>
                  </div>
                )}
              </div>

              {/* Status Update Container */}
              <div className="relative flex flex-col gap-3">
                {/* Status Update */}
                <div className="mb-0">
                  <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                    Update Status
                  </label>
                  <div className="w-full">
                    <Combobox
                      selected={selectedStatus}
                      setSelected={(option: ComboboxOption | null) =>
                        setSelectedStatus(option)
                      }
                      options={STATUS_OPTIONS}
                      placeholder="Select status..."
                      buttonProps={{ className: "w-full" }}
                      caret={true}
                      open={isStatusComboboxOpen}
                      onOpenChange={(newOpen) => {
                        setIsStatusComboboxOpen(newOpen);
                      }}
                    >
                      <div className="flex w-full min-w-0 items-center gap-2">
                        <span className="min-w-0 grow truncate text-left">
                          {selectedStatus
                            ? selectedStatus.label
                            : "Select status..."}
                        </span>
                        <kbd className="hidden shrink-0 rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-xs font-light text-neutral-400 md:inline-block">
                          S
                        </kbd>
                      </div>
                    </Combobox>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Select a new status to update this order
                  </p>
                </div>

                {/* Notes */}
                <div className="mb-0 pb-6">
                  <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="block min-h-[80px] w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    placeholder="Add notes about this order..."
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-neutral-200 bg-white px-6 py-3">
            <Dialog.Close asChild>
              <Button variant="outline" text="Cancel" />
            </Dialog.Close>
            <Button
              onClick={handleStatusUpdate}
              disabled={
                isUpdating ||
                !selectedStatus ||
                (typeof selectedStatus.value === "string" &&
                  selectedStatus.value === order.status &&
                  (order.notes || "") === notes.trim())
              }
              icon={
                isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : undefined
              }
              text={isUpdating ? "Updating..." : "Save Changes"}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
