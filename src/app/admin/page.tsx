"use client";

import { useState, useEffect, useRef } from "react";
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Settings, Package, Save, Edit, Trash2, Upload, X } from "lucide-react";
import { useProducts } from "~/lib/products-context";
import type { Product } from "~/lib/types";

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
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeSection, setActiveSection] = useState("products");
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
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
    taxRate: 8.0,
    shippingEnabled: true,
    pickupOnly: false,
    freeShippingThreshold: 50,
    shippingCost: 9.99,
    pickupInstructions: "Please call (555) 123-4567 to schedule pickup. Available Monday-Friday 9AM-5PM."
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword("");
  };

  const handleSaveSettings = () => {
    // TODO: Save to database/API
    console.log("Saving settings:", settings);
    alert("Settings saved successfully!");
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
      alert("Please fill in all required fields");
      return;
    }
    
    addProduct({
      ...newProduct,
      image: newProduct.image || "/placeholder-product.jpg",
      category: "Apparel"
    });
    setNewProduct({ name: "", price: 0, description: "", inStock: true, sizes: [], colors: [], image: "" });
    alert("Product added successfully!");
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
      alert("Please fill in all required fields");
      return;
    }
    
    if (editingProduct) {
      updateProduct(editingProduct, editProduct);
    }
    setEditingProduct(null);
    setEditProduct({ name: "", price: 0, description: "", inStock: true, sizes: [], colors: [], image: "" });
    setShowEditModal(false);
    alert("Product updated successfully!");
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
      alert("Product deleted successfully!");
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full p-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Access</h1>
            <p className="text-lg text-gray-500">Enter your password to access the admin panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-900 mb-3">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                placeholder="Enter your password"
                required
              />
              {passwordError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{passwordError}</p>
                </div>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 text-lg font-medium rounded-lg transition-colors"
            >
              Access Admin Panel
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Secure admin access for authorized personnel only
            </p>
          </div>
        </div>
      </div>
    );
  }


  const renderProducts = () => (
    <div className="space-y-12">
      {/* Add New Product Form */}
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Add New Product</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
                    <img
                      src={newProduct.image}
                      alt="Product preview"
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
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Current Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200">
              <div className="aspect-square w-full mb-6 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h4>
                  <p className="text-gray-600 line-clamp-2 mb-3">{product.description}</p>
                  <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                </div>
                
                <div className="space-y-2">
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-sm text-gray-500 font-medium">Sizes:</span>
                      {product.sizes.map((size) => (
                        <span key={size} className="px-2 py-1 text-xs font-medium bg-[#74CADC] text-[#0A5565] rounded-md">
                          {size}
                        </span>
                      ))}
                    </div>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-sm text-gray-500 font-medium">Colors:</span>
                      {product.colors.map((color) => (
                        <span key={color} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
                          {color}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    product.inStock 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditProduct(product)}
                      className="p-3 bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] border border-[#74CADC] hover:border-[#74CADC]/90 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 transition-all duration-200"
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

  const renderSettings = () => (
    <div className="space-y-12">
      {/* Tax Settings */}
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Tax Settings</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-base font-medium text-gray-900 mb-3">
              Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.taxRate}
              onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
              className="w-full px-4 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Shipping Settings */}
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Shipping Settings</h2>
        </div>
        
        <div className="space-y-8">
          {/* Pickup Only Toggle */}
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Pickup Only Mode</h3>
              <p className="text-base text-gray-600 mt-1">Disable shipping, only allow pickup</p>
            </div>
            <button
              onClick={() => setSettings({...settings, pickupOnly: !settings.pickupOnly})}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
                settings.pickupOnly ? 'bg-[#74CADC]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                  settings.pickupOnly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {!settings.pickupOnly && (
            <>
              {/* Shipping Enabled Toggle */}
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Enable Shipping</h3>
                  <p className="text-base text-gray-600 mt-1">Allow customers to ship orders</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, shippingEnabled: !settings.shippingEnabled})}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
                    settings.shippingEnabled ? 'bg-[#74CADC]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                      settings.shippingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Shipping Cost */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-3">
                  Shipping Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.shippingCost}
                  onChange={(e) => setSettings({...settings, shippingCost: parseFloat(e.target.value)})}
                  className="w-full px-4 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
                />
              </div>

              {/* Free Shipping Threshold */}
              <div>
                <label className="block text-base font-medium text-gray-900 mb-3">
                  Free Shipping Threshold ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({...settings, freeShippingThreshold: parseFloat(e.target.value)})}
                  className="w-full px-4 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
                />
              </div>
            </>
          )}

          {/* Pickup Instructions */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-3">
              Pickup Instructions
            </label>
            <textarea
              value={settings.pickupInstructions}
              onChange={(e) => setSettings({...settings, pickupInstructions: e.target.value})}
              rows={4}
              className="w-full px-4 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200 resize-none"
              placeholder="Instructions for customers on how to pickup their orders..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 fixed inset-0 z-50">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 h-full flex flex-col">
          <div className="p-8 flex-1">
            {/* Logo and Header */}
            <div className="mb-12">
              <img 
                src="/Stitch Please Ish Black.png" 
                alt="Stitch Please Logo" 
                className="h-24 w-auto mx-auto mb-6"
              />
              <h1 className="text-2xl font-bold text-gray-900 text-center">Admin Panel</h1>
            </div>
            
            <nav className="space-y-3">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-gray-50 text-gray-900 border border-gray-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Logout Button at Bottom */}
          <div className="p-8 border-t border-gray-100">
            <Button
              onClick={handleLogout}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center gap-3 py-3 border border-gray-200 hover:border-gray-300 transition-all duration-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <Container>
            <div className="py-12">
              {/* Content */}
              {activeSection === "products" && renderProducts()}
              {activeSection === "settings" && (
                <div className="space-y-8">
                  {renderSettings()}
                  
                  {/* Save Button */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Save Settings</h3>
                        <p className="text-sm text-gray-500">Save all your configuration changes</p>
                      </div>
                      <Button
                        onClick={handleSaveSettings}
                        className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-8 py-4 text-lg font-medium transition-all duration-200"
                      >
                        <Save className="h-5 w-5 mr-3" />
                        <span className="font-medium">Save All Settings</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Container>
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
                        <img
                          src={editProduct.image}
                          alt="Product preview"
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
    </div>
  );
}
