"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { 
  Settings, 
  Package, 
  Save, 
  Trash2, 
  Upload, 
  X, 
  Menu, 
  Search,
  Filter,
  DollarSign, 
  Clock, 
  CheckCircle, 
  Eye, 
  Plus, 
  BarChart3,
  Activity
} from "lucide-react";
import { useProducts } from "~/lib/products-context";
import { useToast } from "~/lib/toast-context";
import type { Product, ProductImage } from "~/lib/types";
import type { Order } from "~/lib/order-types";
import { useOrders, useUpdateOrderStatus, useSendPickupNotification, useSendStatusEmail } from "~/lib/hooks/use-orders";
import { useGallery } from "~/lib/hooks/use-gallery";
import { env } from "~/env";
import { Image as ImageIcon } from "lucide-react";

interface AdminSettings {
  taxRate: number;
  shippingEnabled: boolean;
  pickupOnly: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
  pickupInstructions: string;
}

export default function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct, loading: productsLoading, error: productsError } = useProducts();
  const { addToast } = useToast();
  
  // Use TanStack Query for gallery with caching
  const { data: galleryData, isLoading: isGalleryLoading, refetch: refetchGallery } = useGallery();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeSection, setActiveSection] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  
  // TanStack Query hooks
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useOrders(currentPage, searchQuery);
  const updateOrderStatus = useUpdateOrderStatus();
  const sendPickupNotification = useSendPickupNotification();
  const sendStatusEmail = useSendStatusEmail();
  
  // Extract data from query result
  const orders = ordersData?.orders ?? [];
  const totalPages = ordersData?.totalPages ?? 1;
  const totalOrders = ordersData?.total ?? 0;
  const ordersPerPage = 10;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupTime, setPickupTime] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editProduct, setEditProduct] = useState({
    name: "",
    price: 0,
    description: "",
    inStock: true,
    sizes: [] as string[],
    colors: [] as string[],
    image: "",
    imageId: "",
    images: [] as ProductImage[] // Multiple images support
  });
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAssetGallery, setShowAssetGallery] = useState(false);
  const [imageSelectionMode, setImageSelectionMode] = useState<'primary' | 'additional'>('primary');
  
  // Get gallery images from TanStack Query (with caching)
  const galleryImages = galleryData?.images ?? [];
  const galleryLoading = isGalleryLoading || false;
  
  const [settings, setSettings] = useState<AdminSettings>({
    taxRate: 8.5,
    shippingEnabled: true,
    pickupOnly: false,
    freeShippingThreshold: 50,
    shippingCost: 9.99,
    pickupInstructions: "Please call (309) 373-6017 to schedule pickup. Available Monday-Friday 9AM-5PM."
  });

  const sidebarItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: BarChart3,
      description: "Overview & Analytics",
      badge: null
    },
    { 
      id: "orders", 
      label: "Orders", 
      icon: Package,
      description: "Manage Orders",
      badge: orders.filter(o => o.status === 'pending').length > 0 ? orders.filter(o => o.status === 'pending').length : null
    },
    { 
      id: "products", 
      label: "Products", 
      icon: Plus,
      description: "Inventory Management",
      badge: null
    },
    { 
      id: "gallery", 
      label: "Gallery", 
      icon: ImageIcon,
      description: "Asset Library",
      badge: null
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: Settings,
      description: "Store Configuration",
      badge: null
    },
  ];

  useEffect(() => {
    setMounted(true);
    // Check if user is already authenticated (from sessionStorage)
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Gallery images are automatically loaded and cached via TanStack Query

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMobileMenu && !(event.target as Element).closest('.mobile-menu')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  // Remove old fetchOrders function - now handled by TanStack Query

  // Remove useEffect - TanStack Query handles data fetching automatically

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    // TanStack Query will automatically refetch when searchQuery changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // TanStack Query will automatically refetch when currentPage changes
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrderForModal(order);
    setShowOrderModal(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // If changing to "ready_for_pickup", open the modal instead
    if (newStatus === 'ready_for_pickup') {
      const order = orders.find(o => o._id?.toString() === orderId);
      if (order) {
        handlePickupReady(order);
        return;
      }
    }

    try {
      // Update order status using TanStack Query mutation
      await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
      
      addToast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus}`,
        type: "success"
      });
      
      // Send status update email for specific statuses
      if (['processing', 'delivered', 'cancelled'].includes(newStatus)) {
        try {
          await sendStatusEmail.mutateAsync({ orderId, status: newStatus });
        } catch (emailError) {
          console.error('Error sending status email:', emailError);
          // Don't show error to user as status was updated successfully
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      addToast({
        title: "Update Failed",
        description: "Failed to update order status",
        type: "error"
      });
    }
  };

  const handlePickupReady = (order: Order) => {
    setSelectedOrder(order);
    // Set default pickup time to tomorrow at 2 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    setPickupTime(tomorrow.toISOString().slice(0, 16));
    setCustomMessage("");
    setShowPickupModal(true);
  };

  const handleSendPickupNotification = async () => {
    if (!selectedOrder || !pickupTime) {
      addToast({
        title: "Missing Information",
        description: "Please select a pickup time",
        type: "warning"
      });
      return;
    }

    try {
      // Send pickup notification using TanStack Query mutation
      if (!selectedOrder._id) {
        throw new Error('Order ID is required');
      }
      await sendPickupNotification.mutateAsync({
        orderId: selectedOrder._id.toString(),
        pickupTime,
        customMessage
      });

      addToast({
        title: "Notification Sent",
        description: "Pickup notification sent to customer",
        type: "success"
      });
      setShowPickupModal(false);
      
      // Update order status to ready_for_pickup
      await updateOrderStatus.mutateAsync({ 
        orderId: selectedOrder._id.toString(), 
        status: 'ready_for_pickup' 
      });

      addToast({
        title: "Status Updated",
        description: "Order status updated to ready for pickup",
        type: "success"
      });
    } catch (error) {
      console.error('Error sending pickup notification:', error);
      addToast({
        title: "Notification Failed",
        description: "Failed to send pickup notification",
        type: "error"
      });
    }
  };

  const getActiveSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return 'Dashboard';
      case 'products':
        return 'Products';
      case 'orders':
        return 'Orders';
      case 'settings':
        return 'Settings';
      default:
        return 'Admin Panel';
    }
  };

  // Helper functions for dashboard metrics
  const getOrderStats = () => {
    const totalOrdersCount = totalOrders;
    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
    const processingOrdersCount = orders.filter(o => o.status === 'processing').length;
    const readyOrdersCount = orders.filter(o => o.status === 'ready_for_pickup').length;
    const totalRevenueAmount = orders.reduce((sum, order) => sum + order.total, 0);
    
    return {
      totalOrders: totalOrdersCount,
      pendingOrders: pendingOrdersCount,
      processingOrders: processingOrdersCount,
      readyOrders: readyOrdersCount,
      totalRevenue: totalRevenueAmount
    };
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
        setPasswordError("");
      } else {
        const data = await response.json() as { error?: string };
        setPasswordError(data.error ?? "Invalid password. Please try again.");
      }
    } catch {
      setPasswordError("Authentication failed. Please try again.");
    }
  };

  // Remove unused handleLogout function

  const handleSaveSettings = () => {
    // TODO: Save to database/API
    console.log("Saving settings:", settings);
    addToast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully!",
      type: "success"
    });
  };


  const handleEditProduct = (product: Product) => {
    // Set the editing product first
    setEditingProduct(product.id);
    setIsEditingMode(true);
    // Then set the form data
    setEditProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      inStock: product.inStock,
      sizes: product.sizes ?? [],
      colors: product.colors ?? [],
      image: product.image ?? "",
      imageId: product.imageId ?? "",
      images: product.images ?? []
    });
    // Finally open the modal
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!editProduct.name || editProduct.price <= 0) {
      addToast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        type: "warning"
      });
      return;
    }
    
    try {
      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct, editProduct);
        addToast({
          title: "Product Updated",
          description: "Product has been updated successfully!",
          type: "success"
        });
      } else {
          // Create new product
        await addProduct({
          name: editProduct.name,
          price: editProduct.price,
          description: editProduct.description,
          inStock: editProduct.inStock,
          sizes: editProduct.sizes,
          colors: editProduct.colors,
          image: editProduct.image,
          imageId: editProduct.imageId,
          images: editProduct.images,
          category: 'Apparel' // Default category
        });
        addToast({
          title: "Product Created",
          description: "Product has been created successfully!",
          type: "success"
        });
      }
      setEditingProduct(null);
      setIsEditingMode(false);
      setEditProduct({ name: "", price: 0, description: "", inStock: true, sizes: [], colors: [], image: "", imageId: "", images: [] });
      setShowEditModal(false);
    } catch (err) {
      console.error('Error saving product:', err);
      addToast({
        title: "Error",
        description: `Failed to ${editingProduct ? 'update' : 'create'} product. Please try again.`,
        type: "error"
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      addToast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, GIF, or WEBP image",
        type: "error"
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      addToast({
        title: "File Too Large",
        description: "Maximum file size is 5MB",
        type: "error"
      });
      return;
    }

    try {
      // Show preview
      const imageUrl = URL.createObjectURL(file);
      setEditProduct({ ...editProduct, image: imageUrl });

      // Upload to MongoDB
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        headers: {
          'x-admin-password': env.NEXT_PUBLIC_ADMIN_PASSWORD as string,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadedImage = await response.json() as { dataUri: string; id: string; mimeType: string; filename: string; size: number };
      // Update with the uploaded image data
      setEditProduct({ ...editProduct, image: uploadedImage.dataUri, imageId: uploadedImage.id });
      
      addToast({
        title: "Image Uploaded",
        description: "Image has been uploaded successfully",
        type: "success"
      });
    } catch (err) {
      console.error('Error uploading image:', err);
      addToast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        type: "error"
      });
    }
  };

  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleOpenGallery = (mode: 'primary' | 'additional' = 'primary') => {
    setImageSelectionMode(mode);
    setShowAssetGallery(true);
    // Gallery will load automatically via TanStack Query
  };
  
  const handleRefreshGallery = () => {
    void refetchGallery();
  };

  const handleSelectGalleryImage = (image: ProductImage, asAdditional: boolean = false) => {
    if (image && image.dataUri && image.imageId) {
      if (asAdditional) {
        // Add to additional images array
        const newImage: ProductImage = {
          id: Date.now().toString(), // Temporary ID
          imageId: image.imageId,
          dataUri: image.dataUri,
          mimeType: image.mimeType,
          filename: image.filename
        };
        setEditProduct({ 
          ...editProduct, 
          images: [...editProduct.images, newImage]
        });
        setShowAssetGallery(false);
        addToast({
          title: "Image Added",
          description: "Image has been added to product gallery",
          type: "success"
        });
      } else {
        // Set as primary image
        setEditProduct({ 
          ...editProduct, 
          image: image.dataUri, 
          imageId: image.imageId 
        });
        setShowAssetGallery(false);
        addToast({
          title: "Image Selected",
          description: "Image has been set as primary",
          type: "success"
        });
      }
    }
  };

  const handleGalleryImageClick = (image: ProductImage) => {
    if (image && image.dataUri && image.imageId) {
      console.log('Gallery image clicked:', image);
      
      // Set the image in the product form based on selection mode
      setEditProduct((prev) => ({ 
        ...prev, 
        image: image.dataUri, 
        imageId: image.imageId 
      }));
      
      // If we're in a modal, close it
      if (showAssetGallery) {
        setShowAssetGallery(false);
      }
      
      // Switch to products tab and open the modal
      setActiveSection('products');
      setIsEditingMode(false);
      setEditingProduct(null);
      
      // Small delay to ensure state updates before opening modal
      setTimeout(() => {
        setShowEditModal(true);
      }, 100);
      
      addToast({
        title: "Image Selected",
        description: "Image has been added to product form",
        type: "success"
      });
    }
  };

  const handleDeleteImage = async (image: ProductImage) => {
    if (confirm(`Are you sure you want to delete this image?`)) {
      try {
        const response = await fetch(`/api/images/${image.imageId}`, {
          method: 'DELETE',
          headers: {
            'x-admin-password': env.NEXT_PUBLIC_ADMIN_PASSWORD as string,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete image');
        }

        // Refresh gallery after deletion
        await refetchGallery();

        addToast({
          title: "Image Deleted",
          description: "Image has been deleted successfully",
          type: "success"
        });
      } catch (err) {
        console.error('Error deleting image:', err);
        addToast({
          title: "Error",
          description: "Failed to delete image. Please try again.",
          type: "error"
        });
      }
    }
  };

  const handleRemoveProductImage = (imageId: string) => {
    setEditProduct({
      ...editProduct,
      images: editProduct.images.filter(img => img.id !== imageId)
    });
    addToast({
      title: "Image Removed",
      description: "Image has been removed from product gallery",
      type: "success"
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        addToast({
          title: "Product Deleted",
          description: "Product has been deleted successfully!",
          type: "success"
        });
      } catch {
        addToast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          type: "error"
        });
      }
    }
  };

  const addEditSize = (size: string) => {
    if (!editProduct.sizes.includes(size)) {
      setEditProduct({ ...editProduct, sizes: [...editProduct.sizes, size] });
    }
  };

  const removeEditSize = (size: string) => {
    setEditProduct({ ...editProduct, sizes: editProduct.sizes.filter(s => s !== size) });
  };

  const addEditColor = (color: string) => {
    if (!editProduct.colors.includes(color)) {
      setEditProduct({ ...editProduct, colors: [...editProduct.colors, color] });
    }
  };

  const removeEditColor = (color: string) => {
    setEditProduct({ ...editProduct, colors: editProduct.colors.filter(c => c !== color) });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <Image 
                src="/Stitch Please Ish Black.png" 
                alt="Stitch Please Logo" 
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Access</h1>
            <p className="text-lg text-gray-500">Enter your password to access the admin panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-900 mb-3">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              {passwordError && (
                <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{passwordError}</p>
                </div>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] py-4 text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              Access Admin Panel
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure admin access for authorized personnel only</span>
            </div>
          </div>
        </div>
      </div>
    );
  }


  const renderDashboard = () => {
    const stats = getOrderStats();
    
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => refetchOrders()}
              disabled={ordersLoading}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {/* Total Orders */}
          <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out group">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Package className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
              </div>
              <div className="text-right">
                <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600">All time</span>
              <div className="flex items-center text-gray-600 text-xs md:text-sm">
                <Activity className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Active</span>
              </div>
            </div>
          </div>
          
          {/* Pending Orders */}
          <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out group">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
              </div>
              <div className="text-right">
                <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.pendingOrders}</div>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600">Awaiting processing</span>
              {stats.pendingOrders > 0 && (
                <div className="flex items-center text-gray-700 text-xs md:text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Action needed</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Processing Orders */}
          <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out group">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Activity className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
              </div>
              <div className="text-right">
                <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.processingOrders}</div>
                <p className="text-xs text-gray-500">Processing</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600">In progress</span>
              <div className="flex items-center text-gray-600 text-xs md:text-sm">
                <Activity className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Working</span>
              </div>
            </div>
          </div>
          
          {/* Ready for Pickup */}
          <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out group">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
              </div>
              <div className="text-right">
                <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.readyOrders}</div>
                <p className="text-xs text-gray-500">Ready</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600">Awaiting pickup</span>
              {stats.readyOrders > 0 && (
                <div className="flex items-center text-gray-700 text-xs md:text-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Ready</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Revenue & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Revenue Card */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
            {/* Mobile-First Layout */}
            <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
              {/* Revenue Stats */}
              <div className="space-y-6 md:flex md:flex-col md:justify-between md:h-full md:min-h-[200px]">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center">
                    <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Revenue Overview</h2>
                    <p className="text-xs md:text-sm text-gray-600">Total revenue from all orders</p>
                  </div>
                </div>
                
                <div className="text-left py-4">
                  <div className="text-4xl md:text-5xl font-bold text-green-600">
                    ${stats.totalRevenue.toFixed(2)}
                  </div>
                </div>
                
                <div className="space-y-3 hidden md:block">
                  <div className="text-sm text-gray-600">From {stats.totalOrders} orders</div>
                  <div className="text-sm text-gray-500">Average: ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}</div>
                </div>
              </div>
              
              {/* Functional Chart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 font-medium">Revenue Trend</div>
                  <div className="text-xs text-gray-400">
                    {orders.length > 0 ? `Last ${Math.min(7, orders.length)} orders` : 'No data'}
                  </div>
                </div>
                
                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {/* Chart Bars */}
                    <div className="flex items-end justify-between space-x-2 h-20 border-b border-gray-100 pb-2">
                      {orders.slice(0, 7).map((order, i) => {
                        const maxOrderTotal = Math.max(...orders.map(o => o.total));
                        const height = (order.total / maxOrderTotal) * 50 + 10; // 10-60px range
                        const isHighest = order.total === maxOrderTotal;
                        
                        return (
                          <div key={order._id?.toString() ?? i} className="flex flex-col items-center flex-1">
                            <div
                              className={`w-full rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer ${
                                isHighest ? 'bg-[#74CADC]' : 'bg-gray-300'
                              }`}
                              style={{ height: `${height}px` }}
                              title={`Order #${order.orderNumber}: $${order.total.toFixed(2)}`}
                            />
                            <div className="text-xs text-gray-500 mt-1 font-medium">
                              ${order.total.toFixed(0)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Chart Legend */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#74CADC] rounded-full"></div>
                        <span>Highest Order</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span>Other Orders</span>
                      </div>
                    </div>
                    
                    {/* Order Details */}
                    <div className="space-y-1">
                      {orders.slice(0, 3).map((order, i) => (
                        <div key={order._id?.toString() ?? i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Order #{order.orderNumber}</span>
                          <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="font-medium text-gray-900">${order.total.toFixed(2)}</span>
                        </div>
                      ))}
                      {orders.length > 3 && (
                        <div className="text-xs text-gray-400 text-center pt-1">
                          +{orders.length - 3} more orders
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-1">No orders yet</div>
                      <div className="text-xs text-gray-400">Start selling to see revenue trends</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600">Common tasks</p>
              </div>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => setActiveSection("products")}
                className="w-full justify-start bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
              <Button 
                variant="outline"
                onClick={() => setActiveSection("orders")}
                className="w-full justify-start"
              >
                <Package className="h-4 w-4 mr-2" />
                View All Orders
              </Button>
              <Button 
                variant="outline"
                onClick={() => setActiveSection("settings")}
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Store Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-600">Latest orders requiring attention</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveSection("orders")}
              className="flex items-center gap-2"
            >
              View All
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          
          {ordersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-4">Orders will appear here once customers start placing them.</p>
              <Button 
                onClick={() => setActiveSection("products")}
                className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Products
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order._id?.toString() ?? order.orderNumber} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'processing' ? 'bg-[#74CADC]/20 text-[#0A5565]' :
                        order.status === 'ready_for_pickup' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{order.customer.firstName} {order.customer.lastName}</span>
                      <span>•</span>
                      <span className="font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                      <span>•</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openOrderModal(order)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProducts = () => (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product inventory and catalog</p>
        </div>
        <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => refetchOrders()}
              disabled={ordersLoading}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              {ordersLoading ? "Loading..." : "Refresh"}
            </Button>
          <Button 
            onClick={() => {
              setEditingProduct(null);
              setIsEditingMode(false);
              setEditProduct({
                name: "",
                price: 0,
                description: "",
                inStock: true,
                sizes: [],
                colors: [],
                image: "",
                imageId: "",
                images: []
              });
              setShowEditModal(true);
            }}
            className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Product
          </Button>
        </div>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {productsLoading ? "..." : products.length}
              </div>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {productsLoading ? "..." : products.filter(p => p.inStock).length}
              </div>
              <p className="text-sm text-gray-600">In Stock</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <X className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {productsLoading ? "..." : products.filter(p => !p.inStock).length}
              </div>
              <p className="text-sm text-gray-600">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>


      {/* Existing Products */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Current Products</h2>
            <p className="text-sm text-gray-600">Manage your existing product inventory</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`loading-${index}`} className="group">
                <div className="aspect-square w-full mb-6 rounded-xl overflow-hidden bg-gray-200 animate-pulse"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
                </div>
              </div>
            ))
          ) : productsError ? (
            // Error state
            <div className="col-span-full text-center py-12">
              <div className="text-red-500 mb-4">
                <Package className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Failed to load products</p>
                <p className="text-sm text-gray-600">{productsError}</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 mb-4">
                <Package className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm text-gray-600">Add your first product to get started</p>
              </div>
            </div>
          ) : (
            // Products list
            products.map((product, index) => {
              console.log('Product ID:', product.id, 'Index:', index);
              return (
              <div key={product.id || `product-${index}`} className="group">
              <div className="aspect-square w-full mb-6 rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
                  <p className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                </div>
                
                <div className="space-y-3">
                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Sizes</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.sizes.map((size) => (
                          <span key={size} className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-md">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Colors</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.colors.map((color) => (
                          <span key={color} className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-md">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                    product.inStock 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditProduct(product)}
                      className="px-4 py-2 bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] border border-[#74CADC] hover:border-[#74CADC]/90 transition-all duration-200 text-sm font-medium"
                    >
                      Update Product
                    </Button>
                    <Button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">Manage customer orders and fulfillment</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
            className="flex items-center gap-2"
          >
            {viewMode === "grid" ? "Table View" : "Grid View"}
          </Button>
          <Button
            variant="outline"
            onClick={() => refetchOrders()}
            disabled={ordersLoading}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            {ordersLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by number, customer name, or email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 h-12 px-4"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          {searchQuery && (
            <Button
              onClick={() => handleSearch("")}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 py-3 px-4"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      {searchQuery && (
        <p className="text-sm text-gray-500 mt-3">
          Showing results for &quot;{searchQuery}&quot; ({totalOrders} orders found)
        </p>
      )}

      {ordersLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const orderId = order._id?.toString() ?? order.orderNumber;
                  
                  return (
                    <tr key={orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{order.customer.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.items.map(item => item.productName).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          ${order.total.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 h-8">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id!.toString(), e.target.value)}
                            className={`text-xs font-medium rounded-md border px-2 py-1.5 h-8 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 ${
                              order.status === 'pending' ? 'bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100 focus:ring-orange-200' :
                              order.status === 'processing' ? 'bg-[#74CADC]/10 text-[#0A5565] border-[#74CADC]/30 hover:bg-[#74CADC]/20 focus:ring-[#74CADC]/20' :
                              order.status === 'ready_for_pickup' ? 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100 focus:ring-green-200' :
                              order.status === 'delivered' ? 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100 focus:ring-gray-200' :
                              'bg-red-50 text-red-800 border-red-300 hover:bg-red-100 focus:ring-red-200'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="ready_for_pickup">Ready for Pickup</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {order.status === 'processing' && (
                            <Button
                              onClick={() => handlePickupReady(order)}
                              className="px-2 py-1.5 text-xs bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] rounded-md h-8"
                            >
                              Mark Ready
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900 h-8 w-8 p-0"
                          onClick={() => openOrderModal(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id?.toString() ?? order.orderNumber} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })} at {new Date(order.createdAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id!.toString(), e.target.value)}
                      className={`w-full sm:w-auto pl-4 pr-10 text-sm font-semibold rounded-lg border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 appearance-none h-10 ${
                        order.status === 'pending' ? 'bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100 focus:ring-orange-200' :
                        order.status === 'processing' ? 'bg-[#74CADC]/10 text-[#0A5565] border-[#74CADC]/30 hover:bg-[#74CADC]/20 focus:ring-[#74CADC]/20' :
                        order.status === 'ready_for_pickup' ? 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100 focus:ring-green-200' :
                        order.status === 'delivered' ? 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100 focus:ring-gray-200' :
                        'bg-red-50 text-red-800 border-red-300 hover:bg-red-100 focus:ring-red-200'
                      }`}
                      style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {order.status === 'processing' && (
                    <Button
                      onClick={() => handlePickupReady(order)}
                      className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Mark Ready
                    </Button>
                  )}
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h4 className="font-semibold text-gray-900">Customer</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {order.customer.email}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {order.customer.phone}
                    </p>
                  </div>
                </div>

                {/* Pickup Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h4 className="font-semibold text-gray-900">Pickup</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">Pickup Only Service</p>
                    <p className="text-sm text-gray-600">Customer will be contacted for pickup arrangement</p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <h4 className="font-semibold text-gray-900">Payment</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 capitalize">{order.paymentMethod}</p>
                    <p className="text-sm text-gray-600">Payment completed</p>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h4 className="font-semibold text-gray-900">Order Items</h4>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-3">
                    {order.items.map((item, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.productName}
                            {item.selectedSize && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-[#74CADC] text-[#0A5565] rounded-md">
                                {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-md">
                                {item.selectedColor}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            ${(item.quantity * item.productPrice).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${item.productPrice.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-xl py-4 px-2">
                <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pickup</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs md:text-sm text-gray-500 text-center sm:text-left">
              Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || ordersLoading}
                variant="ghost"
                className="px-2 md:px-3 py-2 text-sm"
              >
                Prev
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const page = i + 1;
                  const isActive = page === currentPage;
                  
                  return (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={ordersLoading}
                      className={`px-2 md:px-3 py-2 text-sm ${
                        isActive 
                          ? 'bg-[#74CADC] text-[#0A5565]' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || ordersLoading}
                variant="ghost"
                className="px-2 md:px-3 py-2 text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderGallery = () => {
    console.log('Rendering gallery, images:', galleryImages.length, 'loading:', galleryLoading);
    
    // Show loading state until we've checked for images
    if (galleryLoading) {
      return (
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Asset Gallery</h1>
              <p className="text-gray-600 mt-2">Manage your uploaded images and assets</p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefreshGallery}
              disabled={galleryLoading}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              {galleryLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {/* Loading or Empty State */}
          {galleryLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#74CADC] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading images...</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <ImageIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg text-gray-600">No images in gallery yet</p>
              <p className="text-sm text-gray-500 mt-2">Upload images to get started</p>
            </div>
          )}
        </div>
      );
    }
    
    // Show images
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asset Gallery</h1>
            <p className="text-gray-600 mt-2">Manage your uploaded images and assets</p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefreshGallery}
            disabled={galleryLoading}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            {galleryLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {galleryImages.map((image) => {
            if (!image || !image.id) return null;
            return (
              <div key={image.id} className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#74CADC] transition-all duration-200 bg-gray-50">
                <button
                  onClick={() => handleGalleryImageClick(image)}
                  className="w-full h-full relative"
                >
                  <Image
                    src={image.dataUri ?? ''}
                    alt={image.filename ?? 'Gallery image'}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {image.filename}
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDeleteImage(image);
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Delete image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your store settings and preferences</p>
      </div>

      {/* Tax Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Settings className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tax Settings</h2>
            <p className="text-sm text-gray-600">Configure tax rates for your store</p>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.taxRate}
              onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Shipping Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Shipping Settings</h2>
            <p className="text-sm text-gray-600">Configure shipping options and pickup instructions</p>
          </div>
        </div>
        <div className="space-y-8">
          {/* Pickup Only Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Pickup Only Mode</h3>
              <p className="text-sm text-gray-600 mt-1">Disable shipping, only allow pickup</p>
            </div>
            <button
              onClick={() => setSettings({...settings, pickupOnly: !settings.pickupOnly})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                settings.pickupOnly ? 'bg-[#74CADC]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  settings.pickupOnly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {!settings.pickupOnly && (
            <>
              {/* Shipping Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Shipping Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.shippingCost}
                  onChange={(e) => setSettings({...settings, shippingCost: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
                />
              </div>

              {/* Free Shipping Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Free Shipping Threshold ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({...settings, freeShippingThreshold: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
                />
              </div>
            </>
          )}

          {/* Pickup Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Pickup Instructions
            </label>
            <textarea
              value={settings.pickupInstructions}
              onChange={(e) => setSettings({...settings, pickupInstructions: e.target.value})}
              rows={4}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200 resize-none"
              placeholder="Instructions for customers on how to pickup their orders..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 fixed inset-0 z-50 overflow-y-auto">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="mobile-menu p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{getActiveSectionTitle()}</h2>
            <p className="text-xs text-gray-500">
              {activeSection === 'dashboard' && 'Overview & Analytics'}
              {activeSection === 'orders' && 'Manage Orders'}
              {activeSection === 'products' && 'Inventory Management'}
              {activeSection === 'settings' && 'Store Configuration'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsAuthenticated(false)}
          className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg"
        >
          Logout
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="mobile-menu md:hidden bg-white border-b border-gray-200 px-4 py-4 sticky top-16 z-30">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-4 text-left rounded-xl transition-all duration-200 group ${
                    activeSection === item.id
                      ? 'bg-gray-100 text-gray-900 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      activeSection === item.id
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{item.label}</span>
                      <span className={`text-xs ${
                        activeSection === item.id ? 'text-gray-600' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </span>
                    </div>
                  </div>
                  {item.badge && (
                    <div className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {item.badge}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 w-64 lg:w-72 h-full bg-white border-r border-gray-200 z-30">
        <div className="p-8 h-full flex flex-col">
          {/* Logo and Header */}
          <div className="mb-12">
            <Image 
              src="/Stitch Please Ish Black.png" 
              alt="Stitch Please Logo" 
              width={120}
              height={96}
              className="h-24 w-auto mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900 text-center">Admin Panel</h1>
          </div>
          
          <nav className="space-y-2 flex-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-4 text-left rounded-xl transition-all duration-200 group ${
                    activeSection === item.id
                      ? 'bg-gray-100 text-gray-900 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      activeSection === item.id
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{item.label}</span>
                      <span className={`text-xs ${
                        activeSection === item.id ? 'text-gray-600' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </span>
                    </div>
                  </div>
                  {item.badge && (
                    <div className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {item.badge}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
          
          <div className="border-t border-gray-200 pt-4">
            <Button
              onClick={() => setIsAuthenticated(false)}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 px-6 py-3 transition-all duration-200"
            >
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 lg:ml-72">
        <div className="px-4 md:px-8">
          <div className="py-6 md:py-12">
            {/* Content */}
            {activeSection === "dashboard" && renderDashboard()}
            {activeSection === "products" && renderProducts()}
            {activeSection === "orders" && renderOrders()}
            {activeSection === "gallery" && renderGallery()}
            {activeSection === "settings" && (
              <div className="space-y-8">
                {renderSettings()}
                
                {/* Save Button */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Save className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Save Settings</h3>
                      <p className="text-sm text-gray-600">Save your configuration changes</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveSettings}
                    className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-6 py-3 transition-all duration-200"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-8 w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                {isEditingMode ? "Update Product" : "Create Product"}
              </h2>
              <Button
                onClick={() => setShowEditModal(false)}
                className="p-2 md:p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
              {/* Left Column - Basic Info */}
              <div className="space-y-6 md:space-y-8">
                {/* Product Image */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-4">
                    Product Image
                  </label>
                  <div className="space-y-4">
                    {/* Image Preview */}
                    {editProduct.image && (
                      <div className="relative">
                        <div className="w-full h-96 md:h-[28rem] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                          <Image
                            src={editProduct.image}
                            alt="Product preview"
                            width={400}
                            height={192}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Button
                            onClick={() => setEditProduct({...editProduct, image: ""})}
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 md:p-2 rounded-lg"
                          >
                            <X className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 md:p-12 transition-all duration-200 text-center ${
                        isDragging
                          ? 'border-[#74CADC] bg-[#74CADC]/10'
                          : editProduct.image
                          ? 'border-gray-200 bg-gray-50'
                          : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="hidden"
                      />
                      
                      {editProduct.image ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">Image uploaded successfully</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
                            <Button
                              type="button"
                              onClick={() => editFileInputRef.current?.click()}
                              className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400 px-4 md:px-6 py-2 md:py-3 transition-all duration-200 flex items-center justify-center"
                            >
                              <Upload className="h-4 w-4 mr-2 md:mr-3" />
                              <span className="font-medium text-sm md:text-base">Change Image</span>
                            </Button>
                            <Button
                              type="button"
                              onClick={() => editFileInputRef.current?.click()}
                              variant="outline"
                              className="text-gray-600"
                            >
                              Or drag and drop
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <Upload className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-base md:text-lg font-medium text-gray-900 mb-2">
                                {isDragging ? 'Drop image here' : 'Drag and drop an image here'}
                              </p>
                              <p className="text-sm text-gray-500 mb-4">or</p>
                            </div>
                            <div className="flex flex-col gap-3">
                              <Button
                                type="button"
                                onClick={() => editFileInputRef.current?.click()}
                                className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-medium transition-all duration-200 flex items-center justify-center"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Browse Files
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleOpenGallery('primary')}
                                className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400 px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-medium transition-all duration-200 flex items-center justify-center"
                              >
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Choose from Gallery
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Additional Images */}
                    {editProduct.images && editProduct.images.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Additional Product Images
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {editProduct.images.map((img) => (
                            <div key={img.id} className="relative group">
                              <Image
                                src={img.dataUri}
                                alt={img.filename}
                                width={100}
                                height={100}
                                className="w-full h-20 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveProductImage(img.id)}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Add Additional Images Button */}
                    <Button
                      type="button"
                      onClick={() => handleOpenGallery('additional')}
                      variant="outline"
                      className="mb-6"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Additional Images
                    </Button>
                    
                    {/* Image Guidelines */}
                    <div className="text-sm text-gray-500">
                      <p>• Recommended size: 800x800px or larger</p>
                      <p>• Supported formats: JPG, PNG, WebP</p>
                      <p>• Maximum file size: 5MB</p>
                      <p>• Or choose from previously uploaded images</p>
                    </div>
                  </div>
                </div>


                {/* Description */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-3">
                    Description
                  </label>
                  <textarea
                    value={editProduct.description}
                    onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 md:px-4 py-3 md:py-4 text-base md:text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200 resize-none"
                    placeholder="Product description"
                  />
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editProduct.inStock}
                    onChange={(e) => setEditProduct({...editProduct, inStock: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-300"
                  />
                  <span className="text-base font-medium text-gray-700">In Stock</span>
                </div>
              </div>

              {/* Right Column - Sizes & Colors */}
              <div className="space-y-6 md:space-y-8">
                {/* Product Name */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-3">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                    className="w-full px-3 md:px-4 py-3 md:py-4 text-base md:text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-3">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({...editProduct, price: parseFloat(e.target.value)})}
                    className="w-full px-3 md:px-4 py-3 md:py-4 text-base md:text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-4">
                    Available Sizes
                  </label>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                        <button
                          key={size}
                          onClick={() => editProduct.sizes.includes(size) ? removeEditSize(size) : addEditSize(size)}
                          className={`px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-medium rounded-lg border transition-all duration-200 ${
                            editProduct.sizes.includes(size)
                              ? "bg-white text-gray-800 border-gray-300 shadow-sm"
                              : "bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {editProduct.sizes.length > 0 && (
                      <p className="text-sm text-gray-500 font-medium">
                        Selected: {editProduct.sizes.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-4">
                    Available Colors
                  </label>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {["White", "Black", "Navy", "Gray", "Red", "Blue", "Green"].map((color) => (
                        <button
                          key={color}
                          onClick={() => editProduct.colors.includes(color) ? removeEditColor(color) : addEditColor(color)}
                          className={`px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-medium rounded-lg border transition-all duration-200 ${
                            editProduct.colors.includes(color)
                              ? "bg-white text-gray-800 border-gray-300 shadow-sm"
                              : "bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                    {editProduct.colors.length > 0 && (
                      <p className="text-sm text-gray-500 font-medium">
                        Selected: {editProduct.colors.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <Button
                    onClick={handleUpdateProduct}
                    className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-medium transition-all duration-200 flex-1 sm:flex-none"
                  >
                    {isEditingMode ? "Update Product" : "Create Product"}
                  </Button>
                  <Button
                    onClick={() => setShowEditModal(false)}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-medium transition-all duration-200 flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Notification Modal */}
      {showPickupModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-semibold text-gray-900">Mark Order Ready for Pickup</h2>
              <Button
                onClick={() => setShowPickupModal(false)}
                className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4 md:space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Order #{selectedOrder.orderNumber}</p>
                <p className="text-sm text-gray-600">
                  Customer: {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Pickup Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select a date and time for customer pickup
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  placeholder="Add any special instructions, notes, or additional information for the customer..."
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be included in the pickup notification email
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleSendPickupNotification}
                  className="flex-1 bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] py-2 md:py-3"
                >
                  Send Notification
                </Button>
                <Button
                  onClick={() => setShowPickupModal(false)}
                  variant="ghost"
                  className="flex-1 text-gray-600 hover:text-gray-900 py-2 md:py-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrderForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 md:p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-3xl font-semibold text-gray-900">
                Order Details - #{selectedOrderForModal.orderNumber}
              </h2>
              <Button
                onClick={() => setShowOrderModal(false)}
                className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-8">
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Order Information</h4>
                  <div className="space-y-3 text-sm">
                    <p><span className="font-medium">Order #:</span> {selectedOrderForModal.orderNumber}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedOrderForModal.createdAt).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p><span className="font-medium">Time:</span> {new Date(selectedOrderForModal.createdAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${
                        selectedOrderForModal.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        selectedOrderForModal.status === 'processing' ? 'bg-[#74CADC]/20 text-[#0A5565]' :
                        selectedOrderForModal.status === 'ready_for_pickup' ? 'bg-green-100 text-green-800' :
                        selectedOrderForModal.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrderForModal.status.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Customer Details</h4>
                  <div className="space-y-3 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedOrderForModal.customer.firstName} {selectedOrderForModal.customer.lastName}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrderForModal.customer.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrderForModal.customer.phone}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Payment & Delivery</h4>
                  <div className="space-y-3 text-sm">
                    <p><span className="font-medium">Payment:</span> {selectedOrderForModal.paymentMethod}</p>
                    <p><span className="font-medium">Delivery:</span> Pickup Only</p>
                    <p><span className="font-medium">Total:</span> ${selectedOrderForModal.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-6 text-lg">Order Items</h4>
                <div className="space-y-4">
                  {selectedOrderForModal.items.map((item, index) => (
                    <div key={index} className="bg-gray-100 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-lg mb-2">{item.productName}</h5>
                          <div className="flex gap-3 mt-2">
                            {item.selectedSize && (
                              <span className="px-3 py-1 text-sm font-medium bg-[#74CADC] text-[#0A5565] rounded-md">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-md">
                                Color: {item.selectedColor}
                              </span>
                            )}
                            <span className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-md">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${(item.quantity * item.productPrice).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${item.productPrice.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-6 text-lg">Order Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">${selectedOrderForModal.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">${selectedOrderForModal.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Pickup</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${selectedOrderForModal.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrderForModal.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Order Notes</h4>
                  <p className="text-sm text-gray-600">{selectedOrderForModal.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {selectedOrderForModal.status === 'processing' && (
                  <Button
                    onClick={() => {
                      setShowOrderModal(false);
                      handlePickupReady(selectedOrderForModal);
                    }}
                    className="flex-1 bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] py-2 md:py-3"
                  >
                    Mark Ready for Pickup
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Gallery Modal */}
      {showAssetGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 md:p-8 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                Asset Gallery
              </h2>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRefreshGallery}
                  disabled={galleryLoading}
                  variant="outline"
                  className="p-2 md:p-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  <Activity className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button
                  onClick={() => setShowAssetGallery(false)}
                  className="p-2 md:p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>
            
            {galleryLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#74CADC] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading images...</p>
                </div>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="text-center py-20">
                <ImageIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-lg text-gray-600">No images in gallery yet</p>
                <p className="text-sm text-gray-500 mt-2">Upload images to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {galleryImages.map((image) => {
                  if (!image || !image.id) return null;
                  return (
                    <div key={image.id} className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#74CADC] transition-all duration-200 bg-gray-50">
                      <button
                        onClick={() => handleSelectGalleryImage(image, imageSelectionMode === 'additional')}
                        className="w-full h-full relative"
                      >
                        <Image
                          src={image.dataUri ?? ''}
                          alt={image.filename ?? 'Gallery image'}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ImageIcon className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {image.filename}
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeleteImage(image);
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Delete image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
