"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Settings, Package, Save, Edit, Trash2, Upload, X, Menu } from "lucide-react";
import { useProducts } from "~/lib/products-context";
import { useToast } from "~/lib/toast-context";
import type { Product } from "~/lib/types";
import type { Order } from "~/lib/order-types";
import { useOrders, useUpdateOrderStatus, useSendPickupNotification, useSendStatusEmail } from "~/lib/hooks/use-orders";

interface AdminSettings {
  taxRate: number;
  shippingEnabled: boolean;
  pickupOnly: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
  pickupInstructions: string;
}

export default function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeSection, setActiveSection] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
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
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editProduct, setEditProduct] = useState({
    name: "",
    price: 0,
    description: "",
    inStock: true,
    sizes: [] as string[],
    colors: [] as string[],
    image: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState<AdminSettings>({
    taxRate: 8.5,
    shippingEnabled: true,
    pickupOnly: false,
    freeShippingThreshold: 50,
    shippingCost: 9.99,
    pickupInstructions: "Please call (309) 373-6017 to schedule pickup. Available Monday-Friday 9AM-5PM."
  });


  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    description: "",
    inStock: true,
    sizes: [] as string[],
    colors: [] as string[],
    image: ""
  });


  const sidebarItems = [
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: Package },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  useEffect(() => {
    setMounted(true);
    // Check if user is already authenticated (from sessionStorage)
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

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


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "3+v7mad288ts") {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setPasswordError("");
    } else {
      setPasswordError("Invalid password. Please try again.");
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a preview URL
    const imageUrl = URL.createObjectURL(file);
    
    // Set image for new product
    setNewProduct({ ...newProduct, image: imageUrl });
  };

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.price <= 0) {
      addToast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        type: "warning"
      });
      return;
    }
    
    addProduct({
      ...newProduct,
      image: newProduct.image || "/placeholder-product.jpg",
      category: "Apparel"
    });
    setNewProduct({ name: "", price: 0, description: "", inStock: true, sizes: [], colors: [], image: "" });
    addToast({
      title: "Product Added",
      description: "Product has been added successfully!",
      type: "success"
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product.id);
    setEditProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      inStock: product.inStock,
      sizes: product.sizes ?? [],
      colors: product.colors ?? [],
      image: product.image ?? ""
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = () => {
    if (!editProduct.name || editProduct.price <= 0) {
      addToast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        type: "warning"
      });
      return;
    }
    
    if (editingProduct) {
      updateProduct(editingProduct, editProduct);
    }
    setEditingProduct(null);
    setEditProduct({ name: "", price: 0, description: "", inStock: true, sizes: [], colors: [], image: "" });
    setShowEditModal(false);
    addToast({
      title: "Product Updated",
      description: "Product has been updated successfully!",
      type: "success"
    });
  };

  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setEditProduct({ ...editProduct, image: imageUrl });
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
      addToast({
        title: "Product Deleted",
        description: "Product has been deleted successfully!",
        type: "success"
      });
    }
  };

  const addSize = (size: string) => {
    if (!newProduct.sizes.includes(size)) {
      setNewProduct({ ...newProduct, sizes: [...newProduct.sizes, size] });
    }
  };

  const removeSize = (size: string) => {
    setNewProduct({ ...newProduct, sizes: newProduct.sizes.filter(s => s !== size) });
  };

  const addColor = (color: string) => {
    if (!newProduct.colors.includes(color)) {
      setNewProduct({ ...newProduct, colors: [...newProduct.colors, color] });
    }
  };

  const removeColor = (color: string) => {
    setNewProduct({ ...newProduct, colors: newProduct.colors.filter(c => c !== color) });
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


  const renderProducts = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Add New Product Form */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Left Column - Basic Info */}
          <div className="space-y-8">
            {/* Product Image */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-4">
                Product Image
              </label>
              <div className="flex items-center gap-6">
                {newProduct.image && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                    <Image
                      src={newProduct.image}
                      alt="Product preview"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 px-6 py-3 transition-all duration-200"
                  >
                    <Upload className="h-4 w-4 mr-3" />
                    <span className="font-medium">{newProduct.image ? "Change Image" : "Upload Image"}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                Product Name *
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="w-full px-4 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200"
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
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                className="w-full px-4 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200"
                placeholder="0.00"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                Description
              </label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200 resize-none"
                placeholder="Product description"
              />
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={newProduct.inStock}
                onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})}
                className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-300"
              />
              <span className="text-base font-medium text-gray-700">In Stock</span>
            </div>
          </div>

          {/* Right Column - Sizes & Colors */}
          <div className="space-y-8">
            {/* Sizes */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-4">
                Available Sizes
              </label>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      onClick={() => newProduct.sizes.includes(size) ? removeSize(size) : addSize(size)}
                      className={`px-4 py-3 text-base font-medium rounded-lg border transition-all duration-200 ${
                        newProduct.sizes.includes(size)
                          ? "bg-[#74CADC] text-[#0A5565] border-[#74CADC]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {newProduct.sizes.length > 0 && (
                  <p className="text-sm text-gray-500 font-medium">
                    Selected: {newProduct.sizes.join(", ")}
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
                <div className="flex flex-wrap gap-3">
                  {["White", "Black", "Navy", "Gray", "Red", "Blue", "Green"].map((color) => (
                    <button
                      key={color}
                      onClick={() => newProduct.colors.includes(color) ? removeColor(color) : addColor(color)}
                      className={`px-4 py-3 text-base font-medium rounded-lg border transition-all duration-200 ${
                        newProduct.colors.includes(color)
                          ? "bg-[#74CADC] text-[#0A5565] border-[#74CADC]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
                {newProduct.colors.length > 0 && (
                  <p className="text-sm text-gray-500 font-medium">
                    Selected: {newProduct.colors.join(", ")}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4">
              <Button
                onClick={handleAddProduct}
                className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-8 py-4 text-lg font-medium transition-all duration-200"
              >
                Create Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Products */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Current Products</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group">
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
                          <span key={size} className="px-2 py-1 text-xs font-medium bg-[#74CADC] text-[#0A5565] rounded-md">
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
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] border border-[#74CADC] hover:border-[#74CADC]/90 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          onClick={() => refetchOrders()}
          disabled={ordersLoading}
          className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto"
        >
          {ordersLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC]"
          />
        </div>
        {searchQuery && (
          <Button
            onClick={() => handleSearch("")}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm"
          >
            Clear
          </Button>
        )}
      </div>
      {searchQuery && (
        <p className="text-sm text-gray-500">
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
      ) : (
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
                        order.status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-300 hover:bg-yellow-100 focus:ring-yellow-200' :
                        order.status === 'processing' ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100 focus:ring-blue-200' :
                        order.status === 'ready_for_pickup' ? 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100 focus:ring-green-200' :
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 focus:ring-emerald-200' :
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

  const renderSettings = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Tax Settings */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Settings className="h-5 w-5 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Tax Settings</h2>
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
      <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Shipping Settings</h2>
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
            className="mobile-menu p-2 text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{getActiveSectionTitle()}</h2>
        </div>
        <Button
          onClick={() => setIsAuthenticated(false)}
          className="px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700"
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
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-[#74CADC] text-[#0A5565] font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
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
          
          <nav className="space-y-3 flex-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-[#74CADC] text-[#0A5565] font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="border-t border-gray-200 pt-4">
            <Button
              onClick={() => setIsAuthenticated(false)}
              className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 px-6 py-3 transition-all duration-200"
            >
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 lg:ml-72">
        <div className="px-4 md:px-8">
          <div className="py-4 md:py-12">
            {/* Content */}
            {activeSection === "products" && renderProducts()}
            {activeSection === "orders" && renderOrders()}
            {activeSection === "settings" && (
              <div className="space-y-6 md:space-y-8">
                {renderSettings()}
                
                {/* Save Button */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-200 ease-in-out">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Edit Product</h2>
              <Button
                onClick={() => setShowEditModal(false)}
                className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Basic Info */}
              <div className="space-y-8">
                {/* Product Image */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-4">
                    Product Image
                  </label>
                  <div className="flex items-center gap-6">
                    {editProduct.image && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                        <Image
                          src={editProduct.image}
                          alt="Product preview"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 px-6 py-3 transition-all duration-200"
                      >
                        <Upload className="h-4 w-4 mr-3" />
                        <span className="font-medium">{editProduct.image ? "Change Image" : "Upload Image"}</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-3">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                    className="w-full px-4 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200"
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
                    className="w-full px-4 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200"
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
                    rows={4}
                    className="w-full px-4 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200 resize-none"
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
              <div className="space-y-8">
                {/* Sizes */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-4">
                    Available Sizes
                  </label>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                        <button
                          key={size}
                          onClick={() => editProduct.sizes.includes(size) ? removeEditSize(size) : addEditSize(size)}
                          className={`px-4 py-3 text-base font-medium rounded-lg border transition-all duration-200 ${
                            editProduct.sizes.includes(size)
                              ? "bg-[#74CADC] text-[#0A5565] border-[#74CADC]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
                    <div className="flex flex-wrap gap-3">
                      {["White", "Black", "Navy", "Gray", "Red", "Blue", "Green"].map((color) => (
                        <button
                          key={color}
                          onClick={() => editProduct.colors.includes(color) ? removeEditColor(color) : addEditColor(color)}
                          className={`px-4 py-3 text-base font-medium rounded-lg border transition-all duration-200 ${
                            editProduct.colors.includes(color)
                              ? "bg-[#74CADC] text-[#0A5565] border-[#74CADC]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleUpdateProduct}
                    className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-8 py-4 text-lg font-medium transition-all duration-200"
                  >
                    Update Product
                  </Button>
                  <Button
                    onClick={() => setShowEditModal(false)}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 px-8 py-4 text-lg font-medium transition-all duration-200"
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
    </div>
  );
}
