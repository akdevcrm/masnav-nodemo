import React, { useState, useEffect } from 'react';
import { FaPlane, FaUser, FaMinus, FaPlus, FaPlusCircle, FaTimesCircle, FaHeart, FaCog, FaMoon, FaSun, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './custom-datepicker.css';

type TripType = 'roundTrip' | 'oneWay' | 'multiDestination' | 'hotelSearch';
type Destination = {
  from: string;
  destination: string;
  to: string;
  date: string;
};

function App() {
  const [tripType, setTripType] = useState<TripType>('roundTrip');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [destination, setDestination] = useState('');
  const [roundTripDepartureDate, setRoundTripDepartureDate] = useState<Date | null>(null);
  const [roundTripReturnDate, setRoundTripReturnDate] = useState<Date | null>(null);
  const [oneWayDepartureDate, setOneWayDepartureDate] = useState<Date | null>(null);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [hotelSearchCheckInDate, setHotelSearchCheckInDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);  
  const [rooms, setRooms] = useState(tripType === 'hotelSearch' ? 1 : 1);
  const [travelingWithPets, setTravelingWithPets] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([
    { from: '', to: '', date: '', destination: '' }
  ]);
  const [hotelSearchCheckOutDate, setHotelSearchCheckOutDate] = useState<Date | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    if (tripType === 'hotelSearch'|| tripType === 'multiDestination' ) {
      setRooms(1);
    } else {
      setRooms(0);
    }
  }, [tripType]);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const searchParams = {
      tripType,
      from,
      to,
      destination: tripType === 'hotelSearch' ? destination : null,
      departureDate: tripType === 'roundTrip' ? roundTripDepartureDate : oneWayDepartureDate,
      returnDate: tripType === 'roundTrip' ? roundTripReturnDate : null,
      checkInDate: tripType === 'hotelSearch' ? hotelSearchCheckInDate : null,
      checkOutDate: tripType === 'hotelSearch' ? hotelSearchCheckOutDate : null,
      adults,
      children,
      rooms,
      travelingWithPets,
      destinations
    } as any;

    if (tripType === 'multiDestination' || (from && to && (tripType === 'roundTrip' ? roundTripDepartureDate : oneWayDepartureDate))) {
      navigate('/flights', { state: searchParams });
    } else if (tripType === 'hotelSearch') {
      navigate('/hotels', { state: searchParams });
    } else {
      navigate('/hotels', { state: searchParams });
    }
  };

  const handleIncrement = (setter: React.Dispatch<React.SetStateAction<number>>, max: number) => {
    setter(prev => Math.min(prev + 1, max));
  };

  const handleDecrement = (setter: React.Dispatch<React.SetStateAction<number>>, min: number) => {
    setter(prev => {
      const newValue = prev - 1;
      return Math.max(newValue, min);
    });
  };

  const addDestination = () => {
    setDestinations([...destinations, { from: '', to: '', date: '', destination: '' }]);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index));
    }
  };

  const updateDestination = (index: number, field: keyof Destination, value: string) => {
    const newDestinations = [...destinations];
    newDestinations[index] = { ...newDestinations[index], [field]: value };
    setDestinations(newDestinations);
  };

  const getDayClassName = (date: Date) => {
    let isSelected = false;
    let isBetween = false;

    if (tripType === 'roundTrip' && roundTripDepartureDate && roundTripReturnDate) {
      isSelected = roundTripDepartureDate.getTime() === date.getTime() || roundTripReturnDate.getTime() === date.getTime();
      isBetween = date > roundTripDepartureDate && date < roundTripReturnDate;
    } else if (tripType === 'oneWay' && oneWayDepartureDate) {
      isSelected = oneWayDepartureDate.getTime() === date.getTime();
    } else if (tripType === 'hotelSearch' && hotelSearchCheckInDate && hotelSearchCheckOutDate) {
      isSelected = hotelSearchCheckInDate.getTime() === date.getTime() || hotelSearchCheckOutDate.getTime() === date.getTime();
      isBetween = date > hotelSearchCheckInDate && date < hotelSearchCheckOutDate;
    }

    return isSelected
      ? (darkMode ? 'react-datepicker__day--selected-dark' : 'react-datepicker__day--selected-light')
      : isBetween ? (darkMode ? 'react-datepicker__day--in-range-dark' : 'react-datepicker__day--in-range-light') : '';
  };

  const filterPassedDay = (date: Date) => {
    const currentDate = new Date();
    return date >= currentDate;
  };

  const handleRoundTripDepartureDateChange = (date: Date | null) => {
    setRoundTripDepartureDate(date);
    if (roundTripReturnDate && date && roundTripReturnDate < date) {
      setRoundTripReturnDate(null);
    }
  };

  const handleRoundTripReturnDateChange = (date: Date | null) => {
    if (roundTripDepartureDate && date && date < roundTripDepartureDate) {
      setRoundTripReturnDate(null);
    } else {
      setRoundTripReturnDate(date);
    }
  };

  const handleOneWayDepartureDateChange = (date: Date | null) => {
    setOneWayDepartureDate(date);
  };

  const handleHotelSearchCheckInDateChange = (date: Date | null) => {
    setHotelSearchCheckInDate(date);
  };

  const getMultiDestinationDayClassName = (index: number, date: Date) => {
    const isSelected = destinations[index]?.date && new Date(destinations[index].date).getTime() === date.getTime();
    const isBetween = index > 0 && destinations[index - 1]?.date && destinations[index]?.date && date > new Date(destinations[index - 1].date) && date < new Date(destinations[index].date);
    return isSelected
      ? (darkMode ? 'react-datepicker__day--selected-dark' : 'react-datepicker__day--selected-light')
      : isBetween ? (darkMode ? 'react-datepicker__day--in-range-dark' : 'react-datepicker__day--in-range-light') : '';
  };

  const filterMultiDestinationPassedDay = (index: number, date: Date) => {
    const currentDate = new Date();
    if (index > 0 && destinations[index - 1]?.date) {
      return date >= new Date(destinations[index - 1].date);
    }
    return date >= currentDate;
  };

  const handleHotelSearchCheckOutDateChange = (date: Date | null) => {
    setHotelSearchCheckOutDate(date);
  };

  const handleMultiDestinationDateChange = (index: number, date: Date | null) => {
    const newDestinations = [...destinations];
    newDestinations[index] = { ...newDestinations[index], date: date ? date.toLocaleDateString('en-US') : '' };
    setDestinations(newDestinations);
  };

const filterReturnDate = (date: Date) => {
  const today = new Date();
  return date > today; 
};

  const filterHotelSearchDate = (date: Date) => {
    if (hotelSearchCheckInDate) {
      return date >= hotelSearchCheckInDate;
    }
    return true;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} flex flex-col items-center px-4`}>
      {/* Icons Section */}
      <div className="absolute top-4 left-4 flex space-x-4">
        <button onClick={toggleDarkMode} className={`text-gray-600 hover:text-[#4b0086] transition-colors ${darkMode ? 'dark:text-[#bb44f0] dark:hover:text-white' : ''}`}>
          {darkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
        </button>
        <button onClick={() => navigate('/favorites')} className={`text-gray-600 hover:text-[#4b0086] transition-colors ${darkMode ? 'dark:text-[#bb44f0] dark:hover:text-white' : ''}`}>
          <FaHeart size={24} />
        </button>
        <button onClick={() => navigate('/settings')} className={`text-gray-600 hover:text-[#4b0086] transition-colors ${darkMode ? 'dark:text-[#bb44f0] dark:hover:text-white' : ''}`}>
          <FaCog size={24} />
        </button>
        <button onClick={() => navigate('/poi')} className={`text-gray-600 hover:text-[#4b0086] transition-colors ${darkMode ? 'dark:text-[#bb44f0] dark:hover:text-white' : ''}`}>
          <FaStar size={24} />
        </button>
      </div>
      {/* Logo Section */}
      <div className="mt-32 mb-8">
        <h1 className={`text-4xl md:text-6xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Master Navigator
        </h1>
      </div>

      {/* Search Form */}
      <div className="w-full max-w-3xl">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Trip Type Selector */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              type="button"
              onClick={() => setTripType('roundTrip')}
              className={`px-6 py-2 rounded-full ${
                tripType === 'roundTrip'
                  ? `${darkMode ? 'bg-[#bb44f0] text-white border-2 border-[#bb44f0]' : 'bg-[#4b0086] text-white'}`
                  : `${darkMode ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:border-[#bb44f0] dark:hover:text-[#bb44f0]' : 'bg-white text-gray-600 border border-gray-300 hover:border-[#4b0086] hover:text-[#4b0086]'}`
              }`}
            >
              Round Trip
            </button>
            <button
              type="button"
              onClick={() => setTripType('oneWay')}
              className={`px-6 py-2 rounded-full ${
                tripType === 'oneWay'
                  ? `${darkMode ? 'bg-[#bb44f0] text-white border-2 border-[#bb44f0]' : 'bg-[#4b0086] text-white'}`
                  : `${darkMode ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:border-[#bb44f0] dark:hover:text-[#bb44f0]' : 'bg-white text-gray-600 border border-gray-300 hover:border-[#4b0086] hover:text-[#4b0086]'}`
              }`}
            >
              One Way
            </button>
            <button
              type="button"
              onClick={() => setTripType('multiDestination')}
              className={`px-6 py-2 rounded-full ${
                tripType === 'multiDestination'
                  ? `${darkMode ? 'bg-[#bb44f0] text-white border-2 border-[#bb44f0]' : 'bg-[#4b0086] text-white'}`
                  : `${darkMode ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:border-[#bb44f0] dark:hover:text-[#bb44f0]' : 'bg-white text-gray-600 border border-gray-300 hover:border-[#4b0086] hover:text-[#4b0086]'}`
              }`}
            >
              Multi-Destination
            </button>
            <button
              type="button"
              onClick={() => setTripType('hotelSearch')}
              className={`px-6 py-2 rounded-full ${
                tripType === 'hotelSearch'
                  ? `${darkMode ? 'bg-[#bb44f0] text-white border-2 border-[#bb44f0]' : 'bg-[#4b0086] text-white'}`
                  : `${darkMode ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:border-[#bb44f0] dark:hover:text-[#bb44f0]' : 'bg-white text-gray-600 border border-gray-300 hover:border-[#4b0086] hover:text-[#4b0086]'}`
              }`}
            >
              Hotel Search
            </button>
          </div>

          {tripType !== 'multiDestination' && tripType !== 'hotelSearch' && (
            <>
              {/* From and To Fields */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    onFocus={() => setFocusedInput('from')}
                    onBlur={() => setFocusedInput(null)}
                    className={`w-full px-12 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none text-lg ${darkMode ? 'bg-gray-700 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
                    placeholder="From"
                  />
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                    focusedInput === 'from' || from ? (darkMode ? 'text-[#bb44f0]' : 'text-[#4b0086]') : `${darkMode ? 'text-gray-500' : 'text-gray-400'}`
                  }`}>
                    <FaPlane size={20} />
                  </div>
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    onFocus={() => setFocusedInput('to')}
                    onBlur={() => setFocusedInput(null)}
                    className={`w-full px-12 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none text-lg ${darkMode ? 'bg-gray-700 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
                    placeholder="To"
                  />
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                    focusedInput === 'to' || to ? (darkMode ? 'text-[#bb44f0]' : 'text-[#4b0086]') : `${darkMode ? 'text-gray-500' : 'text-gray-400'}`
                  }`}>
                    <FaPlane size={20} />
                  </div>
                </div>
              </div>

              {/* Date Fields */}
              <div className="flex gap-4 mt-4">
                <div className="flex-1 relative">
                  <label className={`block text-sm font-medium mb-1 ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Departure Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={tripType === 'roundTrip' ? roundTripDepartureDate : oneWayDepartureDate}
                      onChange={(date) => tripType === 'roundTrip' ? handleRoundTripDepartureDateChange(date) : handleOneWayDepartureDateChange(date)}
                      className={`w-full px-6 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none text-lg ${darkMode ? 'bg-gray-700 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
                      placeholderText="mm/dd/yyyy"
                      dateFormat="MM/dd/yyyy"
                      dayClassName={getDayClassName}
                      filterDate={filterPassedDay}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-2.25m18 2.25v-2.25M5.25 10.5h13.5" />
                      </svg>
                    </div>
                  </div>
                </div>
                {tripType === 'roundTrip' && (
                  <div className="flex-1 relative">
                    <label className={`block text-sm font-medium mb-1 ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Return Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={roundTripReturnDate}
                        onChange={handleRoundTripReturnDateChange}
                        className={`w-full px-6 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none text-lg ${darkMode ? 'bg-gray-700 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
                        placeholderText="mm/dd/yyyy"
                        dateFormat="MM/dd/yyyy"
                        dayClassName={getDayClassName}
                        filterDate={filterReturnDate}
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-2.25m18 2.25v-2.25M5.25 10.5h13.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {tripType === 'hotelSearch' && (
            <>
              {/* Destination Field */}
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onFocus={() => setFocusedInput('destination')}
                  onBlur={() => setFocusedInput(null)}
                  className={`w-full px-12 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none text-lg ${darkMode ? 'bg-gray-700 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
                  placeholder="Destination"
                />
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                  focusedInput === 'destination' || destination ? (darkMode ? 'text-[#bb44f0]' : 'text-[#4b0086]') : `${darkMode ? 'text-gray-500' : 'text-gray-400'}`
                }`}>
                  <FaMapMarkerAlt size={20} />
                </div>
              </div>

              {/* Check-In and Check-Out Date Fields */}
              <div className="flex gap-4 mt-4">
                <div className="flex-1 relative">
                  <label className={`block text-sm font-medium mb-1 ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Check-In Date
                  </label>
                  <DatePicker
                    selected={hotelSearchCheckInDate}
                    onChange={handleHotelSearchCheckInDateChange}
                    className={`w-full px-6 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none text-lg ${darkMode ? 'bg-gray-700 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
                    placeholderText="mm/dd/yyyy"
                    dateFormat="MM/dd/yyyy"
                    filterDate={filterPassedDay}
                    dayClassName={getDayClassName}
                  />
                </div>
                <div className="flex-1 relative">
                  <label className={`block text-sm font-medium mb-1 ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Check-Out Date
                  </label>
                  <DatePicker
                    selected={hotelSearchCheckOutDate}
                    onChange={handleHotelSearchCheckOutDateChange}
                    className={`w-full px-6 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none text-lg ${darkMode ? 'bg-gray-700 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
                    placeholderText="mm/dd/yyyy"
                    dateFormat="MM/dd/yyyy"
                    filterDate={filterHotelSearchDate}
                    dayClassName={getDayClassName}
                  />
                </div>
              </div>
            </>
          )}

          {tripType === 'multiDestination' && (
            /* Multi-Destination Fields */
            <div className="space-y-4">
              {destinations.map((dest, index) => (
                <div key={index} className={`relative space-y-4 p-4 rounded-lg border border-gray-200 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Flight {index + 1}</span>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeDestination(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FaTimesCircle size={20} />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={dest.from}
                      onChange={(e) => updateDestination(index, 'from', e.target.value)}
                      onFocus={() => setFocusedInput(`from-${index}`)}
                      onBlur={() => setFocusedInput(null)}
                      className={`w-full px-12 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none text-lg ${darkMode ? 'bg-gray-700 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
                      placeholder="From"
                    />
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                      focusedInput === `from-${index}` || dest.from ? (darkMode ? 'text-[#bb44f0]' : 'text-[#4b0086]') : `${darkMode ? 'text-gray-500' : 'text-gray-400'}`
                    }`}>
                      <FaPlane size={20} />
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={dest.to}
                      onChange={(e) => updateDestination(index, 'to', e.target.value)}
                      onFocus={() => setFocusedInput(`to-${index}`)}
                      onBlur={() => setFocusedInput(null)}
                      className={`w-full px-12 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none text-lg ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-800'} ${focusedInput === `to-${index}` ? (darkMode ? 'dark:focus:border-[#bb44f0]' : 'focus:border-[#4b0086]') : ''}`}
                      placeholder="To"
                    />
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                      focusedInput === `to-${index}` || dest.to ? (darkMode ? 'text-[#bb44f0]' : 'text-[#4b0086]') : `${darkMode ? 'text-gray-500' : 'text-gray-400'}`
                    }`}>
                      <FaPlane size={20} />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date
                    </label>
                    <DatePicker
                      selected={dest.date ? new Date(dest.date) : null}
                      onChange={(date) => handleMultiDestinationDateChange(index, date)}
                      className={`w-full px-6 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none text-lg ${darkMode ? 'bg-gray-700 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
                      placeholderText="mm/dd/yyyy"
                      dateFormat="MM/dd/yyyy"
                      dayClassName={(date) => getMultiDestinationDayClassName(index, date)}
                      filterDate={(date) => filterMultiDestinationPassedDay(index, date)}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addDestination}
                className={`flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#4b0086] hover:text-[#4b0086] transition-colors ${darkMode ? 'dark:hover:border-[#bb44f0] dark:hover:text-[#bb44f0]' : ''}`}
              >
                <FaPlusCircle className="mr-2" />
                Add Another Flight
              </button>
            </div>
          )}

          {/* Guest Selector Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowGuestSelector(!showGuestSelector)}
              className={`w-full px-12 py-4 rounded-full border border-gray-300 text-left flex items-center justify-between ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-800'}`}
            >
              <div className="flex items-center">
                <FaUser className="mr-2" />
                <span>{adults} adults • {children} children • {rooms} room{rooms !== 1 ? 's' : ''}</span>
              </div>
              <span className="text-gray-400 dark:text-gray-500">▼</span>
            </button>

            {/* Guest Selector Popup */}
            {showGuestSelector && (
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg border border-gray-200 p-4 z-10 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                {/* Adults */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-lg ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Adults</span>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleDecrement(setAdults, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600"
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className={`w-8 text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{adults}</span>
                    <button
                      type="button"
                      onClick={() => handleIncrement(setAdults, 10)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                </div>

                    {/* Children */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-lg ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Children</span>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => handleDecrement(setChildren, 0)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className={`w-8 text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{children}</span>
                        <button
                          type="button"
                          onClick={() => handleIncrement(setChildren, 10)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </div>
    
                    {/* Rooms */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-lg ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Rooms</span>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => handleDecrement(setRooms, tripType === 'hotelSearch' ? 1 : 0)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className={`w-8 text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{rooms}</span>
                        <button
                          type="button"
                          onClick={() => handleIncrement(setRooms, 10)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </div>
    
                    {/* Pets Toggle */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className={`text-lg block ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Traveling with pets?</span>
                        <span className={`text-sm text-gray-500 block ${darkMode ? 'text-gray-400' : ''}`}>
                          Assistance animals aren't considered pets.
                        </span>
                        <a href="#" className={`text-[#4b0086] text-sm hover:underline ${darkMode ? 'dark:text-[#bb44f0]' : ''}`}>
                          Read more about traveling with assistance animals
                        </a>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={travelingWithPets}
                          onChange={(e) => setTravelingWithPets(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4b0086]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-800 after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4b0086] ${darkMode ? 'peer-checked:bg-[#bb44f0]' : ''}`}></div>
                      </label>
                    </div>
    
                    {/* Done Button */}
                    <button
                      type="button"
                      onClick={() => setShowGuestSelector(false)}
                      className={`w-full py-2 rounded-lg hover:opacity-90 transition-colors ${darkMode ? 'bg-[#bb44f0] text-white' : 'bg-[#4b0086] text-white'}`}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
    
              {/* Search Button */}
              <button
                type="submit"
                className={`w-full py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-colors mt-6 ${darkMode ? 'bg-[#bb44f0] text-white' : 'bg-[#4b0086] text-white'}`}
              >
                SEARCH TRIP
              </button>
            </form>
          </div>
    
          {/* Footer */}
          <footer className="mt-auto py-4 text-center text-gray-600 dark:text-gray-400">
            <p>© 2025 Attention Keeper | CRM</p>
          </footer>
        </div>
      );
    }
    
    export default App;
