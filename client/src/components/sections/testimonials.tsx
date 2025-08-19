export default function Testimonials() {
  const testimonials = [
    {
      name: "Blessing O.",
      role: "University of Jos, Final Year",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b739?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      quote: "I earned ₦15,000 in my first week just doing delivery gigs around campus. The instant payment saved me from missing rent!",
    },
    {
      name: "David M.",
      role: "Fresh Graduate, NYSC Corps Member",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      quote: "Payday helped me survive NYSC. I tutored kids after work and made enough to support myself without asking family for money.",
    },
    {
      name: "Mrs. Adama",
      role: "Small Business Owner, Abuja",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      quote: "As a gig poster, I love how quickly I can find reliable help. Posted a cleaning gig at 9am, had it done by 2pm!",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600">Real people, real results. See how Payday is changing lives across Nigeria.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-sm hover-lift"
              data-testid={`testimonial-${index}`}
            >
              <img 
                src={testimonial.image} 
                alt={`${testimonial.name} testimonial photo`}
                className="w-16 h-16 rounded-full mx-auto mb-4 object-cover" 
              />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{testimonial.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{testimonial.role}</p>
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              <div className="flex text-payday-yellow mt-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
