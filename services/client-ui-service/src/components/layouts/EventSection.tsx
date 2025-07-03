import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const EventSection: React.FC = () => {
    return (
        <section id="event-section"className="py-20 bg-primary-50 text-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-primary-900 font-semibold">Event Schedule</p>
              <h2 className="text-4xl font-bold mt-2">Tech & Trade Event Schedule</h2>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <button className="bg-gradient-to-tl from-primary-900 via-primary-800 to-primary-950 text-white px-5 py-2 rounded-full shadow relative">
                Day 01<br /><span className="text-sm font-normal">7th November 2025</span>
                <span className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary-700"></span>
              </button>
              <button className="bg-white border border-gray-300 text-gray-800 px-5 py-2 rounded-full">
                Day 02<br /><span className="text-sm font-normal">8th November 2025</span>
              </button>
              <button className="bg-white border border-gray-300 text-gray-800 px-5 py-2 rounded-full">
                Day 03<br /><span className="text-sm font-normal">9th November 2025</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
                <img
                  src={`/images/background${(index % 3) + 1}.png`}
                  alt="event"
                  className="w-80 h-56 object-cover"
                />
                <div className="flex-1 p-6">
                  <h3 className="text-xl font-semibold mb-2">{index === 0 ? "Events That Leave a Impression" : index === 1 ? "Sparkle & Shine on Celebrations" : "Sparkle & Shine Events"}</h3>
                  <p className="text-gray-600 mb-4">A personal portfolio is a curated collection of an individual's professional work</p>
                  <a href="#" className="text-primary-700 font-medium inline-flex items-center gap-1 hover:underline">
                    Read More <span className="ml-1">→</span>
                  </a>
                </div>
                <div className="md:w-1/4 border-t md:border-t-0 md:border-l border-gray-200 p-6 flex flex-col justify-center gap-4">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-primary-500 mt-1" />
                    <span className="text-sm">Tafawa Balewa Square, Lagos, Nigeria</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCalendarAlt className="text-primary-500 mt-1" />
                    <span className="text-sm">10 AM to 10 PM<br />{`${(index % 3) + 7}th November 2025`}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
}

export default EventSection;
