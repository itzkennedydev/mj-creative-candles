"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Loader2, Mail, Phone, MessageSquare, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "~/lib/status-badge-utils";
import { Button } from "../../../sca-dashboard/components/ui/button";
import { Combobox, type ComboboxOption } from "../../../sca-dashboard/components/ui/combobox";
import { useKeyboardShortcut } from "../../../sca-dashboard/components/ui/hooks";
import { useUpdateOrderStatus, useSendStatusEmail } from "~/lib/hooks/use-orders";
import type { Order } from "~/lib/order-types";
import { MainNav } from "../../../sca-dashboard/components/layout/main-nav";
import { AppSidebarNav } from "../../../sca-dashboard/components/layout/sidebar/app-sidebar-nav";
import { HelpButton } from "../../../sca-dashboard/components/layout/sidebar/help-button";
import { SettingsButton } from "../../../sca-dashboard/components/layout/sidebar/settings-button";
import { PageContent } from "../../../sca-dashboard/components/layout/page-content";
import { PageWidthWrapper } from "../../../sca-dashboard/components/layout/page-width-wrapper";
import { getOptimizedImageUrl } from "~/lib/types";

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

const STATUSES_THAT_TRIGGER_EMAIL = ["processing", "ready_for_pickup", "delivered", "cancelled"];

interface ProductImage {
  id?: string;
  imageId?: string;
  dataUri?: string;
  image?: string;
  mimeType?: string;
  filename?: string;
}

interface Product {
  id: string;
  _id?: string;
  name?: string;
  image?: string;
  imageId?: string;
  images?: (string | ProductImage)[];
}

interface SettingsResponse {
  settings?: {
    pickupLocation?: string;
  };
}

interface OrderResponse {
  order: Order;
}

interface ProductsResponse {
  products?: Product[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ComboboxOption | null>(null);
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});
  const [products, setProducts] = useState<Array<{ id: string; _id?: string; price?: number }>>([]);
  const [pickupLocation, setPickupLocation] = useState<string>("");
  const [isStatusComboboxOpen, setIsStatusComboboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const updateStatusMutation = useUpdateOrderStatus();
  const sendEmailMutation = useSendStatusEmail();

  // Keyboard shortcut to open status combobox
  useKeyboardShortcut("s", () => {
    if (!isStatusComboboxOpen && order) {
      setIsStatusComboboxOpen(true);
    }
  }, {
    enabled: !!order,
  });

  // Reset image index when images change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [productImages]);

  // Also handle keyboard events directly
  useEffect(() => {
    if (!order) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Open combobox with 's' key
      if (e.key === "s" && !e.metaKey && !e.ctrlKey && !e.altKey && !isStatusComboboxOpen) {
        e.preventDefault();
        e.stopPropagation();
        setIsStatusComboboxOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [order, isStatusComboboxOpen]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json() as SettingsResponse;
          setPickupLocation(data.settings?.pickupLocation ?? "");
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    void fetchSettings();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = sessionStorage.getItem("adminToken");
        if (!token) {
          router.push("/admin/login");
          return;
        }

        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json() as OrderResponse;
        setOrder(data.order);
        
        const currentStatus = STATUS_OPTIONS.find(opt => opt.value === data.order.status);
        setSelectedStatus(currentStatus ? { label: currentStatus.label, value: currentStatus.value } : null);
        setNotes(data.order.notes ?? "");

        // Fetch all products and match with order items (matching shop page logic)
        if (data.order.items && data.order.items.length > 0) {
          try {
            const productsResponse = await fetch("/api/products", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (productsResponse.ok) {
              const productsData = await productsResponse.json() as ProductsResponse | Product[];
              const allProducts: Product[] = Array.isArray(productsData) 
                ? productsData 
                : (productsData.products ?? []);
              
              // Helper function to get image URL (matching shop page logic)
              const getImageUrl = (imageId: string | undefined, imagePath: string) => {
                // If it's a public folder path (starts with /), use it directly
                if (imagePath.startsWith('/')) {
                  return imagePath;
                }
                // If it's a data URI and we have an imageId, use the optimization endpoint
                if (imagePath.startsWith('data:') && imageId && imageId.length > 10) {
                  return getOptimizedImageUrl(imageId, imagePath, 600);
                }
                // If it's an http/https URL, use it directly
                if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                  return imagePath;
                }
                // Otherwise, assume it's a public folder path and add leading slash if needed
                return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
              };
              
              const imageMap: Record<string, string[]> = {};
              
              // Store products for price lookup
              setProducts(allProducts);
              
              // Match order items with products
              data.order.items.forEach((item) => {
                const productId = item.productId;
                if (!productId) return;
                
                // Try to find product by ID (handle both string and ObjectId formats)
                const product = allProducts.find((p) => 
                  p.id === productId || 
                  p._id?.toString() === productId ||
                  p.id?.toString() === productId ||
                  p._id?.toString() === productId?.toString()
                );
                
                if (product) {
                  const images: string[] = [];
                  
                  // Collect primary image if exists
                  if (product.image) {
                    const imageUrl = getImageUrl(product.imageId, product.image);
                    images.push(imageUrl);
                  }
                  
                  // Collect all additional images
                  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                    product.images.forEach((img) => {
                      // Handle both old format (string) and new format (object)
                      if (typeof img === 'string') {
                        images.push(getImageUrl(undefined, img));
                      } else {
                        const productImage: ProductImage = img;
                        if (productImage.dataUri) {
                          images.push(getImageUrl(productImage.imageId, productImage.dataUri));
                        } else if (productImage.image) {
                          images.push(getImageUrl(productImage.imageId, productImage.image));
                        }
                      }
                    });
                  }
                  
                  if (images.length > 0) {
                    imageMap[productId] = images;
                  }
                }
              });
              
              setProductImages(imageMap);
            }
          } catch (error) {
            console.error("Failed to fetch products:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      void fetchOrder();
    }
  }, [orderId, router]);

  const handleStatusUpdate = async () => {
    if (!order || !selectedStatus || typeof selectedStatus.value !== 'string') return;

    setIsUpdating(true);
    try {
      const statusValue = selectedStatus.value;
      const statusChanged = order.status !== statusValue;
      const notesChanged = (order.notes ?? "") !== notes.trim();

      if (!statusChanged && !notesChanged) {
        setIsUpdating(false);
        return;
      }

      await updateStatusMutation.mutateAsync({
        orderId: orderId,
        status: statusValue,
        notes: notes.trim() || undefined,
      });

      if (statusChanged && STATUSES_THAT_TRIGGER_EMAIL.includes(statusValue)) {
        try {
          await sendEmailMutation.mutateAsync({
            orderId: orderId,
            status: statusValue,
          });
        } catch (emailError) {
          console.error("Failed to send status email:", emailError);
        }
      }

      // Refresh order data
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json() as OrderResponse;
      setOrder(data.order);
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
    if (!order?.items || order.items.length === 0) {
      console.log('allProductImages: No order items');
      return [];
    }
    const images: Array<{ src: string; productName: string }> = [];
    console.log('allProductImages: Processing', order.items.length, 'items');
    console.log('allProductImages: productImages state:', productImages);
    console.log('allProductImages: productImages keys:', Object.keys(productImages));
    
    order.items.forEach((item) => {
      const productId = item.productId;
      console.log('allProductImages: Processing item with productId:', productId, 'productName:', item.productName);
      
      // Try to find images using productId (handle both string and ObjectId formats)
      let productImagesForItem = productImages[productId];
      
      // If not found, try converting productId to string
      if (!productImagesForItem && productId) {
        const productIdStr = String(productId);
        productImagesForItem = productImages[productIdStr];
      }
      
      // Try all keys to find a match (in case of ID format mismatches)
      if (!productImagesForItem) {
        const matchingKey = Object.keys(productImages).find(key => 
          String(key) === String(productId) || 
          key.includes(String(productId)) || 
          String(productId).includes(key)
        );
        if (matchingKey) {
          productImagesForItem = productImages[matchingKey];
          console.log(`Found images using matching key: ${matchingKey}`);
        }
      }
      
      if (productImagesForItem && productImagesForItem.length > 0) {
        console.log('allProductImages: Found', productImagesForItem.length, 'images for productId:', productId);
        // Add all images for this product
        productImagesForItem.forEach((imgSrc) => {
          images.push({
            src: imgSrc,
            productName: item.productName || 'Unknown Product'
          });
        });
      } else {
        console.log('allProductImages: No images found for productId:', productId, 'Available keys:', Object.keys(productImages));
      }
    });
    console.log('allProductImages computed:', images.length, 'total images');
    return images;
  }, [order?.items, productImages]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <MainNav
        sidebar={AppSidebarNav}
        toolContent={
          <>
            <SettingsButton />
            <HelpButton />
          </>
        }
      >
        <PageContent title="Order Details">
          <PageWidthWrapper>
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
          </PageWidthWrapper>
        </PageContent>
      </MainNav>
    );
  }

  if (!order) {
    return (
      <MainNav
        sidebar={AppSidebarNav}
        toolContent={
          <>
            <SettingsButton />
            <HelpButton />
          </>
        }
      >
        <PageContent title="Order Details">
          <PageWidthWrapper>
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <p className="text-neutral-600">Order not found</p>
              <Button onClick={() => router.push("/admin/orders")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </div>
          </PageWidthWrapper>
        </PageContent>
      </MainNav>
    );
  }

  return (
    <MainNav
      sidebar={AppSidebarNav}
      toolContent={
        <>
          <SettingsButton />
          <HelpButton />
        </>
      }
    >
      <PageContent title="Order Details">
        <PageWidthWrapper>
          <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Button onClick={() => router.push("/admin/orders")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
              {/* Main Content */}
              <div className="space-y-6">
                {/* Order Info Card */}
                <div className="bg-white border border-neutral-200 rounded-lg p-5 sm:p-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Order {order.orderNumber}</h2>
                      <p className="text-sm text-neutral-500">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Customer Information */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-neutral-700 mb-3">Customer Information</h3>
                    <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                      <div>
                        <span className="text-sm text-neutral-600">Name: </span>
                        <span className="text-sm font-medium text-black">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-neutral-600">Email: </span>
                        <span className="text-sm font-medium text-black">{order.customer?.email}</span>
                      </div>
                      {order.customer?.phone && (
                        <div>
                          <span className="text-sm text-neutral-600">Phone: </span>
                          <span className="text-sm font-medium text-black">{order.customer.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    {order.customer && (
                      <div className="mt-4">
                        <div className="flex flex-col sm:flex-row gap-2">
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
                      <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {(order.shipping.street === "Pickup Only" || order.shipping.city === "Pickup Location") ? "Pickup Location" : "Shipping Address"}
                      </h3>
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <div className="text-sm text-neutral-600">
                          {(order.shipping.street === "Pickup Only" || order.shipping.city === "Pickup Location") ? (
                            <div>{pickupLocation ?? "415 13th St, Moline, IL 61265"}</div>
                          ) : (
                            <>
                              {order.shipping.street && (
                                <div>{order.shipping.street}</div>
                              )}
                              {order.shipping.city && order.shipping.state && (
                                <div>
                                  {order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}
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
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 mb-3">Order Items</h3>
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => {
                          const itemName = item.productName || 'Unknown Product';
                          // Handle both 'productPrice' and 'price' for backward compatibility
                          let itemPrice = (item as { productPrice?: number; price?: number }).productPrice ?? 
                                         (item as { productPrice?: number; price?: number }).price ?? 0;
                          
                          // If price is 0 or missing, try to get it from the product
                          if (itemPrice === 0 && item.productId) {
                            const product = products.find((p) => 
                              p.id === item.productId || 
                              p._id?.toString() === item.productId ||
                              p.id?.toString() === item.productId ||
                              p._id?.toString() === item.productId?.toString()
                            );
                            if (product?.price) {
                              itemPrice = product.price;
                            }
                          }
                          
                          return (
                            <div key={idx} className="flex justify-between items-start border-b border-neutral-200 pb-3 last:border-0 last:pb-0 gap-4">
                              <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-black mb-1">{itemName}</div>
                                  <div className="text-xs text-neutral-600 space-y-0.5">
                                    <div>Quantity: {item.quantity} × {formatCurrency(itemPrice)}</div>
                                    {item.selectedSize && (
                                      <div>Size: {item.selectedSize}</div>
                                    )}
                                    {(item.selectedColor ?? item.customColorValue) && (
                                      <div>Color: {item.customColorValue ?? item.selectedColor}</div>
                                    )}
                                  </div>
                              </div>
                              <div className="font-semibold text-sm text-black flex-shrink-0 pt-1">
                                {formatCurrency(itemPrice * item.quantity)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <h3 className="text-sm font-semibold text-neutral-700 mb-3">Payment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-500">Payment Method</p>
                        <p className="font-medium">
                          {order.paymentMethod?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Total Amount</p>
                        <p className="text-xl font-semibold">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-0">
                {/* Product Images and Status Update - Combined Container */}
                <div className="bg-white rounded-lg">
                  {/* Product Images Carousel */}
                  {allProductImages.length > 0 ? (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-100">
                      {allProductImages.map((img, idx) => (
                        <div
                          key={idx}
                          className={`absolute inset-0 transition-opacity duration-300 ${
                            idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          {img.src.startsWith('data:') || img.src.startsWith('http') ? (
                            <img
                              src={img.src}
                              alt={img.productName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : img.src.startsWith('/api/images/') ? (
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
                            onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : allProductImages.length - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 rounded-full transition-all duration-200 z-10 shadow-lg"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex(currentImageIndex < allProductImages.length - 1 ? currentImageIndex + 1 : 0)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 rounded-full transition-all duration-200 z-10 shadow-lg"
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      {/* Image Dots Indicator */}
                      {allProductImages.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-x-1.5 z-10">
                          {allProductImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                currentImageIndex === idx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'
                              }`}
                              aria-label={`Go to slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
                      <p className="text-sm text-neutral-500">No images available</p>
                    </div>
                  )}

                  {/* Status Update Container */}
                  <div className="px-0 py-4">
                  {/* Status Update */}
                  <div className="mb-6 px-0">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Update Status
                        </label>
                        <Combobox
                          selected={selectedStatus}
                          setSelected={(option: ComboboxOption | null) => setSelectedStatus(option)}
                          options={STATUS_OPTIONS}
                          placeholder="Select status..."
                          buttonProps={{ className: "w-full" }}
                          caret={true}
                          open={isStatusComboboxOpen}
                          onOpenChange={(newOpen) => {
                            setIsStatusComboboxOpen(newOpen);
                          }}
                        >
                          <div className="flex items-center w-full min-w-0 gap-2">
                            <span className="min-w-0 grow truncate text-left">
                              {selectedStatus ? selectedStatus.label : "Select status..."}
                            </span>
                            <kbd className="hidden shrink-0 rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-xs font-light text-neutral-400 md:inline-block">
                              S
                            </kbd>
                          </div>
                        </Combobox>
                        <p className="text-xs text-neutral-500 mt-1">
                          Select a new status to update this order
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-6 px-0">
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this order..."
                      className="w-full min-h-[80px] px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Update Order Button */}
                  <div>
                    <Button
                      onClick={() => void handleStatusUpdate()}
                      disabled={
                        isUpdating || 
                        !selectedStatus || 
                        (typeof selectedStatus.value === 'string' && selectedStatus.value === order.status && (order.notes ?? "") === notes.trim())
                      }
                      variant="primary"
                      className="w-full"
                      text={isUpdating ? "Updating..." : "Update Order"}
                      icon={isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                    />
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageWidthWrapper>
      </PageContent>
    </MainNav>
  );
}
