import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, Mail } from "lucide-react";

const VendorPendingApproval = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      navigate("/auth");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
              <CardTitle className="text-3xl">Account Pending Approval</CardTitle>
              <CardDescription className="text-lg mt-2">
                Thank you for registering as a vendor!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-6 rounded-lg space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Account Created Successfully</p>
                    <p className="text-sm text-muted-foreground">
                      Your vendor account has been created with email: <strong>{user?.email}</strong>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Admin Review in Progress</p>
                    <p className="text-sm text-muted-foreground">
                      Our team is reviewing your account. This usually takes 24-48 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">What Happens Next?</p>
                    <p className="text-sm text-muted-foreground">
                      Once approved, you'll receive an email notification and can access your vendor dashboard to upload product catalogs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Need Help?</strong> If you have any questions or haven't heard back within 48 hours, please contact us at{" "}
                  <a href="mailto:support@sabsesasta.com" className="underline font-medium">
                    support@sabsesasta.com
                  </a>
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Go to Homepage
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    logout();
                    navigate("/auth");
                  }}
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VendorPendingApproval;
