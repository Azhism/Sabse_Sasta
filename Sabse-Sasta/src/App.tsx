import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
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
  </QueryClientProvider>
);

export default App;
