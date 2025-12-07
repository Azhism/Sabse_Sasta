import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { vendorsAPI } from "@/services/api";

interface VendorProtectedRouteProps {
  children: React.ReactNode;
}

const VendorProtectedRoute = ({ children }: VendorProtectedRouteProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const checkVendorStatus = async () => {
      // If not authenticated or not a vendor, allow access (non-vendor routes)
      if (!isAuthenticated || user?.role !== 'vendor') {
        setIsChecking(false);
        return;
      }

      try {
        // Check if vendor is approved
        const status = await vendorsAPI.getStatus();
        setIsApproved(status.approved);
        
        if (!status.approved) {
          // Unapproved vendor trying to access protected route - redirect to pending page
          navigate("/vendor-pending-approval", { replace: true });
        }
      } catch (error) {
        console.error("Error checking vendor status:", error);
        // If error checking status, logout and redirect to auth
        logout();
        navigate("/auth", { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    checkVendorStatus();
  }, [isAuthenticated, user, navigate, logout]);

  // Show nothing while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If vendor is not approved, don't render children (already redirected)
  if (isAuthenticated && user?.role === 'vendor' && !isApproved) {
    return null;
  }

  // Render children for approved vendors or non-vendors
  return <>{children}</>;
};

export default VendorProtectedRoute;
