import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { calculateTimeLeft } from "../../utils/utils";
import { FaCalendarAlt } from "react-icons/fa";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const slides = [
    {
      image: "/images/background4.jpg",
      title: "Celebrate",
      highlight: "Life's Special",
      subtitle: "Moments",
      description: "Showcase, Connect, and Discover – A hub of innovation across industries.",
    },
    {
      image: "/images/background1.jpg",
      title: "Empower",
      highlight: "Business Leaders",
      subtitle: "In Africa",
      description: "Network with pioneers and unlock the future of trade and industry.",
    },
    {
      image: "/images/background8.jpg",
      title: "Innovate",
      highlight: "With Bold Ideas",
      subtitle: "That Shape Tomorrow",
      description: "Collaborate and create impact across communities and markets.",
    },
  ];

const HeroSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  return (
    <section className="relative flex flex-col md:flex-row items-center justify-between min-h-[90vh] py-8 md:py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white px-6 md:px-16 overflow-x-hidden">
        <div className="flex-1 z-10 max-w-xl mb-8 md:mb-0">
          <div className="relative h-[300px] overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute w-full transition-all duration-1000 ${
                  current === index
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-full'
                }`}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  {slide.title}{" "}
                  <span className="bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
                    {slide.highlight}
                  </span>
                  <br />{slide.subtitle}
                </h1>
                <p className="text-base md:text-lg mt-4 text-gray-300">{slide.description}</p>
              </div>
            ))}
          </div>

          {/* Countdown and Event Date */}
          <div className="mt-6 md:mt-8">
            <div className="flex items-center text-sm md:text-lg mb-4 flex-wrap">
              <FaCalendarAlt className="mr-2 text-primary-400 flex-shrink-0" /> 
              <span className="break-words">November 7th – 16th, 2025 • Tafawa Balewa Square, Lagos</span>
            </div>
            <div className="bg-black bg-opacity-60 px-2 py-3 md:p-6 rounded-2xl flex gap-2 md:gap-6 text-center shadow-lg w-full max-w-xs sm:max-w-md md:max-w-xl mx-auto">
              <div className="flex-1 min-w-0">
                <p className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-extrabold text-red-500 drop-shadow-lg">{timeLeft.days}</p>
                <p className="uppercase text-[10px] sm:text-xs md:text-lg font-semibold tracking-wider text-red-400">Days</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-extrabold text-primary-500 drop-shadow-lg">{timeLeft.hours}</p>
                <p className="uppercase text-[10px] sm:text-xs md:text-lg font-semibold tracking-wider">Hours</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-extrabold text-primary-500 drop-shadow-lg">{timeLeft.minutes}</p>
                <p className="uppercase text-[10px] sm:text-xs md:text-lg font-semibold tracking-wider">Minutes</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-extrabold text-primary-500 drop-shadow-lg">{timeLeft.seconds}</p>
                <p className="uppercase text-[10px] sm:text-xs md:text-lg font-semibold tracking-wider">Seconds</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate("/select-role")}
            className="mt-6 border-2 border-primary-500 text-white hover:bg-primary-700 px-6 py-3 rounded-full text-sm md:text-base">
            Book a Booth →
          </button>
        </div>

        <div className="hidden md:flex flex-1 justify-center items-center z-10">
          <div className="relative w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ${
                  current === index
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-full'
                }`}
              >
                <div className={`w-full h-full overflow-hidden shadow-xl ${
                  index === 0 
                    ? 'rounded-[40%] border-4 border-primary-600 rotate-6' 
                    : index === 1 
                    ? 'rounded-[30%] border-4 border-primary-500 rotate-12' 
                    : 'rounded-[20%] border-4 border-primary-400 -rotate-12'
                }`}>
                  <img
                    src={slide.image}
                    alt="Event Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-0 left-0 w-full h-full border-[3px] ${
                    index === 0 
                      ? 'border-primary-400 rounded-[40%] animate-spin-slow' 
                      : index === 1 
                      ? 'border-primary-300 rounded-[30%] animate-spin-slow' 
                      : 'border-primary-200 rounded-[20%] animate-bounce-slow'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </section>
  );
};

export default HeroSection;
