import { useState } from "react";
import { Button } from "@/components/ui/button";
import paydayLogoPath from "@assets/20250819_104458-removebg-preview_1755623157202.png";

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export default function Navbar({ onOpenLogin, onOpenSignup }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={paydayLogoPath} 
              alt="Payday Logo" 
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-payday-blue">Payday</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              data-testid="nav-how-it-works"
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-700 hover:text-payday-blue transition-colors font-medium"
            >
              How it Works
            </button>
            <button
              data-testid="nav-benefits"
              onClick={() => scrollToSection('benefits')}
              className="text-gray-700 hover:text-payday-blue transition-colors font-medium"
            >
              Benefits
            </button>
            <button
              data-testid="nav-contact"
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-payday-blue transition-colors font-medium"
            >
              Contact
            </button>
            <Button 
              data-testid="button-login"
              variant="outline" 
              onClick={onOpenLogin}
              className="text-payday-blue border-payday-blue hover:bg-payday-blue hover:text-white"
            >
              Login
            </Button>
            <Button 
              data-testid="button-signup"
              onClick={onOpenSignup}
              className="bg-payday-blue hover:bg-blue-700"
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            data-testid="button-mobile-menu"
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-700 hover:text-payday-blue"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <button
              data-testid="nav-mobile-how-it-works"
              onClick={() => scrollToSection('how-it-works')}
              className="block text-gray-700 hover:text-payday-blue transition-colors font-medium"
            >
              How it Works
            </button>
            <button
              data-testid="nav-mobile-benefits"
              onClick={() => scrollToSection('benefits')}
              className="block text-gray-700 hover:text-payday-blue transition-colors font-medium"
            >
              Benefits
            </button>
            <button
              data-testid="nav-mobile-contact"
              onClick={() => scrollToSection('contact')}
              className="block text-gray-700 hover:text-payday-blue transition-colors font-medium"
            >
              Contact
            </button>
            <div className="flex space-x-3 pt-2">
              <Button 
                data-testid="button-mobile-login"
                variant="outline"
                onClick={onOpenLogin}
                className="flex-1 text-payday-blue border-payday-blue hover:bg-payday-blue hover:text-white"
              >
                Login
              </Button>
              <Button 
                data-testid="button-mobile-signup"
                onClick={onOpenSignup}
                className="flex-1 bg-payday-blue hover:bg-blue-700"
              >
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
