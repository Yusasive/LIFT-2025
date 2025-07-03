import React from 'react';
import NavigationHeader from '@/components/navigation/NavigationHeader';
import { useUser } from '@/context/UserContext';
import { FaGlobeAfrica, FaHandshake, FaUsers, FaBullhorn } from 'react-icons/fa';
import FooterSection from '@/components/layouts/FooterSection';

const About: React.FC = () => {
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
            <NavigationHeader isAuthenticated={!!user} />

            {/* Hero Section */}
            <div className="relative w-full h-80 flex items-center justify-center bg-gradient-to-r from-green-900/90 to-green-700/80">
                <div className="absolute inset-0 bg-[url('/images/background3.png')] bg-cover bg-center opacity-20" />
                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-5xl font-extrabold mb-2 drop-shadow-lg">The Lagos International Trade Fair</h1>
                    <p className="text-lg md:text-2xl font-medium max-w-2xl mx-auto drop-shadow">Nigeria's Premier Platform for Trade, Innovation, and Business Networking</p>
                </div>
            </div>

            {/* Main Content Card */}
            <section className="max-w-3xl mx-auto -mt-16 bg-white rounded-3xl shadow-xl p-8 md:p-12 relative z-20">
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="flex-1 flex items-center gap-4">
                        <FaGlobeAfrica className="text-green-700 text-3xl" />
                        <div>
                            <h2 className="text-xl font-bold text-green-800 mb-1">Largest International Trade Fair in Nigeria</h2>
                            <p className="text-gray-700">Held annually since 1981, attracting exhibitors and visitors from all over the world.</p>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                        <FaHandshake className="text-red-500 text-3xl" />
                        <div>
                            <h2 className="text-xl font-bold text-red-600 mb-1">Business & Networking</h2>
                            <p className="text-gray-700">A hub for top organizations, policy makers, and professionals to connect and collaborate.</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="flex-1 flex items-center gap-4">
                        <FaUsers className="text-green-700 text-3xl" />
                        <div>
                            <h2 className="text-xl font-bold text-green-800 mb-1">Diverse Participation</h2>
                            <p className="text-gray-700">Open to local and foreign exhibitors, with growing interest and attendance every year.</p>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                        <FaBullhorn className="text-red-500 text-3xl" />
                        <div>
                            <h2 className="text-xl font-bold text-red-600 mb-1">Wide Publicity</h2>
                            <p className="text-gray-700">Extensive media coverage and unique opportunities for product and service promotion.</p>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-2xl font-semibold text-green-800 mb-4">About the Fair</h3>
                    <p className="mb-4 text-gray-800 text-lg">
                        The Lagos International Trade Fair is the largest International Trade Fair in Nigeria. The spectacular 10-day event usually begins on the first Friday in November of every year, since 1981. The Lagos Chamber of Commerce and Industry (LCCI) took over the organisation of the fair in 1986 and has been staging the fair annually to date.
                    </p>
                    <p className="mb-4 text-gray-700">
                        Since then, the Lagos International Trade Fair has grown tremendously in popularity to become the leading forum for Trade and Business promotion in Nigeria, and indeed Africa. The Chamber is uniquely aware of the high standards expected of an International Trade Fair, and it is, therefore, constantly striving to live up to this expectation. Moreover, the Chamber comprises the "crème de la crème" of Nigeria's top business organisations and personalities, who are able, willing and ready to enter business interactions with their counterparts all over the world.
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Accessible location in Lagos, the commercial and industrial heartland of Nigeria.</li>
                        <li>Supported by Federal and Lagos State Governments, and the private sector.</li>
                        <li>Opportunities for sector groups and professionals to present new products and ideas.</li>
                        <li>Hospitality and tourism programs for foreign visitors.</li>
                        <li>Assistance from experienced Trade Promotion Board members and LCCI staff.</li>
                    </ul>
                    <p className="mb-4 text-gray-700">
                        The Fair brings into focus the full potentials and business opportunities existing in Nigeria, with eminent dignitaries and policy makers attending throughout its duration.
                    </p>
                </div>
            </section>
            <FooterSection />
        </div>
    );
};

export default About; 