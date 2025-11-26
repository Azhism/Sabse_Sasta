import { useCart } from "@/contexts/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, Plus, Minus, Package2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DELIVERY_FEE = 200;

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

  // Group items by vendor
  const itemsByVendor = items.reduce((acc, item) => {
    if (!acc[item.vendor]) {
      acc[item.vendor] = [];
    }
    acc[item.vendor].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const getVendorTotal = (vendor: string) => {
    return itemsByVendor[vendor].reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const subtotal = getTotalPrice();
  const totalWithDelivery = subtotal + DELIVERY_FEE;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center py-16">
            <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Start shopping to add items to your cart
            </p>
            <Button onClick={() => navigate("/")} variant="hero" size="lg">
              Start Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Shopping Cart</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            <Button variant="outline" onClick={clearCart} className="w-full sm:w-auto">
              Clear Cart
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(itemsByVendor).map(([vendor, vendorItems]) => (
                <Card key={vendor}>
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                        <Package2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="truncate">{vendor}</span>
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
                        ₨ {getVendorTotal(vendor).toFixed(2)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {vendorItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pb-4 border-b last:border-0"
                        >
                          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-hero rounded-lg flex-shrink-0">
                              <Package2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
                              <div className="flex gap-1.5 sm:gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {item.brand}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {item.size}
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                ₨ {item.price.toFixed(2)} each
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 sm:h-10 sm:w-10"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(item.id, parseInt(e.target.value) || 1)
                                }
                                className="w-12 sm:w-16 h-8 sm:h-10 text-center text-sm"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 sm:h-10 sm:w-10"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1">
                              <p className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                                ₨ {(item.price * item.quantity).toFixed(2)}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="text-destructive hover:text-destructive h-7 px-2"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {Object.entries(itemsByVendor).map(([vendor, vendorItems]) => (
                      <div
                        key={vendor}
                        className="flex justify-between text-sm py-2 border-b"
                      >
                        <span className="text-muted-foreground">{vendor}</span>
                        <span className="font-medium">
                          ₨ {getVendorTotal(vendor).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₨ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>₨ {DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        ₨ {totalWithDelivery.toFixed(2)}
                      </span>
                    </div>
                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                      onClick={() => navigate("/checkout")}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2 text-sm">Shopping Tips:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Items are grouped by vendor</li>
                      <li>• Compare prices to maximize savings</li>
                      <li>• Consider minimum order requirements</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;