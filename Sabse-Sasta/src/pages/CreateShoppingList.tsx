import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI, shoppingListsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Check } from "lucide-react";

interface Product {
  id?: string;
  product_id?: string | number;
  name?: string;
  product_name?: string;
  base_product_name?: string;
  category?: string;
  category_id?: string | number;
  brand?: string;
  package_size?: string;
  variant_name?: string;
}

interface SelectedProduct {
  productId: string;
  name: string;
  quantity: number;
}

const CreateShoppingList = () => {
  const [listName, setListName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll();

      // Transform backend data to frontend format and remove duplicates
      const transformedProducts = data?.map((item: any) => ({
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

      // Remove duplicates by product name
      const uniqueProducts = transformedProducts.reduce((acc: Product[], current) => {
        const productName = current.name || current.product_name || current.base_product_name;
        const exists = acc.find(item => 
          (item.name || item.product_name || item.base_product_name) === productName
        );
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      setProducts(uniqueProducts);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load products",
        variant: "destructive",
      });
    }
  };

  const addProduct = (product: Product) => {
    const productId = product.product_id?.toString() || product.id;
    const productName = product.name || product.product_name || product.base_product_name || 'Unknown Product';
    const exists = selectedProducts.find(p => p.productId === productId);
    if (!exists && productId) {
      setSelectedProducts([...selectedProducts, {
        productId: productId,
        name: productName,
        quantity: 1,
      }]);
    }
    setOpen(false);
    setSearchValue("");
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedProducts(selectedProducts.map(p =>
      p.productId === productId ? { ...p, quantity } : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!listName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a list name",
        variant: "destructive",
      });
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create the list with items
      const list = await shoppingListsAPI.create({
        name: listName,
        items: selectedProducts.map(p => ({
          productId: p.productId,
        quantity: p.quantity,
        })),
      });

      toast({
        title: "Success",
        description: "Shopping list created",
      });

      // Get the list ID (could be list_id or id)
      const listId = list.list_id?.toString() || list.id?.toString();
      if (listId) {
        navigate(`/shopping-lists/${listId}`);
      } else {
        // If no ID, navigate to lists page and refresh
        navigate("/shopping-lists");
      }
    } catch (error) {
      console.error("Error creating list:", error);
      toast({
        title: "Error",
        description: "Failed to create shopping list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const searchLower = searchValue.toLowerCase();
    const name = (p.name || p.product_name || p.base_product_name || p.display_name || '').toLowerCase();
    // Fix: Handle category as string, number, or object
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
    
    return name.includes(searchLower) ||
           category.includes(searchLower) ||
           brand.includes(searchLower) ||
           packageSize.includes(searchLower) ||
           variant.includes(searchLower);
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Create Shopping List</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>List Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="listName">List Name</Label>
                  <Input
                    id="listName"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="e.g., Weekly Groceries"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Add Products</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start mt-1">
                        <Plus className="mr-2 h-4 w-4" />
                        Select products
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Search products..." 
                          value={searchValue}
                          onValueChange={setSearchValue}
                        />
                        <CommandList>
                          <CommandEmpty>No products found.</CommandEmpty>
                          <CommandGroup>
                            {filteredProducts.map((product) => {
                              const productId = product.product_id?.toString() || product.id;
                              const productName = product.name || product.product_name || product.base_product_name || 'Unknown Product';
                              const isSelected = selectedProducts.find(p => p.productId === productId);
                              
                              return (
                              <CommandItem
                                  key={productId}
                                onSelect={() => addProduct(product)}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                      isSelected ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                <div>
                                    <div className="font-medium">{productName}</div>
                                  <div className="text-sm text-muted-foreground">
                                      {product.brand || 'N/A'} • {product.category || 'N/A'} {product.package_size ? `• ${product.package_size}` : ''}
                                  </div>
                                </div>
                              </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedProducts.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Products ({selectedProducts.length})</Label>
                    <div className="space-y-2">
                      {selectedProducts.map((product) => (
                        <div
                          key={product.productId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <span className="font-medium flex-1">{product.name}</span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(product.productId, product.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{product.quantity}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(product.productId, product.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProduct(product.productId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/shopping-lists")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create List"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateShoppingList;