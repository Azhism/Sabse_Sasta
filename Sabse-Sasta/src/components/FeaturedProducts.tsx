import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Package2, TrendingDown, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id?: string;
  product_id?: string | number;
  name?: string;
  product_name?: string;
  base_product_name?: string;
  category?: string;
  brand?: string;
  size?: string;
  package_size?: string;
  price?: number;
  vendor?: string;
}

export const FeaturedProducts = () => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const { data: products, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const data = await productsAPI.getFeatured();
      // Transform backend data to frontend format - using actual DB field names
      return (data || []).map((item: any) => {
        const priceCandidate =
          item.price ??
          item.listing_price ??
          item.amount ??
          item.unit_price ??
          item.mrp ??
          item.sale_price ??
          item.discount_price ??
          null;

        return {
        id: item.product_id?.toString() || item.id,
        product_id: item.product_id,
        name: item.display_name || item.product_name || item.base_product_name || item.name,
        product_name: item.product_name || item.display_name,
        base_product_name: item.base_product_name,
        display_name: item.display_name,
        category: item.category_name || item.category,
        category_name: item.category_name,
        brand: item.brand,
        variant_name: item.variant_name || item.variant_info,
        variant_info: item.variant_info,
        size: item.package_size || item.variant_info || item.size,
        package_size: item.package_size || item.variant_info,
        price: priceCandidate !== null ? parseFloat(priceCandidate) : null,
        vendor: item.vendor_name || item.vendor,
        vendor_name: item.vendor_name,
        };
      }) as Product[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground mt-2">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  const handleAddToCart = (product: Product) => {
    const productId = product.product_id?.toString() || product.id || '';
    const productName = product.name || product.product_name || product.base_product_name || 'Unknown Product';
    
    addToCart({
      id: productId,
      productId: productId,
      name: productName,
      category: product.category || '',
      brand: product.brand || '',
      size: product.package_size || product.size || '',
      price: product.price || 0,
      vendor: product.vendor || '',
    });
    toast({
      title: "Added to cart",
      description: `${productName} ${product.vendor ? `(${product.vendor})` : ''} added to your cart`,
    });
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full mb-4">
            <TrendingDown className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Best Deals</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Featured Products</h2>
          <p className="text-muted-foreground mt-2">
            Compare prices across multiple vendors
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-hero rounded-lg mb-4">
                      <Package2 className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg text-center line-clamp-2">
                      {product.name || product.product_name || product.base_product_name || 'Unknown Product'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      {product.category && (
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      )}
                      {(product.package_size || product.size) && (
                      <Badge variant="secondary" className="text-xs">
                          {product.package_size || product.size}
                      </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      {product.brand && (
                      <p className="text-sm text-muted-foreground">
                        Brand: {product.brand}
                      </p>
                      )}
                      {product.vendor && (
                      <p className="text-sm text-muted-foreground">
                        Vendor: {product.vendor}
                      </p>
                      )}
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-2xl font-bold text-primary">
                        ₨ {product.price ? product.price.toFixed(2) : 'N/A'}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};