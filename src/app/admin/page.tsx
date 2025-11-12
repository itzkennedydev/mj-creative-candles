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
  Clock, 
  CheckCircle, 
  Eye, 
  Plus, 
  BarChart3,
  Activity,
  Archive,
  TrendingUp,
  Trophy
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useProducts } from "~/lib/products-context";
import { useToast } from "~/lib/toast-context";
import type { Product, ProductImage } from "~/lib/types";
import type { Order } from "~/lib/order-types";
import { useOrders, useUpdateOrderStatus, useSendPickupNotification, useSendStatusEmail, useArchiveOrder } from "~/lib/hooks/use-orders";
import { useGallery } from "~/lib/hooks/use-gallery";
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Image as ImageIcon } from "lucide-react";
import { Dashboard } from "./components/dashboard";
import { Orders } from "./components/orders";
import { formatTimeElapsed, calculateOrderScore } from "./components/utils";
import type { AdminSettings } from "./components/types";

export default function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct, loading: productsLoading, error: productsError } = useProducts();
  const { addToast } = useToast();
  
  // Use TanStack Query for gallery with caching
  const { data: galleryData, isLoading: isGalleryLoading, refetch: refetchGallery } = useGallery();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  
  // TanStack Query hooks - only fetch when authenticated
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useOrders(
    currentPage, 
    searchQuery,
    statusFilter,
    isAuthenticated
  );
  const updateOrderStatus = useUpdateOrderStatus();
  const sendPickupNotification = useSendPickupNotification();
  const sendStatusEmail = useSendStatusEmail();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const archiveOrder = useArchiveOrder();
  
  // Pagination state for burndown
  const [burndownPage, setBurndownPage] = useState(1);
  const burndownOrdersPerPage = 20;
  
  // Pagination state for archive
  const [archivePage, setArchivePage] = useState(1);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState("");
  const archiveOrdersPerPage = 20;
  
  // Extract data from query result
  const orders = ordersData?.orders ?? [];
  const totalPages = ordersData?.totalPages ?? 1;
  const totalOrders = ordersData?.total ?? 0;
  const ordersPerPage = 10;

  // Fetch all pending/processing orders for burndown tab
  const { data: burndownOrdersData, isLoading: burndownLoading, refetch: refetchBurndown } = useQuery({
    queryKey: ['burndown-orders'],
    queryFn: async () => {
      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch all orders with high limit to include all delivered orders for scoring
      const params = new URLSearchParams({
        page: '1',
        limit: '1000', // Increased to ensure we get all delivered orders
      });

      const response = await fetch(`/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json() as Promise<{ success: boolean; orders: Order[]; total: number; totalPages: number; currentPage: number }>;
    },
    enabled: isAuthenticated && activeSection === 'burndown',
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const allOrdersForBurndown = burndownOrdersData?.orders ?? [];
  
  // Fetch archived orders for archive tab
  const { data: archivedOrdersData, isLoading: archivedLoading, refetch: refetchArchived } = useQuery({
    queryKey: ['archived-orders', archivePage, archiveSearchQuery],
    queryFn: async () => {
      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        page: archivePage.toString(),
        limit: archiveOrdersPerPage.toString(),
        archived: 'true',
        ...(archiveSearchQuery && { search: archiveSearchQuery }),
      });

      const response = await fetch(`/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch archived orders');
      }
      return response.json() as Promise<{ success: boolean; orders: Order[]; total: number; totalPages: number; currentPage: number }>;
    },
    enabled: isAuthenticated && activeSection === 'archive',
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const archivedOrders = archivedOrdersData?.orders ?? [];
  const archivedTotalPages = archivedOrdersData?.totalPages ?? 1;
  const archivedTotal = archivedOrdersData?.total ?? 0;
  
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
  const [selectedImages, setSelectedImages] = useState<ProductImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingProduct, setIsProcessingProduct] = useState(false);
  
  // Get gallery images from TanStack Query (with caching)
  const galleryImages = galleryData?.images ?? [];
  const galleryLoading = isGalleryLoading || false;
  
  // Burndown page state
  const [showCharts, setShowCharts] = useState(false);
  
  const [settings, setSettings] = useState<AdminSettings>({
    taxRate: 8.5,
    shippingEnabled: true,
    pickupOnly: false,
    freeShippingThreshold: 50,
    shippingCost: 9.99,
    pickupInstructions: "Please call (309) 373-6017 to schedule pickup. Available Monday-Friday 9AM-5PM.",
    burndownUrgentThreshold: 120, // 5 days (aligned with scoring)
    burndownCriticalThreshold: 168, // 7 days (aligned with scoring)
  });

  // Load settings when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadSettings = async () => {
      try {
        const token = sessionStorage.getItem('admin_token');
        if (!token) return;

        const response = await fetch('/api/admin/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json() as { settings: AdminSettings };
          if (data.settings) {
            console.log('Loaded settings from database:', data.settings);
            setSettings(data.settings);
          }
        } else {
          console.error('Failed to load settings:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    void loadSettings();
  }, [isAuthenticated]);

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
      id: "burndown", 
      label: "Burndown", 
      icon: Clock,
      description: "Order Priority & Timing",
      badge: orders.filter(o => {
        const now = new Date();
        const created = new Date(o.createdAt);
        const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
        return diffHours >= settings.burndownUrgentThreshold && (o.status === 'pending' || o.status === 'processing') && !o.archived;
      }).length > 0 ? orders.filter(o => {
        const now = new Date();
        const created = new Date(o.createdAt);
        const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
        return diffHours >= settings.burndownUrgentThreshold && (o.status === 'pending' || o.status === 'processing') && !o.archived;
      }).length : null
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
    
    // Check for existing authentication token
    const token = sessionStorage.getItem('admin_token');
    const expiresAt = sessionStorage.getItem('admin_expires_at');
    
    if (token && expiresAt) {
      const expirationTime = new Date(expiresAt).getTime();
      const currentTime = Date.now();
      
      if (currentTime < expirationTime) {
        setAuthToken(token);
        setIsAuthenticated(true);
      } else {
        // Token expired, clear session
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_refresh_token');
        sessionStorage.removeItem('admin_expires_at');
      }
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

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    // TanStack Query will automatically refetch when statusFilter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // TanStack Query will automatically refetch when currentPage changes
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrderForModal(order);
    setShowOrderModal(true);
  };

  const handleArchiveOrder = async (orderId: string, archived: boolean) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (!archiveOrder.mutateAsync) {
        throw new Error('Archive mutation not available');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await archiveOrder.mutateAsync({ orderId, archived });
      
      addToast({
        title: archived ? "Order Archived" : "Order Unarchived",
        description: `Order has been ${archived ? 'archived' : 'unarchived'} successfully`,
        type: "success"
      });
    } catch (error) {
      console.error('Error archiving order:', error);
      addToast({
        title: "Archive Failed",
        description: `Failed to ${archived ? 'archive' : 'unarchive'} order`,
        type: "error"
      });
    }
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

    // If changing to "delivered", update directly without modal
    if (newStatus === 'delivered') {
      try {
        await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
        
        addToast({
          title: "Order Delivered",
          description: `Order marked as delivered. Score calculated!`,
          type: "success"
        });
        
        // Send status update email
        try {
          await sendStatusEmail.mutateAsync({ orderId, status: newStatus });
        } catch (emailError) {
          console.error('Error sending status email:', emailError);
        }
        
        // Refetch burndown orders to update score display
        void refetchBurndown();
        return;
      } catch (error) {
        console.error('Error updating order status:', error);
        addToast({
          title: "Update Failed",
          description: "Failed to update order status",
          type: "error"
        });
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
      if (['processing', 'ready_for_pickup', 'delivered', 'cancelled'].includes(newStatus)) {
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
      case 'burndown':
        return 'Burndown';
      case 'archive':
        return 'Archive';
      case 'settings':
        return 'Settings';
      default:
        return 'Admin Panel';
    }
  };



  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        setIsCodeSent(true);
        setError("");
      } else {
        const data = await response.json() as { error?: string; unauthorized?: boolean };
        if (data.unauthorized) {
          // Redirect to access request page
          window.location.href = '/admin/access-request';
          return;
        }
        setError(data.error ?? "Failed to send verification code");
      }
    } catch {
      setError("Failed to send verification code. Please try again.");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);
    
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      setIsVerifying(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          code: verificationCode.trim() 
        }),
      });

      if (response.ok) {
        const data = await response.json() as { 
          token?: string; 
          refreshToken?: string; 
          expiresAt?: string 
        };
        
        if (data.token) {
          setAuthToken(data.token);
          setIsAuthenticated(true);
          sessionStorage.setItem('admin_token', data.token);
          sessionStorage.setItem('admin_refresh_token', data.refreshToken ?? '');
          sessionStorage.setItem('admin_expires_at', data.expiresAt ?? '');
          setError("");
        } else {
          setError("Invalid verification code");
        }
      } else {
        const data = await response.json() as { error?: string };
        setError(data.error ?? "Invalid verification code");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail("");
    setVerificationCode("");
    setIsCodeSent(false);
    setAuthToken(null);
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_refresh_token');
    sessionStorage.removeItem('admin_expires_at');
  };

  // Remove unused handleLogout function

  const handleSaveSettings = async () => {
    try {
      // Validate thresholds before saving
      if (settings.burndownUrgentThreshold >= settings.burndownCriticalThreshold) {
        addToast({
          title: "Validation Error",
          description: "Urgent threshold must be less than critical threshold",
          type: "error"
        });
        return;
      }

      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        addToast({
          title: "Authentication Error",
          description: "Please log in to save settings",
          type: "error"
        });
        return;
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error ?? 'Failed to save settings');
      }

    addToast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully!",
      type: "success"
    });

      // Refetch burndown orders to update with new thresholds
      if (activeSection === 'burndown') {
        void refetchBurndown();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save settings. Please try again.',
        type: "error"
      });
    }
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
    
    setIsProcessingProduct(true);
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
    } finally {
      setIsProcessingProduct(false);
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

    setIsUploading(true);
    try {
      // Upload to public folder
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadedImage = await response.json() as { url: string; filename: string; mimeType: string; size: number };
      
      // Update with the uploaded image data
      // If there's already a primary image, add this as an additional image
      // Otherwise, set it as the primary image
      if (editProduct.image && editProduct.imageId) {
        setEditProduct({ 
          ...editProduct, 
          images: [...(editProduct.images || []), {
            id: Date.now().toString(),
            imageId: uploadedImage.filename,
            dataUri: uploadedImage.url,
            mimeType: uploadedImage.mimeType,
            filename: uploadedImage.filename
          }]
        });
        addToast({
          title: "Image Added",
          description: "Image has been added to additional images",
          type: "success"
        });
      } else {
        setEditProduct({ ...editProduct, image: uploadedImage.url, imageId: uploadedImage.filename });
        addToast({
          title: "Image Uploaded",
          description: "Image has been set as primary",
          type: "success"
        });
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      addToast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        type: "error"
      });
    } finally {
      setIsUploading(false);
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
    setSelectedImages([]); // Clear previous selections
    setShowAssetGallery(true);
    // Gallery will load automatically via TanStack Query
  };
  
  const handleRefreshGallery = () => {
    void refetchGallery();
  };

  const handleToggleImageSelection = (image: ProductImage) => {
    console.log('handleToggleImageSelection called with:', image);
    if (!image?.id || !image?.imageId) {
      console.log('Invalid image:', { id: image?.id, imageId: image?.imageId });
      return;
    }
    
    setSelectedImages(prev => {
      const isSelected = prev.some(img => img.imageId === image.imageId);
      console.log('isSelected:', isSelected, 'current selectedImages length:', prev.length);
      
      if (isSelected) {
        // Remove from selection
        const filtered = prev.filter(img => img.imageId !== image.imageId);
        console.log('Removed from selection. New length:', filtered.length);
        return filtered;
      } else {
        // Add to selection
        const newImage: ProductImage = {
          id: image.id,
          imageId: image.imageId,
          dataUri: image.dataUri,
          mimeType: image.mimeType,
          filename: image.filename
        };
        const updated = [...prev, newImage];
        console.log('Added to selection. New length:', updated.length, 'updated array:', updated);
        return updated;
      }
    });
  };

  const handleConfirmImageSelection = () => {
    console.log('handleConfirmImageSelection called with:', { 
      selectedImages, 
      imageSelectionMode,
      selectedImagesLength: selectedImages.length,
      currentEditProductImages: editProduct.images?.length ?? 0
    });
    
    if (selectedImages.length === 0) {
      addToast({
        title: "No Images Selected",
        description: "Please select at least one image",
        type: "warning"
      });
      return;
    }

    // Check if primary image already exists
    const hasPrimaryImage = !!editProduct.image;
    
    if (imageSelectionMode === 'primary' && !hasPrimaryImage) {
      // No primary image exists, so set the first as primary
      const primaryImage = selectedImages[0];
      const additionalImages = selectedImages.slice(1); // All images except the first
      
      if (primaryImage) {
        console.log('Setting primary image:', primaryImage, 'and adding additional:', additionalImages);
        setEditProduct(prev => {
          const updated = { 
            ...prev, 
            image: primaryImage.dataUri, 
            imageId: primaryImage.imageId,
            images: additionalImages.length > 0 ? [...(prev.images || []), ...additionalImages] : prev.images
          };
          console.log('Updated editProduct:', updated);
          return updated;
        });
        addToast({
          title: "Images Added",
          description: `Primary image set and ${additionalImages.length} additional image(s) added`,
          type: "success"
        });
      }
    } else {
      // Add all selected images as additional images
      console.log('Adding additional images:', selectedImages);
      setEditProduct(prev => {
        const updated = { 
          ...prev, 
          images: [...(prev.images || []), ...selectedImages]
        };
        console.log('Updated editProduct for additional:', updated);
        return updated;
      });
      addToast({
        title: "Images Added",
        description: `${selectedImages.length} image(s) added to product gallery`,
        type: "success"
      });
    }

    setShowAssetGallery(false);
    setSelectedImages([]);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGalleryImageClick = (image: ProductImage) => {
    if (image?.dataUri && image?.imageId) {
      console.log('Gallery image clicked:', image);
      
      // Set the image in the product form
      setEditProduct((prev) => ({ 
        ...prev, 
        image: image.dataUri, 
        imageId: image.imageId 
      }));
      
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
    // Check if image is being used in products
    const isUsed = products.some(p => p.imageId === image.imageId || p.images?.some(img => img.imageId === image.imageId));
    
    if (isUsed) {
      const confirmMessage = `This image is currently being used in ${products.filter(p => p.imageId === image.imageId || p.images?.some(img => img.imageId === image.imageId)).length} product(s). Deleting it will remove it from all products. Are you sure you want to delete it?`;
      if (!confirm(confirmMessage)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to delete this image?`)) {
        return;
      }
    }
    
    try {
      const response = await fetch(`/api/admin/gallery?id=${image.imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error ?? 'Failed to delete image');
      }

      // Invalidate and refetch gallery data immediately
      void queryClient.invalidateQueries({ queryKey: ['gallery'] });
      await refetchGallery();
      
      addToast({
        title: "Image Deleted",
        description: "Image has been deleted successfully",
        type: "success"
      });
    } catch (err) {
      console.error('Error deleting image:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete image';
      addToast({
        title: "Error",
        description: errorMessage,
        type: "error"
      });
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
            <p className="text-lg text-gray-500">
              {isCodeSent ? "Enter the verification code sent to your email" : "Enter your email to receive a verification code"}
            </p>
          </div>
          
          {!isCodeSent ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-base font-medium text-gray-900 mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
                  placeholder="admin@stitchpleaseqc.com"
                  required
                />
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] py-4 text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                Send Verification Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label htmlFor="verificationCode" className="block text-base font-medium text-gray-900 mb-3">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200 text-center tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Code sent to: <span className="font-medium">{email}</span>
                </p>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] py-4 text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? "Verifying..." : "Verify Code"}
                </Button>
                
                <Button
                  type="button"
                  onClick={() => {
                    setIsCodeSent(false);
                    setVerificationCode("");
                    setError("");
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 text-base font-medium rounded-xl transition-all duration-200"
                >
                  Back to Email
                </Button>
              </div>
            </form>
          )}
          
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
    return (
      <Dashboard
        orders={orders}
        ordersLoading={ordersLoading}
        totalOrders={totalOrders}
        onRefetchOrders={refetchOrders}
        onViewOrder={openOrderModal}
        onSetActiveSection={setActiveSection}
      />
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
                  <p className="text-xl font-bold text-gray-900">${(product.price ?? 0).toFixed(2)}</p>
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

  const renderOrders = () => {
    return (
      <Orders
        orders={orders}
        ordersLoading={ordersLoading}
        totalOrders={totalOrders}
        totalPages={totalPages}
        currentPage={currentPage}
        ordersPerPage={ordersPerPage}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        viewMode={viewMode}
        onSearch={handleSearch}
        onStatusFilterChange={handleStatusFilterChange}
        onPageChange={handlePageChange}
        onViewModeChange={setViewMode}
        onRefetchOrders={refetchOrders}
        onViewOrder={openOrderModal}
        onStatusChange={handleStatusChange}
        onPickupReady={handlePickupReady}
        onArchiveOrder={handleArchiveOrder}
      />
    );
  };

  const renderBurndown = () => {
    // Use settings thresholds
    const urgentThreshold = settings.burndownUrgentThreshold;
    const criticalThreshold = settings.burndownCriticalThreshold;
    
    // Sort orders by time elapsed (oldest first), but only show pending/processing/ready_for_pickup/delivered orders that aren't archived
    const burndownOrders = [...allOrdersForBurndown]
      .filter(order => (order.status === 'pending' || order.status === 'processing' || order.status === 'ready_for_pickup' || order.status === 'delivered') && !order.archived)
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeA - timeB; // Oldest first
      });

    // Group orders by urgency using configurable thresholds
    // Note: Delivered orders are grouped separately
    const criticalOrders = burndownOrders.filter(order => {
      if (order.status === 'delivered' || order.status === 'ready_for_pickup') return false;
      const now = new Date();
      const created = new Date(order.createdAt);
      const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
      return diffHours >= criticalThreshold;
    });

    const urgentOrders = burndownOrders.filter(order => {
      if (order.status === 'delivered' || order.status === 'ready_for_pickup') return false;
      const now = new Date();
      const created = new Date(order.createdAt);
      const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
      return diffHours >= urgentThreshold && diffHours < criticalThreshold;
    });

    const normalOrders = burndownOrders.filter(order => {
      if (order.status === 'delivered' || order.status === 'ready_for_pickup') return false;
      const now = new Date();
      const created = new Date(order.createdAt);
      const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
      return diffHours < urgentThreshold;
    });

    // Separate delivered orders
    const deliveredOrders = burndownOrders.filter(order => order.status === 'delivered');
    const readyOrders = burndownOrders.filter(order => order.status === 'ready_for_pickup');

    // Calculate weekly score - average of individual order scores delivered this week
    const allDeliveredOrders = allOrdersForBurndown.filter(order => order.status === 'delivered');
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Go to Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Filter orders delivered this week (based on when they were completed)
    const weeklyDeliveredOrders = allDeliveredOrders.filter(order => {
      // Use completedAt if available, otherwise use updatedAt as fallback
      let completionDate: Date;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const completedAtValue = order.completedAt;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const updatedAtValue = order.updatedAt;
      
      if (completedAtValue) {
        completionDate = completedAtValue instanceof Date 
          ? completedAtValue 
          : new Date(String(completedAtValue));
      } else if (updatedAtValue) {
        completionDate = updatedAtValue instanceof Date 
          ? updatedAtValue 
          : new Date(String(updatedAtValue));
      } else {
        return false; // Skip if no date available
      }
      
      return completionDate >= startOfWeek;
    });
    
    // Calculate individual scores for each order and average them
    const weeklyScores = weeklyDeliveredOrders.map(order => calculateOrderScore(order));
    const weeklyTotalScore = weeklyScores.reduce((sum, score) => sum + score, 0);
    const weeklyAverageScore = weeklyScores.length > 0 
      ? Math.round(weeklyTotalScore / weeklyScores.length) 
      : 0;
    const weeklyTotalOrders = weeklyDeliveredOrders.length;

    // Calculate pagination - paginate all orders together, then display by category
    const startIndex = (burndownPage - 1) * burndownOrdersPerPage;
    const endIndex = startIndex + burndownOrdersPerPage;
    const paginatedBurndownOrders = burndownOrders.slice(startIndex, endIndex);
    
    // Group paginated orders by urgency using configurable thresholds
    // Note: Delivered and ready orders are grouped separately
    const paginatedCriticalOrders = paginatedBurndownOrders.filter(order => {
      if (order.status === 'delivered' || order.status === 'ready_for_pickup') return false;
      const now = new Date();
      const created = new Date(order.createdAt);
      const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
      return diffHours >= criticalThreshold;
    });

    const paginatedUrgentOrders = paginatedBurndownOrders.filter(order => {
      if (order.status === 'delivered' || order.status === 'ready_for_pickup') return false;
      const now = new Date();
      const created = new Date(order.createdAt);
      const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
      return diffHours >= urgentThreshold && diffHours < criticalThreshold;
    });

    const paginatedNormalOrders = paginatedBurndownOrders.filter(order => {
      if (order.status === 'delivered' || order.status === 'ready_for_pickup') return false;
      const now = new Date();
      const created = new Date(order.createdAt);
      const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
      return diffHours < urgentThreshold;
    });

    const paginatedReadyOrders = paginatedBurndownOrders.filter(order => order.status === 'ready_for_pickup');
    const paginatedDeliveredOrders = paginatedBurndownOrders.filter(order => order.status === 'delivered');
    
    const totalBurndownPages = Math.ceil(burndownOrders.length / burndownOrdersPerPage);

    // Calculate average times
    const calculateAvgTime = (orders: Order[]) => {
      if (orders.length === 0) return 0;
      const now = new Date();
      const totalHours = orders.reduce((sum, order) => {
        const created = new Date(order.createdAt);
        const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
        return sum + diffHours;
      }, 0);
      return Math.round(totalHours / orders.length);
    };

    const avgCriticalTime = calculateAvgTime(criticalOrders);
    const avgUrgentTime = calculateAvgTime(urgentOrders);
    const avgNormalTime = calculateAvgTime(normalOrders);
    const avgAllTime = calculateAvgTime(burndownOrders);

    // Prepare chart data with minimal color palette
    const urgencyDistributionData = [
      { name: 'Critical', value: criticalOrders.length, color: '#DC2626' },
      { name: 'Urgent', value: urgentOrders.length, color: '#F97316' },
      { name: 'On Track', value: normalOrders.length, color: '#74CADC' },
    ].filter(item => item.value > 0);

    // Time distribution buckets - aligned with urgency thresholds
    const timeBuckets = [
      { 
        range: `0-${urgentThreshold}h`, 
        min: 0, 
        max: urgentThreshold, 
        color: '#74CADC',
        label: 'On Track'
      },
      { 
        range: `${urgentThreshold}-${criticalThreshold}h`, 
        min: urgentThreshold, 
        max: criticalThreshold, 
        color: '#F97316',
        label: 'Urgent'
      },
      { 
        range: `${criticalThreshold}h+`, 
        min: criticalThreshold, 
        max: Infinity, 
        color: '#DC2626',
        label: 'Critical'
      },
    ];

    const timeDistributionData = timeBuckets.map(bucket => {
      const count = burndownOrders.filter(order => {
        const now = new Date();
        const created = new Date(order.createdAt);
        const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
        if (bucket.max === Infinity) {
          return diffHours >= bucket.min;
        }
        return diffHours >= bucket.min && diffHours < bucket.max;
      }).length;
      return {
        range: bucket.range,
        count,
        color: bucket.color,
        label: bucket.label,
      };
    }).filter(item => item.count > 0); // Only show buckets with orders

    return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Burndown</h1>
            <p className="text-gray-600 mt-2">Track order production time and prioritize urgent orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
              onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-2"
          >
              {showCharts ? (
                <>
                  <Eye className="h-4 w-4" />
                  Hide Charts
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4" />
                  Show Charts
                </>
              )}
          </Button>
          <Button
            variant="outline"
              onClick={() => {
                void refetchBurndown();
                void refetchOrders();
              }}
              disabled={burndownLoading}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
              {burndownLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Critical</h3>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-700" />
        </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{criticalOrders.length}</p>
            <p className="text-sm text-gray-600">{criticalThreshold}+ hours overdue</p>
            {criticalOrders.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">Avg: {avgCriticalTime}h</p>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Urgent</h3>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{urgentOrders.length}</p>
            <p className="text-sm text-gray-600">{urgentThreshold}-{criticalThreshold} hours</p>
            {urgentOrders.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">Avg: {avgUrgentTime}h</p>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">On Track</h3>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{normalOrders.length}</p>
            <p className="text-sm text-gray-600">&lt; {urgentThreshold} hours</p>
            {normalOrders.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">Avg: {avgNormalTime}h</p>
            )}
          </div>
        </div>

        {/* Charts Section */}
        {showCharts && burndownOrders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Urgency Distribution Pie Chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                Order Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={urgencyDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {urgencyDistributionData.map((entry: { name: string; value: number; color: string }, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Time Distribution Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                Orders by Urgency Level
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Distribution of orders across urgency categories based on time elapsed
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    label={{ value: 'Number of Orders', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 12 } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                      padding: '8px 12px'
                    }}
                    formatter={(value: number) => [value, 'Orders']}
                    labelFormatter={(label: string) => `Urgency: ${label}`}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {timeDistributionData.map((entry: { range: string; count: number; color: string; label: string }, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Overall Metrics */}
        {burndownOrders.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                Overall Metrics
              </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Average Time</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(avgAllTime / 24)}d</p>
                <p className="text-xs text-gray-500 mt-1">Across all orders</p>
        </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Active Orders</p>
                <p className="text-3xl font-bold text-gray-900">{burndownOrders.length}</p>
                <p className="text-xs text-gray-500 mt-1">Pending & Processing</p>
      </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {normalOrders.length > 0 ? Math.round((normalOrders.length / burndownOrders.length) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">On track orders</p>
              </div>
            </div>
          </div>
      )}

        {/* Orders List */}
        {burndownLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
        ) : burndownOrders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
            <Clock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No active orders to track</p>
            <p className="text-sm text-gray-400 mt-2">All orders are completed or ready for pickup</p>
        </div>
        ) : (
          <div className="space-y-4">
            {/* Critical Orders */}
            {criticalOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Critical Priority ({criticalOrders.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedCriticalOrders.map((order) => (
                    <BurndownOrderCard 
                      key={order._id?.toString() ?? order.orderNumber} 
                      order={order} 
                      onStatusChange={handleStatusChange}
                      onPickupReady={handlePickupReady}
                      onViewOrder={openOrderModal}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Urgent Orders */}
            {urgentOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Urgent ({urgentOrders.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedUrgentOrders.map((order) => (
                    <BurndownOrderCard 
                      key={order._id?.toString() ?? order.orderNumber} 
                      order={order} 
                      onStatusChange={handleStatusChange}
                      onPickupReady={handlePickupReady}
                      onViewOrder={openOrderModal}
                    />
                  ))}
                        </div>
                        </div>
            )}

            {/* Normal Orders */}
            {paginatedNormalOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  On Track ({normalOrders.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedNormalOrders.map((order) => (
                    <BurndownOrderCard 
                      key={order._id?.toString() ?? order.orderNumber} 
                      order={order} 
                      onStatusChange={handleStatusChange}
                      onPickupReady={handlePickupReady}
                      onViewOrder={openOrderModal}
                    />
                  ))}
                        </div>
                        </div>
            )}

            {/* Ready for Pickup Orders */}
            {paginatedReadyOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Ready for Pickup ({readyOrders.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedReadyOrders.map((order) => (
                    <BurndownOrderCard 
                      key={order._id?.toString() ?? order.orderNumber} 
                      order={order} 
                      onStatusChange={handleStatusChange}
                      onPickupReady={handlePickupReady}
                      onViewOrder={openOrderModal}
                    />
                  ))}
                        </div>
                        </div>
            )}

            {/* Delivered Orders */}
            {paginatedDeliveredOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Delivered ({deliveredOrders.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedDeliveredOrders.map((order) => (
                    <BurndownOrderCard 
                      key={order._id?.toString() ?? order.orderNumber} 
                      order={order} 
                      onStatusChange={handleStatusChange}
                      onPickupReady={handlePickupReady}
                      onViewOrder={openOrderModal}
                    />
                  ))}
                        </div>
              </div>
            )}

            {/* Pagination */}
            {burndownOrders.length > burndownOrdersPerPage && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mt-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs md:text-sm text-gray-500 text-center sm:text-left">
                    Showing {((burndownPage - 1) * burndownOrdersPerPage) + 1} to {Math.min(burndownPage * burndownOrdersPerPage, burndownOrders.length)} of {burndownOrders.length} orders
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                        <Button
                      onClick={() => setBurndownPage(p => Math.max(1, p - 1))}
                      disabled={burndownPage === 1}
                          variant="ghost"
                      className="px-2 md:px-3 py-2 text-sm"
                        >
                      Prev
                        </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalBurndownPages) }, (_, i) => {
                        const page = i + 1;
                        const isActive = page === burndownPage;
                        
                        return (
                          <Button
                            key={page}
                            onClick={() => setBurndownPage(page)}
                            variant={isActive ? "default" : "ghost"}
                            className={`px-2 md:px-3 py-2 text-sm ${
                              isActive 
                                ? 'bg-[#74CADC] text-[#0A5565] hover:bg-[#74CADC]/90' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      onClick={() => setBurndownPage(p => Math.min(totalBurndownPages, p + 1))}
                      disabled={burndownPage >= totalBurndownPages}
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
        )}
                </div>
    );
  };

  const renderArchive = () => {
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Archive</h1>
            <p className="text-gray-600 mt-2">View and manage archived orders</p>
                  </div>
          <Button
            variant="outline"
            onClick={() => {
              void refetchArchived();
              void refetchOrders();
            }}
            disabled={archivedLoading}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            {archivedLoading ? "Loading..." : "Refresh"}
          </Button>
                </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search archived orders..."
              value={archiveSearchQuery}
              onChange={(e) => {
                setArchiveSearchQuery(e.target.value);
                setArchivePage(1);
              }}
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC]"
            />
                </div>
              </div>

        {/* Orders List */}
        {archivedLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading archived orders...</p>
                </div>
        ) : archivedOrders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
            <Archive className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No archived orders</p>
            <p className="text-sm text-gray-400 mt-2">Archived orders will appear here</p>
          </div>
        ) : (
          <>
                  <div className="space-y-3">
              {archivedOrders.map((order) => (
                <div
                  key={order._id?.toString() ?? order.orderNumber}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-900">#{order.orderNumber}</h3>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-800 border border-green-200' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-800 border border-red-200' :
                          'bg-gray-50 text-gray-800 border border-gray-200'
                        }`}>
                          {order.status}
                              </span>
                        {order.archivedAt && (() => {
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                          const archivedAtValue = order.archivedAt;
                          const archivedDate: Date = archivedAtValue instanceof Date 
                            ? archivedAtValue 
                            : new Date(String(archivedAtValue));
                          return (
                            <span className="text-xs text-gray-500">
                              Archived {archivedDate.toLocaleDateString()}
                              </span>
                          );
                        })()}
                        </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 font-medium">
                            {order.customer.firstName} {order.customer.lastName}
                          </span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-600">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm font-bold text-gray-900">
                            ${(order.total ?? 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                      </div>
                  </div>
                </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchiveOrder(order._id!.toString(), false)}
                        className="h-10 px-4 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-all duration-200 flex items-center gap-2"
                        title="Unarchive order"
                      >
                        <Archive className="h-4 w-4" />
                        Unarchive
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openOrderModal(order)}
                        className="h-10 w-10 p-0 text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
              </div>
              </div>
            </div>
          ))}
        </div>

      {/* Pagination */}
            {archivedTotalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs md:text-sm text-gray-500 text-center sm:text-left">
                    Showing {((archivePage - 1) * archiveOrdersPerPage) + 1} to {Math.min(archivePage * archiveOrdersPerPage, archivedTotal)} of {archivedTotal} orders
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                      onClick={() => setArchivePage(p => Math.max(1, p - 1))}
                      disabled={archivePage === 1 || archivedLoading}
                variant="ghost"
                className="px-2 md:px-3 py-2 text-sm"
              >
                Prev
              </Button>
              
              <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, archivedTotalPages) }, (_, i) => {
                  const page = i + 1;
                        const isActive = page === archivePage;
                  
                  return (
                    <Button
                      key={page}
                            onClick={() => setArchivePage(page)}
                            disabled={archivedLoading}
                            variant={isActive ? "default" : "ghost"}
                      className={`px-2 md:px-3 py-2 text-sm ${
                        isActive 
                                ? 'bg-[#74CADC] text-[#0A5565] hover:bg-[#74CADC]/90' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                      onClick={() => setArchivePage(p => Math.min(archivedTotalPages, p + 1))}
                      disabled={archivePage === archivedTotalPages || archivedLoading}
                variant="ghost"
                className="px-2 md:px-3 py-2 text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
            )}
          </>
      )}
    </div>
  );
  };

  // Burndown Order Card Component
  const BurndownOrderCard = ({ 
    order, 
    onStatusChange, 
    onPickupReady, 
    onViewOrder
  }: { 
    order: Order; 
    onStatusChange: (orderId: string, status: string) => void;
    onPickupReady: (order: Order) => void;
    onViewOrder: (order: Order) => void;
  }) => {
    const timeElapsed = formatTimeElapsed(order.createdAt);
    const hours = timeElapsed.hours;
    // Use configurable threshold for progress calculation
    const criticalThreshold = settings.burndownCriticalThreshold;
    
    // Calculate progress based on order status stages:
    // Pending: 0%
    // Processing: 25%
    // Ready for Pickup: 50%
    // Delivered: 100%
    let progress: number;
    switch (order.status) {
      case 'pending':
        progress = 0;
        break;
      case 'processing':
        progress = 25;
        break;
      case 'ready_for_pickup':
        progress = 50;
        break;
      case 'delivered':
        progress = 100;
        break;
      default:
        progress = 0; // Default to pending stage
    }

    // Calculate score for delivered orders (consistent with weekly calculation)
    const displayScore = order.status === 'delivered' ? calculateOrderScore(order) : 0;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200 ease-in-out h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-base font-bold text-gray-900 truncate">#{order.orderNumber}</h3>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-md flex-shrink-0 ${
                order.status === 'pending' ? 'bg-orange-50 text-orange-800 border border-orange-200' :
                order.status === 'processing' ? 'bg-[#74CADC]/10 text-[#0A5565] border border-[#74CADC]/30' :
                order.status === 'ready_for_pickup' ? 'bg-green-50 text-green-800 border border-green-200' :
                order.status === 'delivered' ? 'bg-gray-50 text-gray-800 border border-gray-200' :
                'bg-[#74CADC]/10 text-[#0A5565] border border-[#74CADC]/30'
              }`}>
                {order.status === 'pending' ? 'Pending' : 
                 order.status === 'processing' ? 'Processing' :
                 order.status === 'ready_for_pickup' ? 'Ready' :
                 order.status === 'delivered' ? 'Delivered' : 'Processing'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className={`h-3.5 w-3.5 ${timeElapsed.color} flex-shrink-0`} />
              <span className={`text-xs font-medium ${timeElapsed.color}`}>
                {timeElapsed.text}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewOrder(order)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Customer Info */}
        <div className="mb-3 space-y-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {order.customer.firstName} {order.customer.lastName}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span className="font-semibold text-gray-900">${(order.total ?? 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-auto mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-semibold text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                // Priority 1: Critical orders (pending or processing) - RED
                (order.status === 'pending' || order.status === 'processing') && hours >= criticalThreshold ? 'bg-red-500' :
                // Priority 2: Status-based colors
                order.status === 'delivered' ? 'bg-[#74CADC]' :
                order.status === 'ready_for_pickup' ? 'bg-green-500' :
                // Priority 3: Non-critical processing - brand color
                order.status === 'processing' ? 'bg-[#74CADC]' :
                // Priority 4: Pending orders by urgency
                order.status === 'pending' && hours >= settings.burndownUrgentThreshold ? 'bg-orange-500' :
                order.status === 'pending' && hours >= 12 ? 'bg-yellow-500' :
                order.status === 'pending' ? 'bg-[#74CADC]' :
                // Fallback
                'bg-[#74CADC]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {order.status === 'delivered' ? (
            // Show score for delivered orders - each order is scored individually based on its completion time
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Score</div>
              <div className="text-2xl font-bold text-gray-900">{displayScore}</div>
              <div className="text-xs text-gray-500 mt-1">out of 100</div>
              <div className="text-xs text-gray-400 mt-1">
                {(() => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  const createdAtValue = order.createdAt;
                  const createdAt: Date = createdAtValue instanceof Date 
                    ? createdAtValue 
                    : new Date(String(createdAtValue));
                  
                  let completedAt: Date;
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  const completedAtValue = order.completedAt;
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  const updatedAtValue = order.updatedAt;
                  
                  if (completedAtValue) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    completedAt = completedAtValue instanceof Date 
                      ? completedAtValue 
                      : new Date(String(completedAtValue));
                  } else if (updatedAtValue) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    completedAt = updatedAtValue instanceof Date 
                      ? updatedAtValue 
                      : new Date(String(updatedAtValue));
                  } else {
                    completedAt = createdAt; // Fallback
                  }
                  const hours = Math.round((completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
                  return `${hours}h to complete`;
                })()}
              </div>
            </div>
          ) : (
            <>
              {order.status === 'pending' && (
                <Button
                  onClick={() => onStatusChange(order._id!.toString(), 'ready_for_pickup')}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] rounded-lg transition-all duration-200"
                >
                  Mark Ready for Pickup
                </Button>
              )}
              {order.status === 'ready_for_pickup' && (
                <Button
                  onClick={() => onStatusChange(order._id!.toString(), 'delivered')}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] rounded-lg transition-all duration-200"
                >
                  Mark Delivered
                </Button>
              )}
              {order.status === 'processing' && (
                <Button
                  onClick={() => onPickupReady(order)}
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] rounded-lg transition-all duration-200"
                >
                  Mark Ready
                </Button>
              )}
              {/* Fallback dropdown for other statuses */}
              {!['pending', 'ready_for_pickup', 'processing', 'delivered'].includes(order.status as string) && (
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order._id!.toString(), e.target.value)}
                  className={`text-xs font-semibold rounded-lg border-2 px-2.5 py-1.5 transition-all cursor-pointer focus:outline-none focus:ring-1 w-full ${
                    order.status === 'pending' ? 'bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100 focus:ring-orange-200' :
                    order.status === 'processing' ? 'bg-[#74CADC]/10 text-[#0A5565] border-[#74CADC]/30 hover:bg-[#74CADC]/20 focus:ring-[#74CADC]/20' :
                    order.status === 'ready_for_pickup' ? 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100 focus:ring-green-200' :
                    (order.status === 'shipped' || order.status === 'cancelled') ? 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100 focus:ring-gray-200' :
                    'bg-[#74CADC]/10 text-[#0A5565] border-[#74CADC]/30 hover:bg-[#74CADC]/20 focus:ring-[#74CADC]/20'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="ready_for_pickup">Ready for Pickup</option>
                  <option value="delivered">Delivered</option>
                </select>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

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
            {selectedImages.length > 0 && (
              <p className="text-sm text-[#74CADC] mt-1">
                {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedImages.length > 0 && (
              <Button
                onClick={handleConfirmImageSelection}
                className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-4 py-2"
              >
                Create Product ({selectedImages.length})
              </Button>
            )}
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
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {galleryImages.map((image) => {
            if (!image?.id) return null;
            const isSelected = selectedImages.some(img => img.imageId === image.imageId);
            return (
              <div key={image.id} className={`group relative aspect-square rounded-lg overflow-hidden border-4 transition-all duration-200 bg-gray-50 ${
                isSelected ? 'border-[#74CADC]' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <button
                  onClick={() => handleToggleImageSelection(image)}
                  className="w-full h-full relative"
                >
                  <Image
                    src={image.dataUri ?? ''}
                    alt={image.filename ?? 'Gallery image'}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#74CADC]/30 flex items-center justify-center">
                      <div className="bg-[#74CADC] rounded-full p-3">
                        <CheckCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                  {!isSelected && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
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
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">Configure your store settings and preferences</p>
      </div>

      {/* Tax Settings */}
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Settings className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Tax Settings</h2>
            <p className="text-xs md:text-sm text-gray-600">Configure tax rates for your store</p>
          </div>
        </div>
        <div className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.taxRate}
              onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
              className="w-full px-3 py-2.5 text-base md:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Shipping Settings */}
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Shipping Settings</h2>
            <p className="text-xs md:text-sm text-gray-600">Configure shipping options and pickup instructions</p>
          </div>
        </div>
        <div className="space-y-6 md:space-y-8">
          {/* Pickup Only Toggle */}
          <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="min-w-0 flex-1 pr-4">
              <h3 className="text-sm md:text-base font-semibold text-gray-900">Pickup Only Mode</h3>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Disable shipping, only allow pickup</p>
            </div>
            <button
              onClick={async () => {
                const newSettings = {...settings, pickupOnly: !settings.pickupOnly};
                setSettings(newSettings);
                // Auto-save when toggle is clicked
                try {
                  // Validate thresholds before saving
                  if (newSettings.burndownUrgentThreshold >= newSettings.burndownCriticalThreshold) {
                    addToast({
                      title: "Validation Error",
                      description: "Urgent threshold must be less than critical threshold",
                      type: "error"
                    });
                    // Revert the change
                    setSettings(settings);
                    return;
                  }

                  const token = sessionStorage.getItem('admin_token');
                  if (!token) {
                    addToast({
                      title: "Authentication Error",
                      description: "Please log in to save settings",
                      type: "error"
                    });
                    // Revert the change
                    setSettings(settings);
                    return;
                  }

                  const response = await fetch('/api/admin/settings', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(newSettings),
                  });

                  if (!response.ok) {
                    const errorData = await response.json() as { error?: string };
                    throw new Error(errorData.error ?? 'Failed to save settings');
                  }

                  addToast({
                    title: "Settings Saved",
                    description: `Pickup Only Mode ${newSettings.pickupOnly ? 'enabled' : 'disabled'}`,
                    type: "success"
                  });

                  // Reload settings to ensure UI is in sync with database
                  const reloadResponse = await fetch('/api/admin/settings', {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });
                  if (reloadResponse.ok) {
                    const reloadData = await reloadResponse.json() as { settings: AdminSettings };
                    if (reloadData.settings) {
                      setSettings(reloadData.settings);
                    }
                  }
                } catch (error) {
                  console.error('Error saving settings:', error);
                  addToast({
                    title: "Error",
                    description: error instanceof Error ? error.message : 'Failed to save settings. Please try again.',
                    type: "error"
                  });
                  // Revert the change on error
                  setSettings(settings);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 flex-shrink-0 ${
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
                  className="w-full px-3 py-2.5 text-base md:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
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
                  className="w-full px-3 py-2.5 text-base md:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
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
              className="w-full px-3 py-2.5 text-base md:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200 resize-none"
              placeholder="Instructions for customers on how to pickup their orders..."
            />
          </div>

          {/* Burndown Settings */}
          <div className="border-t border-gray-200 pt-4 md:pt-6 mt-4 md:mt-6">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Burndown Thresholds</h3>
            <p className="text-xs md:text-sm text-gray-600 mb-4 break-words">
              Configure the time thresholds for order urgency classification
            </p>

            {/* Urgent Threshold */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Urgent Threshold (days)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={Math.round(settings.burndownUrgentThreshold / 24)}
                onChange={(e) => {
                  const days = parseInt(e.target.value) || 1;
                  const hours = days * 24;
                  const newSettings = { ...settings, burndownUrgentThreshold: hours };
                  // Validate: urgent must be less than critical
                  if (hours >= settings.burndownCriticalThreshold) {
                    // Auto-adjust critical threshold if needed
                    const criticalDays = Math.ceil(settings.burndownCriticalThreshold / 24);
                    newSettings.burndownCriticalThreshold = (criticalDays + 1) * 24;
                  }
                  setSettings(newSettings);
                }}
                className={`w-full px-3 py-2.5 text-base md:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200 ${
                  settings.burndownUrgentThreshold >= settings.burndownCriticalThreshold
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {settings.burndownUrgentThreshold >= settings.burndownCriticalThreshold && (
                <p className="text-xs text-red-600 mt-1 break-words">
                  Urgent threshold must be less than critical threshold (auto-adjusted)
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1 break-words">
                Orders older than {Math.round(settings.burndownUrgentThreshold / 24)} day{Math.round(settings.burndownUrgentThreshold / 24) !== 1 ? 's' : ''} will be marked as urgent
              </p>
            </div>

            {/* Critical Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Critical Threshold (days)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={Math.round(settings.burndownCriticalThreshold / 24)}
                onChange={(e) => {
                  const days = parseInt(e.target.value) || 1;
                  const hours = days * 24;
                  const newSettings = { ...settings, burndownCriticalThreshold: hours };
                  // Validate: critical must be greater than urgent
                  if (hours <= settings.burndownUrgentThreshold) {
                    // Auto-adjust urgent threshold if needed
                    const urgentDays = Math.floor(settings.burndownUrgentThreshold / 24);
                    newSettings.burndownUrgentThreshold = Math.max(1, urgentDays - 1) * 24;
                  }
                  setSettings(newSettings);
                }}
                className={`w-full px-3 py-2.5 text-base md:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200 ${
                  settings.burndownCriticalThreshold <= settings.burndownUrgentThreshold
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {settings.burndownCriticalThreshold <= settings.burndownUrgentThreshold && (
                <p className="text-xs text-red-600 mt-1 break-words">
                  Critical threshold must be greater than urgent threshold (auto-adjusted)
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1 break-words">
                Orders older than {Math.round(settings.burndownCriticalThreshold / 24)} day{Math.round(settings.burndownCriticalThreshold / 24) !== 1 ? 's' : ''} will be marked as critical
              </p>
            </div>
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
              {activeSection === 'burndown' && 'Order Priority & Timing'}
              {activeSection === 'archive' && 'Archived Orders'}
              {activeSection === 'products' && 'Inventory Management'}
              {activeSection === 'settings' && 'Store Configuration'}
            </p>
          </div>
        </div>
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
          <div className="pt-4 mt-4">
            <Button
              onClick={() => {
                setActiveSection('archive');
                setShowMobileMenu(false);
              }}
              className={`w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 px-6 py-3 transition-all duration-200 flex items-center justify-center gap-2 mb-4 ${
                activeSection === 'archive' ? 'bg-gray-100 border-gray-300' : ''
              }`}
            >
              <Archive className="h-4 w-4" />
              <span className="font-medium">Archive</span>
            </Button>
            
            <div className="border-t border-gray-200 pt-4">
              <Button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 px-6 py-3 transition-all duration-200"
              >
                <span className="font-medium">Logout</span>
              </Button>
            </div>
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
          
          <div className="pt-4">
            <Button
              onClick={() => setActiveSection('archive')}
              className={`w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 px-6 py-3 transition-all duration-200 flex items-center justify-center gap-2 mb-4 ${
                activeSection === 'archive' ? 'bg-gray-100 border-gray-300' : ''
              }`}
            >
              <Archive className="h-4 w-4" />
              <span className="font-medium">Archive</span>
            </Button>
          
          <div className="border-t border-gray-200 pt-4">
            <Button
              onClick={handleLogout}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 px-6 py-3 transition-all duration-200"
            >
              <span className="font-medium">Logout</span>
            </Button>
            </div>
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
            {activeSection === "burndown" && renderBurndown()}
            {activeSection === "archive" && renderArchive()}
            {activeSection === "gallery" && renderGallery()}
            {activeSection === "settings" && (
              <div className="space-y-8">
                {renderSettings()}
                
                {/* Save Button */}
                <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Save className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-gray-900">Save Settings</h3>
                      <p className="text-xs md:text-sm text-gray-600">Save your configuration changes</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveSettings}
                    className="w-full md:w-auto bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-6 py-3 transition-all duration-200"
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
                            onClick={() => {
                              // If there are additional images, make the first one the primary
                              if (editProduct.images && editProduct.images.length > 0) {
                                const newPrimary = editProduct.images?.[0];
                                if (newPrimary) {
                                  setEditProduct({
                                    ...editProduct,
                                    image: newPrimary.dataUri,
                                    imageId: newPrimary.imageId,
                                    images: editProduct.images?.slice(1) || [] // Remove the now-primary image from additional
                                  });
                                }
                                addToast({
                                  title: "Primary Image Updated",
                                  description: "Next image has been set as primary",
                                  type: "success"
                                });
                              } else {
                                // No additional images, just clear the primary
                                setEditProduct({...editProduct, image: "", imageId: ""});
                                addToast({
                                  title: "Image Removed",
                                  description: "Primary image has been removed",
                                  type: "success"
                                });
                              }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 md:p-2 rounded-lg"
                          >
                            <X className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Images Preview - below primary image */}
                    {(editProduct.images && editProduct.images.length > 0) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Additional Product Images ({editProduct.images.length})
                          <span className="text-xs text-gray-500 ml-2">Click to set as primary</span>
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {editProduct.images.map((img, idx) => (
                            <div key={img.id} className="relative group">
                              <Image
                                src={img.dataUri}
                                alt={img.filename}
                                width={100}
                                height={100}
                                className="w-full h-20 object-cover rounded-lg border-2 border-gray-300 cursor-pointer hover:border-[#74CADC] transition-all"
                                onClick={() => {
                                  // Set as primary image - swap with current primary
                                  const currentPrimaryImage = editProduct.image;
                                  const currentPrimaryImageId = editProduct.imageId;
                                  
                                  // Create new images array with the old primary added back (if it exists)
                                  let newImages = editProduct.images.filter(i => i.id !== img.id);
                                  
                                  // Add the old primary image back to the additional images (if it exists and is different)
                                  if (currentPrimaryImage && currentPrimaryImageId && currentPrimaryImageId !== img.imageId) {
                                    newImages = [...newImages, {
                                      id: Date.now().toString(), // Temporary ID for the swapped image
                                      imageId: currentPrimaryImageId,
                                      dataUri: currentPrimaryImage,
                                      mimeType: img.mimeType, // Use same mime type as a fallback
                                      filename: `primary_image.png` // Fallback filename
                                    }];
                                  }
                                  
                                  setEditProduct(prev => ({
                                    ...prev,
                                    image: img.dataUri,
                                    imageId: img.imageId,
                                    images: newImages
                                  }));
                                  addToast({
                                    title: "Primary Image Updated",
                                    description: "Image has been set as primary",
                                    type: "success"
                                  });
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveProductImage(img.id);
                                }}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                                {idx + 1}
                              </div>
                            </div>
                          ))}
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
                      
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#74CADC] mb-4"></div>
                          <p className="text-gray-600">Uploading image...</p>
                        </div>
                      ) : editProduct.image ? (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
                            <Button
                              type="button"
                              onClick={() => editFileInputRef.current?.click()}
                              disabled={isUploading}
                              className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400 px-4 md:px-6 py-2 md:py-3 transition-all duration-200 flex items-center justify-center"
                            >
                              <Upload className="h-4 w-4 mr-2 md:mr-3" />
                              <span className="font-medium text-sm md:text-base">Upload New Image</span>
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                setImageSelectionMode('primary');
                                handleOpenGallery('primary');
                              }}
                              disabled={isUploading}
                              className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400 px-4 md:px-6 py-2 md:py-3 transition-all duration-200 flex items-center justify-center"
                            >
                              <ImageIcon className="h-4 w-4 mr-2 md:mr-3" />
                              <span className="font-medium text-sm md:text-base">Choose from Gallery</span>
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
                                onClick={() => {
                                  setImageSelectionMode('primary');
                                  handleOpenGallery('primary');
                                }}
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
                    
                    {/* Image Guidelines */}
                    <div className="text-sm text-gray-500">
                      <p>• Recommended size: 800x800px or larger</p>
                      <p>• Supported formats: JPG, PNG, WebP</p>
                      <p>• Maximum file size: 5MB</p>
                      <p>• Or choose from previously uploaded images</p>
                    </div>
                  </div>
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
                    
                    {/* Custom Color Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="customColor"
                        placeholder="Add custom color"
                        className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const customColor = input.value.trim();
                            if (customColor && !editProduct.colors.includes(customColor)) {
                              addEditColor(customColor);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('customColor') as HTMLInputElement;
                          const customColor = input.value.trim();
                          if (customColor && !editProduct.colors.includes(customColor)) {
                            addEditColor(customColor);
                            input.value = '';
                          }
                        }}
                        className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-4 py-2"
                      >
                        Add
                      </Button>
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
                    disabled={isProcessingProduct}
                    className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-medium transition-all duration-200 flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessingProduct ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0A5565] mr-2"></div>
                        {isEditingMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      isEditingMode ? "Update Product" : "Create Product"
                    )}
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
                    <p><span className="font-medium">Total:</span> ${(selectedOrderForModal.total ?? 0).toFixed(2)}</p>
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
                                Color: {item.selectedColor === "Custom" && item.customColorValue
                                  ? `Custom (${item.customColorValue})`
                                  : item.selectedColor}
                              </span>
                            )}
                            <span className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-md">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${(item.quantity * (item.productPrice ?? 0)).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${(item.productPrice ?? 0).toFixed(2)} each
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
                    <span className="font-medium text-gray-900">${(selectedOrderForModal.subtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">${(selectedOrderForModal.tax ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Pickup</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${(selectedOrderForModal.total ?? 0).toFixed(2)}</span>
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
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                  Asset Gallery
                </h2>
                {selectedImages.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRefreshGallery}
                  disabled={galleryLoading}
                  variant="outline"
                  className="p-2 md:p-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  <Activity className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                {selectedImages.length > 0 && (
                  <Button
                    onClick={handleConfirmImageSelection}
                    className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-4 py-2"
                  >
                    Confirm Selection ({selectedImages.length})
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setShowAssetGallery(false);
                    setSelectedImages([]);
                  }}
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
                  if (!image?.id) return null;
                  const isSelected = selectedImages.some(img => img.imageId === image.imageId);
                  return (
                    <div key={image.id} className={`group relative aspect-square rounded-lg overflow-hidden border-4 transition-all duration-200 bg-gray-50 ${
                      isSelected ? 'border-[#74CADC]' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <button
                        onClick={(e) => {
                          console.log('Button clicked for image:', image);
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleImageSelection(image);
                        }}
                        className="w-full h-full relative z-0"
                      >
                        <Image
                          src={image.dataUri ?? ''}
                          alt={image.filename ?? 'Gallery image'}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#74CADC]/30 flex items-center justify-center pointer-events-none z-10">
                            <div className="bg-[#74CADC] rounded-full p-3">
                              <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        )}
                        {!isSelected && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center pointer-events-none">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <ImageIcon className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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
