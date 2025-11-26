import { Search, ListChecks, ShoppingCart, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Search Products",
      description: "Search for any grocery item across all major supermarkets in Pakistan.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: ListChecks,
      title: "Compare Prices",
      description: "Instantly see prices from different vendors side-by-side with availability status.",
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: ShoppingCart,
      title: "Create Shopping List",
      description: "Build your shopping list and see total costs calculated for each vendor.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Sparkles,
      title: "Save Money",
      description: "Choose the cheapest option or mix and match to maximize your savings.",
      color: "bg-secondary/10 text-secondary"
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Save money in four simple steps. No more running between stores to compare prices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-2">
              <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                <step.icon className="h-7 w-7" />
              </div>
              <div className="mb-2 text-sm font-semibold text-muted-foreground">
                Step {index + 1}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
