import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
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
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center cursor-pointer" data-testid="link-home">
              <img 
                src={paydayLogoPath} 
                alt="Payday Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
              <span className="ml-2 text-lg sm:text-xl font-bold text-payday-blue hidden sm:inline">Payday</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <button
              data-testid="nav-how-it-works"
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-700 hover:text-payday-blue transition-colors font-medium text-sm xl:text-base"
            >
              How it Works
            </button>
            <button
              data-testid="nav-benefits"
              onClick={() => scrollToSection('benefits')}
              className="text-gray-700 hover:text-payday-blue transition-colors font-medium text-sm xl:text-base"
            >
              Benefits
            </button>
            <button
              data-testid="nav-contact"
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-payday-blue transition-colors font-medium text-sm xl:text-base"
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
              data-testid="button-post-gig-nav"
              onClick={onOpenSignup}
              className="bg-payday-blue text-white hover:bg-blue-700"
            >
              Post Your Gig
            </Button>
            <Button 
              data-testid="button-signup"
              onClick={onOpenSignup}
              className="bg-payday-blue text-white hover:bg-blue-700"
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            data-testid="button-mobile-menu"
            onClick={toggleMobileMenu}
            className="lg:hidden flex flex-col gap-1 p-2 text-gray-700 hover:text-payday-blue transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`w-6 h-0.5 bg-current transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-current transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-current transition-transform duration-200 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-2 sm:px-4 pb-4 pt-2 space-y-2 bg-white border-t border-gray-100">
            <button
              data-testid="nav-mobile-how-it-works"
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-3 px-3 text-gray-700 hover:text-payday-blue hover:bg-gray-50 transition-colors font-medium rounded-md text-sm sm:text-base"
            >
              How it Works
            </button>
            <button
              data-testid="nav-mobile-benefits"
              onClick={() => scrollToSection('benefits')}
              className="block w-full text-left py-3 px-3 text-gray-700 hover:text-payday-blue hover:bg-gray-50 transition-colors font-medium rounded-md text-sm sm:text-base"
            >
              Benefits
            </button>
            <button
              data-testid="nav-mobile-contact"
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left py-3 px-3 text-gray-700 hover:text-payday-blue hover:bg-gray-50 transition-colors font-medium rounded-md text-sm sm:text-base"
            >
              Contact
            </button>
            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
              <Button 
                data-testid="button-mobile-login"
                variant="outline"
                onClick={onOpenLogin}
                className="w-full text-payday-blue border-payday-blue hover:bg-payday-blue hover:text-white"
              >
                Login
              </Button>
              <Button 
                data-testid="button-mobile-post-gig"
                onClick={onOpenSignup}
                className="w-full bg-payday-blue text-white hover:bg-blue-700"
              >
                Post Your Gig
              </Button>
              <Button 
                data-testid="button-mobile-signup"
                onClick={onOpenSignup}
                className="w-full bg-payday-blue text-white hover:bg-blue-700"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
