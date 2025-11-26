import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, CheckCircle2 } from "lucide-react";

export const VendorShowcase = () => {
  const vendors = [
    { 
      name: "Imtiaz Super Market",
      products: "800+",
      status: "Active",
      description: "Wide range of groceries and household items"
    },
    { 
      name: "Bin Hashim",
      products: "650+",
      status: "Active",
      description: "Fresh produce and quality products"
    },
    { 
      name: "Max Budget",
      products: "720+",
      status: "Active",
      description: "Budget-friendly shopping destination"
    },
    { 
      name: "Al-Fatah",
      products: "550+",
      status: "Active",
      description: "Premium quality groceries"
    }
  ];

  return (
    <section id="vendors" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Partner Vendors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We partner with Pakistan's leading supermarkets to bring you the best prices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vendors.map((vendor, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-2">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary-foreground" />
                </div>
                <Badge className="bg-accent text-accent-foreground">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {vendor.status}
                </Badge>
              </div>
              <h3 className="text-lg font-bold mb-2">{vendor.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {vendor.description}
              </p>
              <div className="text-sm font-semibold text-primary">
                {vendor.products} products available
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
