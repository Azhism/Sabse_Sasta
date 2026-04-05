import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import SearchResults from "./pages/SearchResults";
import ProductVendors from "./pages/ProductVendors";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderReview from "./pages/OrderReview";
import ShoppingLists from "./pages/ShoppingLists";
import CreateShoppingList from "./pages/CreateShoppingList";
import ViewShoppingList from "./pages/ViewShoppingList";
import VendorLogin from "./pages/VendorLogin";
import VendorDashboard from "./pages/VendorDashboard";
import VendorPendingApproval from "./pages/VendorPendingApproval";
import VendorProtectedRoute from "./components/VendorProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
// Load the Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error('Error: VITE_GOOGLE_CLIENT_ID environment variable is not set!');
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<VendorProtectedRoute><Index /></VendorProtectedRoute>} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<VendorProtectedRoute><Profile /></VendorProtectedRoute>} />
                <Route path="/search" element={<VendorProtectedRoute><SearchResults /></VendorProtectedRoute>} />
                <Route path="/products/:id/vendors" element={<VendorProtectedRoute><ProductVendors /></VendorProtectedRoute>} />
                <Route path="/cart" element={<VendorProtectedRoute><Cart /></VendorProtectedRoute>} />
                <Route path="/checkout" element={<VendorProtectedRoute><Checkout /></VendorProtectedRoute>} />
                <Route path="/order-review" element={<VendorProtectedRoute><OrderReview /></VendorProtectedRoute>} />
                <Route path="/shopping-lists" element={<VendorProtectedRoute><ShoppingLists /></VendorProtectedRoute>} />
                <Route path="/shopping-lists/new" element={<VendorProtectedRoute><CreateShoppingList /></VendorProtectedRoute>} />
                <Route path="/shopping-lists/:id" element={<VendorProtectedRoute><ViewShoppingList /></VendorProtectedRoute>} />
                <Route path="/vendor-login" element={<VendorLogin />} />
                <Route path="/vendor-dashboard" element={<VendorDashboard />} />
                <Route path="/vendor-pending-approval" element={<VendorPendingApproval />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);

export default App;
