import { FaEnvelope, FaPhone, FaFacebook, FaInstagram, FaGlobe, FaTwitter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const FooterSection: React.FC = () => {
    const navigate = useNavigate();

    const handleTestimonials = () => {
      if (location.pathname === '/') {
        const testimonialSection = document.getElementById('testimonial-section');
        if (testimonialSection) {
          testimonialSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/', { state: { scrollToTestimonials: true } });
      }
    };
    return (
        <footer className="bg-primary-900 text-white pt-16 pb-4 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
                {/* Logo and About */}
                <div className="md:col-span-2 flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2">
                        <img src="/images/litf_logo.png" alt="LITF Logo" className="w-16 h-16 rounded-lg bg-white p-2" />
                        <span className="text-2xl font-extrabold text-white">LITF</span>
                    </div>
                    <p className="text-primary-100 text-sm max-w-xs">
                        The Lagos International Trade Fair is Nigeria's premier platform for trade, innovation, and business networking, held annually in Lagos.
                    </p>
                    <div className="flex gap-4 mt-2">
                        <a href="https://www.facebook.com/lagoschamber" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors"><FaFacebook className="text-2xl" /></a>
                        <a href="https://www.instagram.com/lagos_tradefair" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors"><FaInstagram className="text-2xl" /></a>
                        <a href="https://www.x.com/lagoschamber88" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors"><FaTwitter className="text-2xl" /></a>
                    </div>
                </div>
                {/* Quick Links */}
                <div>
                    <h3 className="text-xl font-bold mb-4 text-red-500">Quick Links</h3>
                    <ul className="space-y-2">
                        <li><button onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-red-400 transition-colors">Home</button></li>
                        <li><button onClick={() => navigate('/about')} className="hover:text-red-400 transition-colors">About Us</button></li>
                        <li><button onClick={() => navigate('/select-role')} className="hover:text-red-400 transition-colors">Become a Participant</button></li>
                        <li><button onClick={() => navigate('/#')} className="hover:text-red-400 transition-colors">FAQs</button></li>
                    </ul>
                </div>
                {/* Exhibitors */}
                <div>
                    <h3 className="text-xl font-bold mb-4 text-red-500">Exhibitors</h3>
                    <ul className="space-y-2">
                        <li><button onClick={handleTestimonials} className="hover:text-red-400 transition-colors">Testimonials</button></li>
                        <li><button onClick={() => navigate('/select-role')} className="hover:text-red-400 transition-colors">Registration</button></li>
                        <li><button onClick={() => navigate('/select-role')} className="hover:text-red-400 transition-colors">Booth Booking</button></li>
                        <li><button onClick={() => navigate('/terms')} className="hover:text-red-400 transition-colors">Terms & Conditions</button></li>
                    </ul>
                </div>
                {/* Contact */}
                <div>
                    <h3 className="text-xl font-bold mb-4 text-red-500">Contact Us</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                            <FaEnvelope className="text-red-400" />
                            <a href="mailto:litf@lagoschamber.com" className="hover:underline">litf@lagoschamber.com</a>
                        </li>
                        <li className="flex items-center gap-3">
                            <FaPhone className="text-red-400" />
                            <a href="tel:+2347005246724" className="hover:underline">+234 700 524 6724</a>
                        </li>
                        <li className="flex items-center gap-3">
                            <FaGlobe className="text-red-400" />
                            <a href="https://www.lagoschamber.com" target="_blank" rel="noopener noreferrer" className="hover:underline">www.lagoschamber.com</a>
                        </li>
                        <li className="flex items-center gap-3">
                            <FaGlobe className="text-red-400" />
                            <a
                                href="https://www.lagosinternationaltradefair.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline truncate max-w-[180px] block"
                                title="https://www.lagosinternationaltradefair.com"
                            >
                                www.lagosinternationaltradefair.com
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-primary-700 mt-10 pt-6 text-center text-primary-200 text-sm">
                &copy; {new Date().getFullYear()} Lagos International Trade Fair. All rights reserved.
            </div>
        </footer>
    )
}

export default FooterSection;
