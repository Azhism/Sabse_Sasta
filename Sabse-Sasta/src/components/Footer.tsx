import { Facebook, Twitter, Instagram, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">₨</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Sabse Sasta
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your trusted platform for comparing supermarket prices across Pakistan.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How it Works</a></li>
              <li><a href="#vendors" className="text-muted-foreground hover:text-primary transition-colors">Vendors</a></li>
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="font-semibold mb-4">For Vendors</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Vendor Portal</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Upload Catalog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Partner with Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                support@sabsesasta.pk
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 Sabse Sasta. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
