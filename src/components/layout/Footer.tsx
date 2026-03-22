import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg mb-4">
              <div className="gradient-primary rounded-xl p-2 shadow-sm">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              Giza Global
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered document processing for modern teams.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">Product</h4>
            <div className="space-y-3">
              <Link to="/pricing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">Resources</h4>
            <div className="space-y-3">
              <span className="block text-sm text-muted-foreground">Documentation</span>
              <span className="block text-sm text-muted-foreground">API Reference</span>
              <span className="block text-sm text-muted-foreground">Blog</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">Legal</h4>
            <div className="space-y-3">
              <span className="block text-sm text-muted-foreground">Privacy</span>
              <span className="block text-sm text-muted-foreground">Terms</span>
              <span className="block text-sm text-muted-foreground">Security</span>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2026 Giza Global. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
