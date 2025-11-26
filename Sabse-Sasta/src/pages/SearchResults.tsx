import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "@/services/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Product {
  id?: string;
  product_id?: string | number;
  name?: string;
  product_name?: string;
  base_product_name?: string;
  category?: string;
  category_id?: string | number;
  subcategory?: string | null;
  brand?: string;
  variant?: string | null;
  variant_name?: string;
  size?: string;
  package_size?: string;
  price?: number;
  vendor?: string;
}

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const navigate = useNavigate();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", searchParams.get("q")],
    queryFn: async () => {
      const query = searchParams.get("q");
      if (!query) return [];

      const data = await productsAPI.search(query);
      // Transform backend data to frontend format - using actual DB field names
      return (data || []).map((item: any) => ({
        id: item.product_id?.toString() || item.id,
        product_id: item.product_id,
        name: item.display_name || item.product_name || item.base_product_name || item.name,
        product_name: item.product_name || item.display_name,
        base_product_name: item.base_product_name,
        display_name: item.display_name,
        category: item.category_name || item.category || item.category_id,
        category_name: item.category_name,
        brand: item.brand,
        variant_name: item.variant_name || item.variant_info,
        variant_info: item.variant_info,
        size: item.package_size || item.variant_info || item.size,
        package_size: item.package_size || item.variant_info,
        price: item.price ? parseFloat(item.price) : null, // Ensure price is a number
        vendor: item.vendor_name || item.vendor,
        vendor_name: item.vendor_name,
      })) as Product[];
    },
    enabled: !!searchParams.get("q"),
  });

  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  const groupedProducts = products?.reduce((acc, product) => {
    const productName = product.name || product.product_name || product.base_product_name || 'Unknown';
    const brand = product.brand || 'Unknown';
    const size = product.package_size || product.size || 'Unknown';
    const key = `${productName}-${brand}-${size}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 p-2 bg-card rounded-lg shadow-card border border-border">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for products..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
              />
            </div>
            <Button type="submit" variant="hero">
              Search
            </Button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Search Results for "{searchParams.get("q")}"
            </h1>
            <p className="text-muted-foreground">
              {isLoading
                ? "Searching..."
                : `Found ${products?.length || 0} products`}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-12">
              <Package2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No products found</p>
              <p className="text-muted-foreground">
                Try searching with different keywords
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedProducts || {}).map(([key, items]) => {
                const product = items[0];
                const productName = product.name || product.product_name || product.base_product_name || 'Unknown Product';
                const productPrices = items.map((p) => p.price || 0).filter((p) => p > 0);
                const lowestPrice = productPrices.length > 0 ? Math.min(...productPrices) : 0;
                const highestPrice = productPrices.length > 0 ? Math.max(...productPrices) : 0;
                const savings = highestPrice - lowestPrice;
                const vendorCount = items.length;
                const productId = product.product_id?.toString() || product.id || "";

                const handleNavigate = () => {
                  if (!productId) return;
                  navigate(`/products/${productId}/vendors`, {
                    state: {
                      productName,
                      size: product.package_size || product.size || "",
                      brand: product.brand || "",
                      category: product.category || "",
                    },
                  });
                };

                return (
                  <Card key={key} className="overflow-hidden">
                    <CardHeader className="bg-muted/30 cursor-pointer" onClick={handleNavigate}>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="flex items-center justify-center w-16 h-16 bg-gradient-hero rounded-lg flex-shrink-0">
                            <Package2 className="h-8 w-8 text-primary-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-xl mb-2">
                              {productName}
                            </CardTitle>
                            <div className="flex gap-2 flex-wrap">
                              {(product.package_size || product.size) && (
                                <Badge variant="secondary">
                                  {product.package_size || product.size}
                                </Badge>
                              )}
                              {product.category && (
                                <Badge variant="outline" className="capitalize">
                                  {product.category}
                                </Badge>
                              )}
                              {product.brand && (
                                <Badge variant="secondary" className="bg-accent/40 text-accent-foreground">
                                  {product.brand}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Vendors</p>
                          <p className="text-xl font-bold">{vendorCount}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Best price</p>
                        <p className="text-3xl font-bold text-primary">
                          ₨ {lowestPrice > 0 ? lowestPrice.toFixed(2) : "N/A"}
                        </p>
                        {savings > 0 && (
                          <p className="text-sm text-secondary">
                            Save up to ₨ {savings.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={handleNavigate}
                        variant="hero"
                        className="w-full md:w-auto"
                        disabled={!productId}
                      >
                        View {vendorCount} offer{vendorCount !== 1 ? "s" : ""}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;