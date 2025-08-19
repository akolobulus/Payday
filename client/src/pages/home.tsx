import { useState } from "react";
import Navbar from "@/components/navigation/navbar";
import Hero from "@/components/sections/hero";
import Stats from "@/components/sections/stats";
import HowItWorks from "@/components/sections/how-it-works";
import Benefits from "@/components/sections/benefits";
import Testimonials from "@/components/sections/testimonials";
import CTA from "@/components/sections/cta";
import Contact from "@/components/sections/contact";
import Footer from "@/components/sections/footer";
import LoginModal from "@/components/auth/login-modal";
import SignupModal from "@/components/auth/signup-modal";

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openSignupModal = () => setIsSignupModalOpen(true);
  const closeSignupModal = () => setIsSignupModalOpen(false);

  const switchToSignup = () => {
    closeLoginModal();
    openSignupModal();
  };

  const switchToLogin = () => {
    closeSignupModal();
    openLoginModal();
  };

  return (
    <div className="font-inter bg-gray-50 overflow-x-hidden">
      <Navbar onOpenLogin={openLoginModal} onOpenSignup={openSignupModal} />
      <Hero onOpenSignup={openSignupModal} />
      <Stats />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <CTA onOpenSignup={openSignupModal} />
      <Contact />
      <Footer />
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal}
        onSwitchToSignup={switchToSignup}
      />
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={closeSignupModal}
        onSwitchToLogin={switchToLogin}
      />
    </div>
  );
}
