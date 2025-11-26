import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shoppingListsAPI, productsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calculator, ShoppingCart, Loader2, Trash2, Plus, Minus } from "lucide-react";

interface ListItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    category: string;
    brand: string;
  };
}

interface VendorCost {
  vendor: string;
  totalCost: number;
  availableItems: number;
  totalItems: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  unavailableItems: string[];
}

interface MegaOption {
  totalCost: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    vendor: string;
    price: number;
    total: number;
  }>;
}

interface Product {
  id?: string;
  product_id?: string | number;
  name?: string;
  product_name?: string;
  base_product_name?: string;
  display_name?: string;
  category?: string;
  category_id?: string | number;
  category_name?: string;
  brand?: string;
  package_size?: string;
  variant_name?: string;
  variant_info?: string;
  price?: number;
  vendor_name?: string;
}

const ViewShoppingList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addMultipleToCart } = useCart();
  
  const [listName, setListName] = useState("");
  const [items, setItems] = useState<ListItem[]>([]);
  const [vendorCosts, setVendorCosts] = useState<VendorCost[]>([]);
  const [megaOption, setMegaOption] = useState<MegaOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    fetchList();
    fetchProducts();
  }, [id]);
  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      const transformedProducts =
        data?.map((item: any) => ({
          id: item.product_id?.toString() || item.id,
          product_id: item.product_id,
          name: item.display_name || item.product_name || item.base_product_name || item.name,
          product_name: item.product_name || item.display_name,
          base_product_name: item.base_product_name,
          display_name: item.display_name,
          category: item.category_name || item.category || item.category_id,
          category_name: item.category_name,
          brand: item.brand,
          package_size: item.package_size || item.variant_info,
          variant_name: item.variant_name || item.variant_info,
          variant_info: item.variant_info,
          price: item.price,
          vendor_name: item.vendor_name || item.vendor,
        })) || [];
      setProducts(transformedProducts);
    } catch (error: any) {
      console.error("Error fetching products:", error);
    }
  };


  const fetchList = async () => {
    if (!id || id === 'undefined' || id === 'null') {
      toast({
        title: "Error",
        description: "Invalid shopping list ID",
        variant: "destructive",
      });
      navigate("/shopping-lists");
      return;
    }
    
    try {
      const list = await shoppingListsAPI.getById(id);
      setListName(list.list_name || list.name || list.listName || 'Shopping List');
      
      // The backend should return items with product details
      if (list.items) {
        console.log('List items from backend:', list.items);
        setItems(list.items.map((item: any, index: number) => {
          const product = item.product || {};
          // Get the item ID - Prisma might return item_id, id, or itemId
          // Check all possible field names
          const itemId = item.item_id?.toString() || 
                        item.id?.toString() || 
                        item.itemId?.toString() ||
                        (item as any).item_id?.toString();
          
          if (!itemId || itemId === 'undefined' || itemId === 'null') {
            console.error('Item missing valid ID:', item, 'Index:', index);
            // Don't add items without valid IDs
            return null;
          }
          
          return {
            id: itemId,
            product_id: item.product_id || item.productId,
            quantity: item.quantity_value || item.quantity || 1,
            products: {
              id: product.product_id?.toString() || product.id,
              product_id: product.product_id,
              name: product.product_name || product.base_product_name || product.name || '',
              category: product.category || product.category_id || '',
              brand: product.brand || '',
            },
          };
        }).filter((item: any) => item !== null)); // Filter out null items
      }
    } catch (error: any) {
      console.error("Error fetching list:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load shopping list",
        variant: "destructive",
      });
      navigate("/shopping-lists");
    } finally {
      setLoading(false);
    }
  };

  const calculateCosts = async () => {
    if (!id || id === 'undefined' || id === 'null') {
      toast({
        title: "Error",
        description: "Invalid shopping list ID",
        variant: "destructive",
      });
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Cannot calculate costs for an empty list",
        variant: "destructive",
      });
      return;
    }
    
    setCalculating(true);
    try {
      // Call backend API for price calculation
      const result = await shoppingListsAPI.calculateCosts(id);
      
      console.log("Calculate costs result:", result);
      
      if (result && result.vendorOptions && result.megaOption) {
        setVendorCosts(result.vendorOptions || []);
        setMegaOption(result.megaOption || null);
        setCalculated(true);
        
        if (result.vendorOptions.length === 0 && (!result.megaOption || result.megaOption.items.length === 0)) {
          toast({
            title: "No results",
            description: "No vendors found for the products in your list",
            variant: "destructive",
          });
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Error calculating costs:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to calculate vendor costs",
        variant: "destructive",
      });
      setCalculated(false);
    } finally {
      setCalculating(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!id || !itemId || itemId === 'undefined' || itemId.startsWith('temp-')) {
      toast({
        title: "Error",
        description: "Invalid item ID. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }
    
    if (newQuantity <= 0) {
      // If quantity is 0 or less, remove the item
      removeItem(itemId);
      return;
    }
    
    try {
      await shoppingListsAPI.updateItem(id, itemId, newQuantity);
      
      // Update local state
      setItems(items.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      
      // If costs were calculated, recalculate them
      if (calculated) {
        setCalculated(false);
        setVendorCosts([]);
        setMegaOption(null);
      }
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: string) => {
    if (!id) return;
    
    try {
      await shoppingListsAPI.removeItem(id, itemId);

      setItems(items.filter(item => item.id !== itemId));
      
      // If costs were calculated, recalculate them
      if (calculated) {
        setCalculated(false);
        setVendorCosts([]);
        setMegaOption(null);
      }
      
      toast({
        title: "Item removed",
        description: "Item has been removed from the list",
      });
    } catch (error: any) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async (product: Product) => {
    if (!id) return;
    const productId = product.product_id?.toString() || product.id;
    if (!productId) {
      toast({
        title: "Error",
        description: "Invalid product selected",
        variant: "destructive",
      });
      return;
    }

    setAddingProduct(true);
    try {
      await shoppingListsAPI.addItem(id, productId, 1);
      await fetchList();
      toast({
        title: "Product added",
        description: `${product.name || product.product_name || "Product"} added to the list`,
      });
      setAddProductOpen(false);
      setProductSearch("");
      if (calculated) {
        setCalculated(false);
        setVendorCosts([]);
        setMegaOption(null);
      }
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setAddingProduct(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true;
    const searchLower = productSearch.toLowerCase();
    const name = (p.name || p.product_name || p.base_product_name || p.display_name || '').toLowerCase();
    const category = typeof p.category === 'string'
      ? p.category.toLowerCase()
      : typeof p.category === 'number'
      ? p.category.toString().toLowerCase()
      : typeof p.category_name === 'string'
      ? p.category_name.toLowerCase()
      : '';
    const brand = (p.brand || '').toLowerCase();
    const packageSize = (p.package_size || p.variant_info || '').toLowerCase();
    const variant = (p.variant_name || p.variant_info || '').toLowerCase();

    return (
      name.includes(searchLower) ||
      category.includes(searchLower) ||
      brand.includes(searchLower) ||
      packageSize.includes(searchLower) ||
      variant.includes(searchLower)
    );
  });

  const moveToCart = (vendor: VendorCost) => {
    const itemsToAdd = vendor.items.map(item => ({
      id: `${item.productId}-${vendor.vendor}`,
      productId: item.productId,
      name: item.productName,
      category: "",
      brand: "",
      size: "",
      price: item.price,
      vendor: vendor.vendor,
      quantity: item.quantity,
    }));

    addMultipleToCart(itemsToAdd);

    toast({
      title: "Added to cart",
      description: `${vendor.items.length} items added from ${vendor.vendor}. Duplicates automatically removed.`,
    });

    navigate("/cart");
  };

  const moveMegaOptionToCart = () => {
    if (!megaOption) return;
    
    const itemsToAdd = megaOption.items.map(item => ({
      id: `${item.productId}-${item.vendor}`,
      productId: item.productId,
      name: item.productName,
      category: "",
      brand: "",
      size: "",
      price: item.price,
      vendor: item.vendor,
      quantity: item.quantity,
    }));

    addMultipleToCart(itemsToAdd);

    toast({
      title: "Added to cart",
      description: `${megaOption.items.length} items added from optimal vendors. Duplicates automatically removed.`,
    });

    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{listName}</h1>
              <p className="text-muted-foreground mt-2">
                {items.length} item{items.length !== 1 ? 's' : ''} in this list
              </p>
            </div>
            <Button onClick={calculateCosts} disabled={calculating}>
              {calculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : calculated ? (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Recalculate Costs
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate Costs
                </>
              )}
            </Button>
          </div>

          {!calculated ? (
            <Card>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle>Items in List</CardTitle>
                <Popover open={addProductOpen} onOpenChange={setAddProductOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search products..."
                        value={productSearch}
                        onValueChange={setProductSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No products found.</CommandEmpty>
                        <CommandGroup>
                          {filteredProducts.slice(0, 50).map((product) => (
                            <CommandItem
                              key={product.id || product.product_id}
                              value={product.name || product.product_name || ""}
                              onSelect={() => handleAddProduct(product)}
                              disabled={addingProduct}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {product.name || product.product_name || product.base_product_name || "Unnamed Product"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {product.brand ? `${product.brand} • ` : ""}
                                  {product.package_size || product.variant_info || ""}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => {
                    const productName =
                      item.products?.name ||
                      item.products?.product_name ||
                      item.products?.base_product_name ||
                      "Unnamed Product";
                    const productMeta = [
                      item.products?.brand,
                      item.products?.category,
                    ]
                      .filter(Boolean)
                      .join(" • ");
                    return (
                      <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{productName}</p>
                          {productMeta && (
                            <p className="text-sm text-muted-foreground">{productMeta}</p>
                          )}
                        </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-3 py-1 min-w-[3rem] text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Price Comparison</h2>
              
              {/* Mega Option */}
              {megaOption && megaOption.items.length > 0 && (
                <Card className="border-green-500 shadow-lg bg-green-50 dark:bg-green-950">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          ✨ Mega Option (Mix & Match)
                          <Badge className="bg-green-600">Best Price</Badge>
                        </CardTitle>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                          Rs. {megaOption.totalCost.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Optimal mix - buy each product from its cheapest vendor
                        </p>
                      </div>
                      <Button onClick={moveMegaOptionToCart} className="bg-green-600 hover:bg-green-700">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {megaOption.items.map((item, idx) => (
                        <div key={item.productId || `mega-${idx}`} className="flex justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded">
                          <span>
                            {item.productName} x {item.quantity} <span className="text-muted-foreground">from {item.vendor}</span>
                          </span>
                          <span className="font-medium">
                            Rs. {item.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vendor Options */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Vendor Options</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Total cost if buying ALL items from each vendor
                </p>
                
                {vendorCosts.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No vendor options available</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        No vendors found for the products in your list
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  vendorCosts.map((vendor, index) => (
                  <Card key={vendor.vendor} className={index === 0 && !megaOption ? "border-primary shadow-lg" : "mb-4"}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {vendor.vendor}
                            {index === 0 && !megaOption && <Badge>Best Single Vendor</Badge>}
                          </CardTitle>
                          <p className="text-3xl font-bold text-primary mt-2">
                            Rs. {vendor.totalCost.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {vendor.availableItems}/{vendor.totalItems} items available
                          </p>
                        </div>
                        <Button onClick={() => moveToCart(vendor)}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {vendor.items.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Available Items</h4>
                          <div className="space-y-2">
                            {vendor.items.map((item, idx) => (
                              <div key={item.productId || `vendor-${vendor.vendor}-${idx}`} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                                <span>
                                  {item.productName} x {item.quantity}
                                </span>
                                <span className="font-medium">
                                  Rs. {item.total.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {vendor.unavailableItems.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-2 text-destructive">Unavailable Items</h4>
                            <div className="space-y-1">
                              {vendor.unavailableItems.map((item, idx) => (
                                <p key={idx} className="text-sm text-muted-foreground">
                                  • {item}
                                </p>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ViewShoppingList;