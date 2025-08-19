import paydayLogoPath from "@assets/20250819_104458-removebg-preview_1755623157202.png";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-dark-gray text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img src={paydayLogoPath} alt="Payday Logo" className="w-10 h-10" />
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Empowering Nigerian youth through instant-paying gigs. From broke days to paydays, we're here to change your financial story.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  data-testid="footer-how-it-works"
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-payday-yellow transition-colors"
                >
                  How it Works
                </button>
              </li>
              <li>
                <button 
                  data-testid="footer-benefits"
                  onClick={() => scrollToSection('benefits')}
                  className="hover:text-payday-yellow transition-colors"
                >
                  Benefits
                </button>
              </li>
              <li>
                <button 
                  data-testid="footer-contact"
                  onClick={() => scrollToSection('contact')}
                  className="hover:text-payday-yellow transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-payday-yellow transition-colors" data-testid="link-privacy">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-payday-yellow transition-colors" data-testid="link-terms">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-payday-yellow transition-colors" data-testid="link-support">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">&copy; 2024 Payday by Team Lumina. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
