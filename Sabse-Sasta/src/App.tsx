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
import ShoppingLists from "./pages/ShoppingLists";
import CreateShoppingList from "./pages/CreateShoppingList";
import ViewShoppingList from "./pages/ViewShoppingList";
import VendorLogin from "./pages/VendorLogin";
import VendorDashboard from "./pages/VendorDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
// Load the Client ID from environment variables
const GOOGLE_CLIENT_ID = 
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '1099303988282-2se56am1u6pal616e6vho7v8a34cift1.apps.googleusercontent.com';

console.log('Google Client ID loaded:', GOOGLE_CLIENT_ID ? 'Yes' : 'No - MISSING!');
console.log('Env check:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

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
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/products/:id/vendors" element={<ProductVendors />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/shopping-lists" element={<ShoppingLists />} />
                <Route path="/shopping-lists/new" element={<CreateShoppingList />} />
                <Route path="/shopping-lists/:id" element={<ViewShoppingList />} />
                <Route path="/vendor-login" element={<VendorLogin />} />
                <Route path="/vendor-dashboard" element={<VendorDashboard />} />
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
