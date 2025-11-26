import { ShoppingBag, Calculator, Clock, Smartphone, Shield, TrendingDown } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Calculator,
      title: "Smart Price Comparison",
      description: "Instantly compare prices across all vendors to find the best deals."
    },
    {
      icon: ShoppingBag,
      title: "Shopping List Builder",
      description: "Create and manage multiple shopping lists with automatic cost calculation."
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get the latest prices as vendors update their weekly catalogs."
    },
    {
      icon: TrendingDown,
      title: "Maximum Savings",
      description: "Save up to 30% on your grocery bills by choosing the best prices."
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Shop on the go with our responsive mobile-optimized platform."
    },
    {
      icon: Shield,
      title: "Secure Checkout",
      description: "Safe and secure payment processing with multiple payment options."
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make smart shopping decisions and save money.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
