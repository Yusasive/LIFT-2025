import React, { useState, useEffect } from 'react';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const testimonials = [
  {
    text: 'Well organized collaborative trade fair',
    name: 'Mr. Babajide Sanwo-Olu',
    title: 'Governor, Lagos State',
  },
  {
    text: 'Grateful to the President all management team of LCCI for another International Trade Fair in Lagos. This exercise and event is necessary and important for the lifeline of our economy in Lagos. Trade is key and needed for the survival of our economy. Lagos is a giant market and Trade and deal centre. It is therefore important that we keep working with LCCI to make sure that our businesses survive and keep going well in Lagos. This is our promise. Business will get all our attention and support in order to do well and thrive in our state. It is our promise as a government. Thanks to all those who make it possible for the Trade Fair to happen',
    name: 'Dr. Femi Hamzat',
    title: 'Deputy Governor, Lagos State',
    date: '01/11/2024',
  },
  {
    text: 'On behalf of the Governor and the good people of Osun State, I wish the Lagos Chamber of Commerce and happy celebration of the 2024 Trade fair. Best of luck.',
    name: 'Rev Bunmi Jenyo',
    title: 'Honorable Commissioner, Ministry of Commerce and Industry, Osun State',
  },
  {
    text: 'Congratulations to the President and members of LCCI for once again delivering a very impactful 38th edition of the Lagos International Trade Fair. Afreximbank stands ready to continue to support you in advancing trade across Africa in aiding the AfCFTA.',
    name: 'Oluoranti Doherty',
    title: 'MD, Export Development, Afreximbank',
  },
  {
    text: 'Hearty congratulations to the Lagos Chamber of Commerce on the occasion of the 2024 Lagos International Trade Fair. Stronger and ever growing over One Hundred and Forty Years. Great appreciation to the organizer. We are grateful for the continued partnership. Wish you many many more years of success.',
    name: 'Dame Winifred Akpani, OFR',
    title: 'MD/CEO Northwest Petroleum and Gas Co Ltd',
  },
  {
    text: 'On behalf of Brunel University of London and Brunel Business School, I would like to thank LCCI and its leadership team, present and past, who have great vision and foresight. Thank you for the opportunity to work with SMEs and we look forward to building on our strong start.',
    name: 'Ashlly Braganza',
    title: 'Provost and Dean, Brunel Business School',
  },
  {
    text: 'Very impressed with the Chamber for the platform to showcase the product of our beneficiary. The organization/security arrangement is perfect and commendable.',
    name: 'H.E Silas A. Agara',
    title: 'Director General, NDE',
  },
  {
    text: 'On behalf of the Federal Inland Revenue Service(FIRS), I wish to specially commend the Lagos Chamber of Commerce and Industry for their overwhelmingly supporting FIRS through Tax Compliance, Tax payment timely and regularly, in order to help the nation meets her responsibilities to the citizens. We salute your courage in pushing forward businesses despite various challenges in the nations economy environment and FIRS promises to keep collaborating with LCCI in prior to foster our cordial relationship going forward. All the best',
    name: 'Dr. Zaccheus Adedeji',
    title: 'Chairman, FIRS',
  },
];

const TestimonialSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;
  const itemsPerPage = 3;
  const maxPage = Math.ceil(total / itemsPerPage) - 1;

  const prev = () => setCurrent((prev) => (prev - 1 + maxPage + 1) % (maxPage + 1));
  const next = () => setCurrent((prev) => (prev + 1) % (maxPage + 1));

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      next();
    }, 6000); // Change testimonials every 6 seconds

    return () => clearInterval(interval);
  }, []);

  const getCurrentTestimonials = () => {
    const start = current * itemsPerPage;
    const end = Math.min(start + itemsPerPage, total);
    let currentTestimonials = testimonials.slice(start, end);
    
    // If we don't have 3 testimonials, fill the remaining spots with testimonials from the beginning
    if (currentTestimonials.length < itemsPerPage) {
      const remainingSlots = itemsPerPage - currentTestimonials.length;
      const additionalTestimonials = testimonials.slice(0, remainingSlots);
      currentTestimonials = [...currentTestimonials, ...additionalTestimonials];
    }
    
    return currentTestimonials;
  };

  return (
    <section id="testimonial-section" className="py-16 bg-gradient-to-br from-primary-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-green-800 mb-8">Testimonials</h2>
        
        <div className="relative">
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-3 text-green-700 hover:bg-red-500 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Previous testimonials"
          >
            <FaChevronLeft className="text-xl" />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-12 transition-all duration-500 ease-in-out">
            {getCurrentTestimonials().map((testimonial, idx) => (
              <div 
                key={`${current}-${idx}`} 
                className="bg-white rounded-xl shadow-md p-6 border-t-4 border-red-500 transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-lg"
              >
                <FaQuoteLeft className="text-red-400 text-2xl mb-3" />
                <p className="text-sm text-gray-700 italic line-clamp-4 mb-4">
                  {testimonial.text.length > 150 
                    ? `${testimonial.text.substring(0, 150)}...` 
                    : testimonial.text}
                </p>
                <div>
                  <span className="block font-bold text-green-800 text-sm">{testimonial.name}</span>
                  <span className="block text-xs text-gray-500 font-medium">
                    {testimonial.title}
                    {testimonial.date ? ` • ${testimonial.date}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={next}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-3 text-green-700 hover:bg-red-500 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Next testimonials"
          >
            <FaChevronRight className="text-xl" />
          </button>
        </div>
        
        <div className="flex justify-center gap-3 mt-8">
          {Array.from({ length: maxPage + 1 }, (_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                current === idx 
                  ? 'bg-red-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection; 