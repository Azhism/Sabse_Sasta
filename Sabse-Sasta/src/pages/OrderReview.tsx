import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ordersAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OrderData {
  orderId: string;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  subtotalAmount: number;
  deliveryFee: number;
  totalAmount: number;
}

export default function OrderReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const orderData: OrderData = location.state?.orderData;

  const [timeLeft, setTimeLeft] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState<"reviewing" | "confirmed" | "cancelled">("reviewing");

  useEffect(() => {
    // Redirect if no order data
    if (!orderData) {
      navigate("/");
      return;
    }

    // Auto-confirm after 30 seconds
    if (timeLeft === 0 && orderStatus === "reviewing") {
      handleConfirmOrder();
      return;
    }

    // Countdown timer
    if (orderStatus === "reviewing" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, orderStatus, orderData, navigate]);

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    try {
      await ordersAPI.confirm(orderData.orderId);
      setOrderStatus("confirmed");
      toast({
        title: "Order Confirmed!",
        description: "Your order has been confirmed and is being processed.",
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error confirming order",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsProcessing(true);
    try {
      await ordersAPI.cancel(orderData.orderId);
      setOrderStatus("cancelled");
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error cancelling order",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!orderData) {
    return null;
  }

  const progressPercentage = ((30 - timeLeft) / 30) * 100;

  if (orderStatus === "confirmed") {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
              <p className="text-muted-foreground mb-4">
                Your order #{orderData.orderId.slice(0, 8)} has been confirmed and is being processed.
              </p>
              <p className="text-sm text-muted-foreground">Redirecting you to home...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (orderStatus === "cancelled") {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Order Cancelled</h2>
              <p className="text-muted-foreground mb-4">
                Your order #{orderData.orderId.slice(0, 8)} has been cancelled successfully.
              </p>
              <p className="text-sm text-muted-foreground">Redirecting you to home...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl w-full">
          {/* Timer Card */}
          <Card className="border-2 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Clock className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-semibold">Time Remaining</span>
                    <span className="text-4xl font-bold text-primary">{timeLeft}s</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3 transition-all duration-1000 ease-linear" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Your order will be automatically confirmed when the timer reaches zero.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              variant="destructive"
              size="lg"
              className="flex-1 h-14 text-lg"
              onClick={handleCancelOrder}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-5 w-5" />
                  Cancel Order
                </>
              )}
            </Button>
            <Button
              variant="hero"
              size="lg"
              className="flex-1 h-14 text-lg"
              onClick={handleConfirmOrder}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Confirm Order Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
