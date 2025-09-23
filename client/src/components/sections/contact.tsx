export default function Contact() {
  const contactInfo = [
    {
      icon: "fas fa-envelope",
      title: "Email",
      details: "support@payday.ng",
    },
    {
      icon: "fas fa-phone",
      title: "Phone",
      details: "+234 704 200 1836",
    },
    {
      icon: "fas fa-users",
      title: "Team",
      details: "Team Payday\nBuilding the future of work",
    },
  ];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-xl text-gray-600">Questions? We're here to help you succeed.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          {contactInfo.map((contact, index) => (
            <div key={index} className="hover-lift" data-testid={`contact-${index}`}>
              <div className="w-16 h-16 bg-payday-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <i className={`${contact.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{contact.title}</h3>
              <p className="text-gray-600 whitespace-pre-line">{contact.details}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
