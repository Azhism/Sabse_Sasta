import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-shopping.jpg";

export const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-background to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full">
              <TrendingDown className="h-4 w-4 text-accent-foreground" />
              <span className="text-sm font-medium text-accent-foreground">Save up to 30% on groceries</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Find the <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Lowest Prices</span> Across All Supermarkets
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Compare prices instantly from Imtiaz, Bin Hashim, Max Budget, and more. 
              Create smart shopping lists and save money on every purchase.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 p-2 bg-card rounded-lg shadow-card border border-border max-w-xl">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchQuery
                      ? ""
                      : "Search for products... (e.g., Rice, Bread)"
                  }
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                />
              </div>
              <Button type="submit" variant="hero" size="lg">
                Compare Prices
              </Button>
            </form>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div>
                <div className="text-3xl font-bold text-primary">5+</div>
                <div className="text-sm text-muted-foreground">Vendors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">30%</div>
                <div className="text-sm text-muted-foreground">Avg Savings</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={heroImage} 
                alt="Fresh groceries and vegetables in a modern supermarket"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border max-w-xs hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">You saved</div>
                  <div className="text-xl font-bold text-primary">₨ 450</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
