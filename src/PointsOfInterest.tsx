import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSearch, FaSyncAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';

interface PointOfInterest {
  id: string;
  name: string;
  location: string;
  icon: React.ReactNode;
}

interface Activity {
  id: string;
  name: string;
  icon: React.ReactNode;
  description?: string;
}

function PointsOfInterest() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [tripPurpose, setTripPurpose] = useState<any>(null);
  const [mostBooked, setMostBooked] = useState<any>(null);
  const [mostTraveled, setMostTraveled] = useState<any>(null);
  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[] | null>(null);
  const [popularActivities, setPopularActivities] = useState<Activity[] | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const { darkMode } = useTheme();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const fetchInsightsData = async () => {
    setLoadingInsights(true);
    // Mock API calls - Replace with actual Amadeus API calls
    const fetchTripPurpose = async () => {
      // amadeus.travel.predictions.trip_purpose.get(...)
      setTripPurpose(null);
    };

    const fetchAirTrafficAnalytics = async () => {
      // amadeus.travel.analytics.air_traffic.booked.get(...)
      setMostBooked(null);
      // amadeus.travel.analytics.air_traffic.traveled.get(...)
      setMostTraveled(null);
    };

    await Promise.all([fetchTripPurpose(), fetchAirTrafficAnalytics()]);
    setLoadingInsights(false);
  };

  useEffect(() => {
    fetchInsightsData();

    const fetchPointsOfInterest = async () => {
      // amadeus.reference data.locations.points of _interest.get(...)
      setPointsOfInterest(null);
    };

    const fetchPopularActivities = async () => {
      // amadeus.shopping.activities.get(...)
      setPopularActivities(null);
    };

    fetchPointsOfInterest();
    fetchPopularActivities();
  }, []);

  const handleActivityClick = async (activityId: string) => {
    // amadeus.shopping.activity(activityId).get()
setSelectedActivity({ 
  id: activityId, 
  name: 'Activity Details', 
  description: 'Mock description for activity ' + activityId, 
  icon: <FaArrowLeft /> // Example icon, replace as needed
});
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} flex flex-col items-center px-4`}>
      {/* Header */}
      <div className="w-full max-w-3xl mt-8 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className={`text-gray-600 hover:text-[#4b0086] transition-colors ${darkMode ? 'dark:text-gray-300 dark:hover:text-[#bb44f0]' : 'hover:text-[#4b0086]'}`}>
          <FaArrowLeft size={24} />
        </button>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Explore the World</h1>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-3xl mt-4 relative">
        <input
          type="text"
          placeholder="Search points of interest..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={`w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none pl-10 ${darkMode ? 'bg-gray-700 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
        />
        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <FaSearch />
        </div>
      </div>

      {/* Content Sections */}
      <div className="w-full max-w-3xl mt-8 space-y-6">
        {/* Travel Insights and Analytics */}
        <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 003 10.5m18 0v2.25a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25V10.5" />
                </svg>
              </span>
              Travel Insights and Analytics
            </h2>
            <button
              onClick={fetchInsightsData}
              disabled={loadingInsights}
              className={`text-gray-500 hover:text-[#4b0086] transition-colors ${darkMode ? 'dark:text-gray-400 dark:hover:text-[#bb44f0]' : 'hover:text-[#4b0086]'} ${loadingInsights ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaSyncAlt className="animate-spin" />
            </button>
          </div>
          {tripPurpose && (
            <div className="mb-4">
              <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Trip Purpose Prediction</h3>
              <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                Predicted Purpose: <span className="font-medium">{tripPurpose.prediction}</span> (Confidence: {tripPurpose.confidence})
              </p>
            </div>
          )}
          {mostBooked && (
            <div className="mb-4">
              <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Most Booked Routes</h3>
              <ul className="text-gray-600 dark:text-gray-300">
                {mostBooked?.map((item: any) => (
                  <li key={item.route} className="flex items-center">
                    {item.icon}
                    {item.route} <span className="font-medium">({item.count} bookings)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {mostTraveled && (
            <div>
              <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Most Traveled Routes</h3>
              <ul className="text-gray-600 dark:text-gray-300">
                {mostTraveled?.map((item: any) => (
                  <li key={item.route} className="flex items-center">
                    {item.icon}
                    {item.route} <span className="font-medium">({item.count} travelers)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Points of Interest */}
        <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </span>
            Points of Interest
          </h2>
          {pointsOfInterest && (
            <ul className="text-gray-600 dark:text-gray-300">
              {pointsOfInterest.map((poi: any) => (
                <li key={poi.id} className="flex items-center">
                  {poi.icon}
                  {poi.name} <span className="font-medium">({poi.location})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tours and Activities */}
        <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-1.09l.377-1.32a2.25 2.25 0 012.163-1.632V12.553zm0 0H3m18 0a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25V12.553z" />
              </svg>
            </span>
            Tours and Activities
          </h2>
          {popularActivities && (
            <ul className="text-gray-600 dark:text-gray-300">
              {popularActivities.map((activity: any) => (
                <li key={activity.id} className="flex items-center">
                  {activity.icon}
                  <button onClick={() => handleActivityClick(activity.id)} className={`text-[#4b0086] hover:underline ${darkMode ? 'dark:text-[#bb44f0]' : ''}`}>
                    {activity.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selectedActivity && (
            <div className="mt-4">
              <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Activity Details</h3>
              <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                {selectedActivity.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PointsOfInterest;
