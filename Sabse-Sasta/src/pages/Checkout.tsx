import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ordersAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    deliveryAddress: "",
  });

  const DELIVERY_FEE = 200;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isAuthenticated || !user) {
        toast({
          title: "Authentication required",
          description: "Please log in to place an order",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const itemsTotal = getTotalPrice();
      const totalWithDelivery = itemsTotal + DELIVERY_FEE;

      // Create order with items
      const order = await ordersAPI.create({
        userId: user.id,
        subtotalAmount: itemsTotal,
        deliveryFee: DELIVERY_FEE,
        totalAmount: totalWithDelivery,
        paymentMethod: "cod",
        customerName: formData.customerName,
        phone: formData.phone,
        deliveryAddress: formData.deliveryAddress,
        status: "pending",
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          brand: item.brand,
          category: item.category,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          vendor: item.vendor,
        })),
      });

      // Clear cart and redirect
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Your order has been confirmed. We'll deliver it soon.",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({
        title: "Error placing order",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 min-h-screen">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add items to your cart before proceeding to checkout
            </p>
            <Button onClick={() => navigate("/")}>Start Shopping</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Delivery Details Form */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+92 XXX XXXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your complete delivery address"
                  rows={4}
                />
              </div>

              <div className="pt-4">
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm">Cash on Delivery (COD)</p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-card p-6 rounded-lg border h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">
                      {item.name} ({item.size})
                    </p>
                    <p className="text-muted-foreground">
                      Qty: {item.quantity} × Rs. {item.price}
                    </p>
                  </div>
                  <p className="font-medium">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Subtotal</span>
                  <span>Rs. {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Delivery Fee</span>
                  <span>Rs. {DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Total</span>
                  <span>
                    Rs. {(getTotalPrice() + DELIVERY_FEE).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
