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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Combobox,
  type ComboboxOption,
} from "../../sca-dashboard/components/ui/combobox";
import Image from "next/image";
import { ProductFormModal } from "./components/product-form-modal";
import type { Product } from "~/lib/types";
import { getProductPrice } from "~/lib/types";

export default function ProductsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

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
        setProducts(
          productsList.map((p: any) => ({
            id: p.id || p._id?.toString() || "",
            name: p.name,
            description: p.description || "",
            price: p.price,
            regularPrice: p.regularPrice,
            salePrice: p.salePrice,
            image: p.image,
            imageId: p.imageId,
            images: p.images || [],
            category: p.category || "Apparel",
            inStock: p.inStock !== false,
            sizes: p.sizes || [],
            colors: p.colors || [],
            requiresBabyClothes: p.requiresBabyClothes || false,
            babyClothesDeadlineDays: p.babyClothesDeadlineDays,
          })),
        );
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
      window.location.href = "/admin/login";
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
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        !categoryFilter || product.category === categoryFilter;

      // Stock filter
      const matchesStock =
        !stockFilter ||
        (stockFilter === "inStock" && product.inStock !== false) ||
        (stockFilter === "outOfStock" && product.inStock === false);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, stockFilter]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
                  <p className="text-sm font-medium text-neutral-500">
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
                    className="bg-neutral-900 text-white hover:bg-neutral-800"
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
                    selected={
                      categoryFilter
                        ? { label: categoryFilter, value: categoryFilter }
                        : null
                    }
                    setSelected={(option: ComboboxOption | null) =>
                      setCategoryFilter(option?.value || "")
                    }
                    placeholder="Category"
                    icon={Package}
                    buttonProps={{
                      className:
                        "w-full md:w-fit bg-white hover:bg-neutral-50 border-neutral-200",
                    }}
                  />
                  <Combobox
                    options={[
                      { label: "All Stock Status", value: "" },
                      { label: "In Stock", value: "inStock" },
                      { label: "Out of Stock", value: "outOfStock" },
                    ]}
                    selected={
                      stockFilter
                        ? {
                            label:
                              stockFilter === "inStock"
                                ? "In Stock"
                                : "Out of Stock",
                            value: stockFilter,
                          }
                        : null
                    }
                    setSelected={(option: ComboboxOption | null) =>
                      setStockFilter(option?.value || "")
                    }
                    placeholder="Stock"
                    icon={ListFilter}
                    buttonProps={{
                      className:
                        "w-full md:w-fit bg-white hover:bg-neutral-50 border-neutral-200",
                    }}
                  />
                </div>
                <div className="relative w-full md:ml-auto md:w-fit">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </div>
                  <Input
                    className="peer w-full rounded-xl border border-neutral-200 bg-white px-9 py-2.5 text-sm text-black outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 md:w-[18rem]"
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
                  <Package className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                  <p className="text-sm text-neutral-500">No products found</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedProducts.map((product, index) => (
                      <div
                        key={product.id || `product-${index}`}
                        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 ease-out hover:border-neutral-300"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}
                      >
                        {/* Image Section - Apple-style clean presentation */}
                        <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-neutral-50">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
                              <Package className="h-12 w-12 text-neutral-300" />
                            </div>
                          )}
                          {/* Stock Status Indicator - Minimal */}
                          {product.inStock === false && (
                            <div className="absolute right-3 top-3">
                              <div className="h-2 w-2 rounded-full bg-red-500" />
                            </div>
                          )}
                        </div>

                        {/* Content Section - Clean typography hierarchy */}
                        <div className="flex min-h-0 flex-1 flex-col p-5">
                          <div className="flex min-h-0 flex-1 flex-col space-y-3">
                            {/* Category - Subtle */}
                            {product.category && (
                              <div className="flex-shrink-0 text-xs font-medium uppercase tracking-wider text-neutral-400">
                                {product.category}
                              </div>
                            )}

                            {/* Product Name - Prominent, full text */}
                            <h3 className="flex-shrink-0 text-base font-semibold leading-tight tracking-tight text-neutral-900">
                              {product.name}
                            </h3>

                            {/* Description - Limited to 3 lines */}
                            {product.description && (
                              <p className="line-clamp-3 flex-shrink-0 text-sm leading-relaxed text-neutral-500">
                                {product.description}
                              </p>
                            )}

                            {/* Additional Product Info */}
                            <div className="flex-shrink-0 space-y-1 text-xs text-neutral-400">
                              {product.requiresBabyClothes && (
                                <div>
                                  <span className="font-medium text-neutral-500">
                                    Baby Clothes Required:{" "}
                                  </span>
                                  <span>Yes</span>
                                  {product.babyClothesDeadlineDays && (
                                    <span>
                                      {" "}
                                      ({product.babyClothesDeadlineDays} days)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Spacer to push price to bottom */}
                            <div className="min-h-[1rem] flex-1"></div>

                            {/* Price - Clean, prominent, always at same position */}
                            <div className="flex-shrink-0 border-t border-neutral-100 pt-2">
                              <div className="text-xl font-semibold tracking-tight text-neutral-900">
                                {formatCurrency(getProductPrice(product))}
                              </div>
                              <div className="mt-1 text-xs text-neutral-400">
                                {product.inStock !== false
                                  ? "In Stock"
                                  : "Out of Stock"}
                              </div>
                            </div>
                          </div>

                          {/* Edit Button - Always at bottom */}
                          <button
                            className="mt-4 flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-100 group-hover:bg-neutral-100"
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

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-500">
                          Showing {startIndex + 1}-
                          {Math.min(endIndex, filteredProducts.length)} of{" "}
                          {filteredProducts.length} products
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          text="Previous"
                          icon={<ChevronLeft className="h-4 w-4" />}
                          className="hover:bg-neutral-50"
                        />
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                              // Show first page, last page, current page, and pages around current
                              if (page === 1 || page === totalPages)
                                return true;
                              if (Math.abs(page - currentPage) <= 1)
                                return true;
                              return false;
                            })
                            .map((page, index, array) => {
                              // Add ellipsis if there's a gap
                              const showEllipsisBefore =
                                index > 0 && array[index - 1] !== page - 1;
                              return (
                                <div
                                  key={page}
                                  className="flex items-center gap-1"
                                >
                                  {showEllipsisBefore && (
                                    <span className="px-2 text-sm text-neutral-400">
                                      ...
                                    </span>
                                  )}
                                  <Button
                                    variant={
                                      currentPage === page
                                        ? "primary"
                                        : "outline"
                                    }
                                    onClick={() => setCurrentPage(page)}
                                    text={page.toString()}
                                    className={
                                      currentPage === page
                                        ? "bg-neutral-900 text-white hover:bg-neutral-800"
                                        : "hover:bg-neutral-50"
                                    }
                                  />
                                </div>
                              );
                            })}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1),
                            )
                          }
                          disabled={currentPage === totalPages}
                          text="Next"
                          right={<ChevronRight className="h-4 w-4" />}
                          className="hover:bg-neutral-50"
                        />
                      </div>
                    </div>
                  )}
                </>
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
