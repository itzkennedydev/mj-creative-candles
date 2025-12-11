"use client";

import { MainNav } from "../../sca-dashboard/components/layout/main-nav";
import { AppSidebarNav } from "../../sca-dashboard/components/layout/sidebar/app-sidebar-nav";
import { HelpButton } from "../../sca-dashboard/components/layout/sidebar/help-button";
import { SettingsButton } from "../../sca-dashboard/components/layout/sidebar/settings-button";
import { PageContent } from "../../sca-dashboard/components/layout/page-content";
import { PageWidthWrapper } from "../../sca-dashboard/components/layout/page-width-wrapper";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "../../sca-dashboard/components/ui/button";
import { Input } from "../../sca-dashboard/components/ui/input";
import { 
  RefreshCw,
  Plus,
  Package,
  DollarSign,
  Edit,
  ListFilter,
  Search,
} from "lucide-react";
import { Combobox, type ComboboxOption } from "../../sca-dashboard/components/ui/combobox";
import Image from "next/image";
import { ProductFormModal } from "./components/product-form-modal";
import type { Product } from "~/lib/types";


export default function ProductsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("adminToken");
      if (!token) return;
      
      const response = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const productsList = data.products || data || [];
        // Map products to ensure they have the correct format
        setProducts(productsList.map((p: any) => ({
          id: p.id || p._id?.toString() || '',
          name: p.name,
          description: p.description || '',
          price: p.price,
          image: p.image,
          imageId: p.imageId,
          images: p.images || [],
          category: p.category || 'Apparel',
          shopType: p.shopType,
          school: p.school,
          inStock: p.inStock !== false,
          sizes: p.sizes || [],
          colors: p.colors || [],
          requiresBabyClothes: p.requiresBabyClothes || false,
          babyClothesDeadlineDays: p.babyClothesDeadlineDays
        })));
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    setIsAuthenticated(!!token);
    void fetchProducts();
  }, [fetchProducts]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }, []);

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = products
      .map((p) => p.category)
      .filter((cat): cat is string => Boolean(cat));
    return Array.from(new Set(cats)).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      
      // Stock filter
      const matchesStock = !stockFilter || 
        (stockFilter === "inStock" && product.inStock !== false) ||
        (stockFilter === "outOfStock" && product.inStock === false);
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-500">Please login to access products</p>
      </div>
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
      <PageContent title="Products">
        <div className="pb-10">
          <PageWidthWrapper>
            <div className="space-y-6">
              {/* Header - Apple-style clean */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 font-medium">
                    Manage your product catalog
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={fetchProducts}
                    variant="outline"
                    text="Refresh"
                    icon={<RefreshCw className="h-4 w-4" />}
                    className="hover:bg-neutral-50"
                  />
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      setSelectedProduct(null);
                      setIsModalOpen(true);
                    }}
                    text="Add Product"
                    icon={<Plus className="h-4 w-4" />}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white"
                  />
                </div>
              </div>

        {/* Filters and Search - Apple-style clean */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
            <Combobox
              options={[
                { label: "All Categories", value: "" },
                ...categories.map((cat) => ({ label: cat, value: cat })),
              ]}
              selected={categoryFilter ? { label: categoryFilter, value: categoryFilter } : null}
              setSelected={(option: ComboboxOption | null) => setCategoryFilter(option?.value || "")}
              placeholder="Category"
              icon={Package}
              buttonProps={{ className: "w-full md:w-fit bg-white hover:bg-neutral-50 border-neutral-200" }}
            />
            <Combobox
              options={[
                { label: "All Stock Status", value: "" },
                { label: "In Stock", value: "inStock" },
                { label: "Out of Stock", value: "outOfStock" },
              ]}
              selected={stockFilter ? { 
                label: stockFilter === "inStock" ? "In Stock" : "Out of Stock", 
                value: stockFilter 
              } : null}
              setSelected={(option: ComboboxOption | null) => setStockFilter(option?.value || "")}
              placeholder="Stock"
              icon={ListFilter}
              buttonProps={{ className: "w-full md:w-fit bg-white hover:bg-neutral-50 border-neutral-200" }}
            />
          </div>
          <div className="relative w-full md:w-fit md:ml-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10">
              <Search className="h-4 w-4 text-neutral-400" />
            </div>
            <Input
              className="peer w-full rounded-xl border border-neutral-200 bg-white px-9 py-2.5 text-sm text-black outline-none placeholder:text-neutral-400 transition-all focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 md:w-[18rem]"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoCapitalize="none"
              type="text"
            />
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center gap-2 text-neutral-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading products...</span>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id || `product-${index}`}
                className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-300 ease-out cursor-pointer hover:border-neutral-300 flex flex-col h-full"
                onClick={() => {
                  setSelectedProduct(product);
                  setIsModalOpen(true);
                }}
              >
                {/* Image Section - Apple-style clean presentation */}
                <div className="relative aspect-square w-full bg-neutral-50 overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
                      <Package className="h-12 w-12 text-neutral-300" />
                    </div>
                  )}
                  {/* Stock Status Indicator - Minimal */}
                  {product.inStock === false && (
                    <div className="absolute top-3 right-3">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                    </div>
                  )}
                </div>

                {/* Content Section - Clean typography hierarchy */}
                <div className="p-5 flex flex-col flex-1 min-h-0">
                  <div className="space-y-3 flex-1 min-h-0 flex flex-col">
                    {/* Category - Subtle */}
                    {product.category && (
                      <div className="text-xs text-neutral-400 uppercase tracking-wider font-medium flex-shrink-0">
                        {product.category}
                      </div>
                    )}

                    {/* Product Name - Prominent, full text */}
                    <h3 className="text-base font-semibold text-neutral-900 leading-tight tracking-tight flex-shrink-0">
                      {product.name}
                    </h3>
                    
                    {/* Description - Limited to 3 lines */}
                    {product.description && (
                      <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3 flex-shrink-0">
                        {product.description}
                      </p>
                    )}

                    {/* Product Details - Show all sizes and colors */}
                    {(product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0) ? (
                      <div className="space-y-1.5 flex-shrink-0">
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="text-xs text-neutral-400">
                            <span className="font-medium text-neutral-500">Sizes: </span>
                            <span>{product.sizes.join(", ")}</span>
                          </div>
                        )}
                        {product.colors && product.colors.length > 0 && (
                          <div className="text-xs text-neutral-400">
                            <span className="font-medium text-neutral-500">Colors: </span>
                            <span>{product.colors.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Additional Product Info */}
                    <div className="space-y-1 text-xs text-neutral-400 flex-shrink-0">
                      {product.shopType && (
                        <div>
                          <span className="font-medium text-neutral-500">Shop Type: </span>
                          <span>{product.shopType}</span>
                        </div>
                      )}
                      {product.school && (
                        <div>
                          <span className="font-medium text-neutral-500">School: </span>
                          <span>{product.school}</span>
                        </div>
                      )}
                      {product.requiresBabyClothes && (
                        <div>
                          <span className="font-medium text-neutral-500">Baby Clothes Required: </span>
                          <span>Yes</span>
                          {product.babyClothesDeadlineDays && (
                            <span> ({product.babyClothesDeadlineDays} days)</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Spacer to push price to bottom */}
                    <div className="flex-1 min-h-[1rem]"></div>

                    {/* Price - Clean, prominent, always at same position */}
                    <div className="pt-2 border-t border-neutral-100 flex-shrink-0">
                      <div className="text-xl font-semibold text-neutral-900 tracking-tight">
                        {formatCurrency(product.price)}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {product.inStock !== false ? "In Stock" : "Out of Stock"}
                      </div>
                    </div>
                  </div>

                  {/* Edit Button - Always at bottom */}
                  <button
                    className="w-full mt-4 py-2.5 px-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-sm font-medium text-neutral-700 transition-colors duration-200 flex items-center justify-center gap-2 group-hover:bg-neutral-100 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
            </div>
          </PageWidthWrapper>
        </div>
      </PageContent>
      
      <ProductFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={selectedProduct}
        onSuccess={() => {
          fetchProducts();
          setSelectedProduct(null);
        }}
      />
    </MainNav>
  );
}

