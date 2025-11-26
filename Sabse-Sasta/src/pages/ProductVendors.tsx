import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "@/services/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package2, ArrowLeft, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface LocationState {
  productName?: string;
  size?: string;
  brand?: string;
  category?: string;
}

const ProductVendors = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["product-vendors", id],
    queryFn: async () => {
      if (!id) throw new Error("Invalid product id");
      return productsAPI.getVendorsByProduct(id);
    },
    enabled: Boolean(id),
  });

  const productInfo = useMemo(() => {
    if (data?.product) return data.product;
    return (location.state as LocationState) || null;
  }, [data?.product, location.state]);

  const vendors = data?.vendors || [];

  const handleAddToCart = (vendor: (typeof vendors)[number]) => {
    if (!productInfo || !vendor.price) return;
    const productId =
      productInfo.product_id?.toString() ||
      productInfo.id?.toString() ||
      id ||
      "";
    const productName =
      productInfo.display_name ||
      productInfo.product_name ||
      productInfo.base_product_name ||
      productInfo.name ||
      "Unknown Product";

    addToCart({
      id: `${productId}-${vendor.vendorId || vendor.vendorName}`,
      productId,
      name: productName,
      category: productInfo.category || productInfo.category_name || "",
      brand: productInfo.brand || "",
      size: productInfo.package_size || productInfo.variant_info || "",
      price: vendor.price || 0,
      vendor: vendor.vendorName || "Unknown Vendor",
    });

    toast({
      title: "Added to cart",
      description: `${productName} • ${vendor.vendorName}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </Button>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <Package2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-semibold mb-2">Unable to load vendors</p>
            <p className="text-muted-foreground">
              {(error as Error)?.message || "Please try again later"}
            </p>
          </div>
        ) : (
          <>
            <section className="mb-8">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center">
                  <Package2 className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold">
                    {productInfo?.display_name ||
                      productInfo?.product_name ||
                      productInfo?.base_product_name ||
                      productInfo?.name ||
                      "Product"}
                  </h1>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {(productInfo?.package_size ||
                      productInfo?.variant_info ||
                      (location.state as LocationState)?.size) && (
                      <Badge variant="secondary">
                        {productInfo?.package_size ||
                          productInfo?.variant_info ||
                          (location.state as LocationState)?.size}
                      </Badge>
                    )}
                    {(productInfo?.category ||
                      productInfo?.category_name ||
                      (location.state as LocationState)?.category) && (
                      <Badge variant="outline" className="capitalize">
                        {productInfo?.category ||
                          productInfo?.category_name ||
                          (location.state as LocationState)?.category}
                      </Badge>
                    )}
                    {(productInfo?.brand ||
                      (location.state as LocationState)?.brand) && (
                      <Badge variant="secondary" className="bg-accent/40">
                        {productInfo?.brand ||
                          (location.state as LocationState)?.brand}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              {vendors.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">
                      No vendors currently listed for this product.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                vendors.map((vendor, index) => (
                  <Card
                    key={`${vendor.vendorId}-${index}`}
                    className={index === 0 ? "border-primary shadow-lg" : ""}
                  >
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>{vendor.vendorName || "Unknown Vendor"}</CardTitle>
                        {vendor.isAvailable === false && (
                          <p className="text-sm text-muted-foreground">
                            Currently unavailable
                          </p>
                        )}
                      </div>
                      {index === 0 && vendor.price && (
                        <Badge className="bg-primary text-primary-foreground">
                          Best Price
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="text-3xl font-bold text-primary">
                          ₨ {vendor.price?.toFixed(2)}
                        </p>
                        {vendor.stockQuantity !== null &&
                          vendor.stockQuantity !== undefined && (
                            <p className="text-sm text-muted-foreground">
                              Stock: {vendor.stockQuantity}
                            </p>
                          )}
                      </div>
                      <Button
                        variant="hero"
                        className="w-full md:w-auto"
                        onClick={() => handleAddToCart(vendor)}
                        disabled={!vendor.price}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductVendors;


