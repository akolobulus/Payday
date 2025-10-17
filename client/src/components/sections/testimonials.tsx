import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Operations Manager at VeloTech",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b739?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      quote: "I thought deploying an AI agent would be complicated, but this was effortless. I just picked one from the store, and by the next week, it was live and working for my business.",
      rating: 4.9,
    },
    {
      name: "Thomas Nguyen",
      role: "Product Lead at OrbitLabs",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      quote: "The speed blew me away. Having a ready-made AI agent tailored to our needs without writing a single line of code gave us a massive head start.",
      rating: 4.9,
    },
    {
      name: "James Lee",
      role: "CTO at Fineva",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      quote: "We were up and running with our AI agent in just 3 days. What would've taken us months to build was handled seamlessly, and it's already saving our team hours every week.",
      rating: 5.0,
    },
    {
      name: "Blessing O.",
      role: "University of Jos, Final Year",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      quote: "I earned ₦15,000 in my first week just doing delivery gigs around campus. The instant payment saved me from missing rent!",
      rating: 5.0,
    },
    {
      name: "David M.",
      role: "Fresh Graduate, NYSC Corps Member",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      quote: "Payday helped me survive NYSC. I tutored kids after work and made enough to support myself without asking family for money.",
      rating: 4.9,
    },
    {
      name: "Mrs. Adama",
      role: "Small Business Owner, Abuja",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      quote: "As a gig poster, I love how quickly I can find reliable help. Posted a cleaning gig at 9am, had it done by 2pm!",
      rating: 5.0,
    },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm text-gray-500 mb-3 uppercase tracking-wide">Testimonials</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0"
                data-testid={`testimonial-${index}`}
              >
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="flex flex-col items-center text-center mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={`${testimonial.name} testimonial photo`}
                      className="w-16 h-16 rounded-full mb-4 object-cover" 
                    />
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(testimonial.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">{testimonial.rating}/5</span>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed">"{testimonial.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.slice(0, Math.ceil(testimonials.length / 3)).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index * 3)}
              className={`h-2 rounded-full transition-all ${
                Math.floor(selectedIndex / 3) === index 
                  ? 'w-8 bg-gray-800' 
                  : 'w-2 bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              data-testid={`carousel-dot-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
