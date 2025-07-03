import { useNavigate } from "react-router-dom";

const AboutSection: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="py-20 bg-primary-50">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                    <img
                    src="/images/tbs-lagos.jpg"
                    alt="About Event"
                    className="rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500 border-4 border-primary-100"
                    />
                </div>
                <div>
                    <h2 className="text-4xl font-extrabold text-primary-900 mb-6 leading-snug">Lagos Chamber of Commerce and Industry</h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                    Founded in 1888, the Lagos Chamber of Commerce and Industry is the Premier Chamber of Commerce in Nigeria.
                    Incorporated in 1950 as a non-profit organization, LCCI promotes the interests of the business community in Lagos and across Nigeria.
                    </p>
                    <button
                    onClick={() => navigate("/about")}
                    className="mt-8 bg-primary-600 hover:bg-primary-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300"
                    >
                    Learn More
                    </button>
                </div>
            </div>

            {/* Partners Slider */}
            <div className="mt-20">
                <h3 className="text-2xl font-semibold text-center text-primary-900 mb-8">Our Partners</h3>
                    <div className="overflow-hidden relative">
                        <div className="flex space-x-12 px-6 overflow-x-auto scrollbar-hide md:justify-center">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <img
                            key={num}
                            src={`/images/partner${num}.png`}
                            alt={`Partner ${num}`}
                            className="h-20 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection;