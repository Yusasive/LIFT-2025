import { useState, useEffect } from 'react';    
import { FaArrowUp } from 'react-icons/fa';
import NavigationHeader from '../components/navigation/NavigationHeader';
import HeroSection from '../components/layouts/HeroSection';
import FooterSection from '../components/layouts/FooterSection';
import AboutSection from '../components/layouts/AboutSection';
import EventSection from '../components/layouts/EventSection';
import { useUser } from '@/context/UserContext';
import { useLocation } from 'react-router-dom';
import TestimonialsSection from '../components/layouts/TestimonialSection';

export default function Home() {
    const { user } = useUser();
    const [showScroll, setShowScroll] = useState(false);
    const isAuthenticated = !!user;
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
          setShowScroll(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (location.state?.scrollToEvent) {
          document.getElementById('event-section')?.scrollIntoView({ behavior: 'smooth' });
          window.history.replaceState({}, document.title);
        }
      }, [location]);

    useEffect(() => {
        if (location.state?.scrollToTestimonials) {
          document.getElementById('testimonial-section')?.scrollIntoView({ behavior: 'smooth' });
          window.history.replaceState({}, document.title);
        }
      }, [location]);
 
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="pt-[72px]">
            <NavigationHeader isAuthenticated={isAuthenticated} />
            {/* Hero Section */}
            <HeroSection />

            {/* Features Section */}
            <section className="py-20 bg-primary-50 text-center">
                <h2 className="text-3xl font-semibold text-primary-900 mb-10">Why should you join or event?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 max-w-6xl mx-auto">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-primary-800 mb-2">Keynote Speakers</h3>
                    <p className="text-gray-600">Learn from renowned industry experts and visionaries.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-primary-800 mb-2">Workshops & Panels</h3>
                    <p className="text-gray-600">Interactive sessions to sharpen your skills and expand your knowledge.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-primary-800 mb-2">Networking Opportunities</h3>
                    <p className="text-gray-600">Connect with peers, recruiters, and potential partners.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-primary-800 mb-2">Morden Venue</h3>
                    <p className="text-gray-600">Experience a state-of-the-art venue with cutting-edge technology and comfortable seating.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-primary-800 mb-2">New People</h3>
                    <p className="text-gray-600">Meet new people and make new friends.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-primary-800 mb-2">Certificates</h3>
                    <p className="text-gray-600">Get a certificate of participation after the event.</p>
                </div>
                </div>
            </section>

            {/* Event Section */}
            <EventSection />

            {/* About Section */}
            <AboutSection />

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* Footer CTA */}
            <FooterSection />

            {showScroll && (
                <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg z-50"
                >
                <FaArrowUp size={20} />
                </button>
            )}
        </div>
    )
}