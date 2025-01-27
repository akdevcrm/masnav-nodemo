import { useState } from 'react';
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaHeart, FaTimes } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import StripePayment from './StripePayment';
import PayPalPayment from './PayPalPayment';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useTheme } from './ThemeContext';

interface FlightResult {
  id: number;
  airline: string;
  departure: string;
  arrival: string;
  duration: string;
  route: string;
  price: number;
  type: string;
  provider: string;
  isNonstop: boolean;
}

const ITEMS_PER_PAGE = 20;

function FlightResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = location.state;
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { darkMode } = useTheme();
  const [sortOrder, setSortOrder] = useState('none');
  const [stopsFilter, setStopsFilter] = useState('all');
  const [airlineFilter, setAirlineFilter] = useState('all');
  const [results, _setResults] = useState<FlightResult[]>([]);

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return applyFilters().slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else {
      navigate('/hotels', { state: searchParams });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleSkipToHotels = () => {
    navigate('/hotels', { state: searchParams });
  };

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const handlePayment = (item: any) => {
    setSelectedItem(item);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setPaymentSuccess(true);
    setTimeout(() => setPaymentSuccess(false), 3000);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  const handleStopsFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStopsFilter(e.target.value);
  };

  const handleAirlineFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAirlineFilter(e.target.value);
  };

  const applyFilters = () => {
    let filteredResults = [...results];

    // Apply airline filter
    if (airlineFilter !== 'all') {
      filteredResults = filteredResults.filter(flight => flight.airline === airlineFilter);
    }

    // Apply stops filter
    if (stopsFilter !== 'all') {
      if (stopsFilter === 'nonstop') {
        filteredResults = filteredResults.filter(flight => flight.isNonstop);
      } else if (stopsFilter === '+1') {
        filteredResults = filteredResults.filter(flight => !flight.isNonstop);
      } else if (stopsFilter === '+2') {
        filteredResults = filteredResults.filter(flight => !flight.isNonstop);
      } else if (stopsFilter === 'more') {
        filteredResults = filteredResults.filter(flight => !flight.isNonstop);
      }
    }

    // Apply sorting
    if (sortOrder !== 'none') {
      filteredResults.sort((a, b) => {
        if (sortOrder === 'price_low_high') {
          return a.price - b.price;
        } else if (sortOrder === 'price_high_low') {
          return b.price - a.price;
        } else if (sortOrder === 'duration_low_high') {
          const durationA = parseInt(a.duration.replace('h ', '').replace('m', ''));
          const durationB = parseInt(b.duration.replace('h ', '').replace('m', ''));
          return durationA - durationB;
        } else if (sortOrder === 'duration_high_low') {
          const durationA = parseInt(a.duration.replace('h ', '').replace('m', ''));
          const durationB = parseInt(b.duration.replace('h ', '').replace('m', ''));
          return durationB - durationA;
        }
        return 0;
      });
    }

    return filteredResults;
  };

  const renderPagination = () => {
    return (
      <div className="flex justify-center items-center space-x-4 mt-6">
        <button
          onClick={handlePrevPage}
          className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:border-[#4b0086] disabled:opacity-50"
          disabled={currentPage === 1}
        >
          <FaChevronLeft className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`} />
        </button>
        <span className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:border-[#4b0086] disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          <FaChevronRight className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`} />
        </button>
      </div>
    );
  };

  const uniqueAirlines = ['all', ...Array.from(new Set(results.map((flight: any) => flight.airline)))];

  return (
    <div className={`min-h-screen flex flex-col items-center px-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="w-full max-w-6xl mt-8 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className={`text-gray-600 hover:text-[#4b0086] transition-colors ${darkMode ? 'dark:text-gray-300 dark:hover:text-[#bb44f0]' : 'hover:text-[#4b0086]'}`}>
          <FaArrowLeft size={24} />
        </button>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Flight Results</h1>
        <button onClick={handleSkipToHotels} className={`text-gray-600 hover:text-[#4b0086] transition-colors ${darkMode ? 'dark:text-gray-300 dark:hover:text-[#bb44f0]' : 'hover:text-[#4b0086]'}`}>
          Skip to Hotels
        </button>
      </div>

      {/* Filters */}
      <div className="w-full max-w-6xl mt-4 flex justify-center space-x-4">
        <select
          value={sortOrder}
          onChange={handleSortChange}
          className={`px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none hover:border-[#4b0086] ${darkMode ? 'bg-gray-700 text-gray-100 dark:hover:border-[#bb44f0]' : 'bg-white text-gray-800 hover:border-[#4b0086]'}`}
        >
          <option value="none">Sort</option>
          <option value="price_low_high">Price: Low to High</option>
          <option value="price_high_low">Price: High to Low</option>
          <option value="duration_low_high">Duration: Low to High</option>
          <option value="duration_high_low">Duration: High to Low</option>
        </select>
        <select
          value={stopsFilter}
          onChange={handleStopsFilterChange}
          className={`px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none hover:border-[#4b0086] ${darkMode ? 'bg-gray-700 text-gray-100 dark:hover:border-[#bb44f0]' : 'bg-white text-gray-800 hover:border-[#4b0086]'}`}
        >
          <option value="all">Stops: All</option>
          <option value="nonstop">Nonstop</option>
          <option value="+1">+1 Stop</option>
          <option value="+2">+2 Stops</option>
          <option value="more">More than 2</option>
        </select>
        <select
          value={airlineFilter}
          onChange={handleAirlineFilterChange}
          className={`px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none hover:border-[#4b0086] ${darkMode ? 'bg-gray-700 text-gray-100 dark:hover:border-[#bb44f0]' : 'bg-white text-gray-800 hover:border-[#4b0086]'}`}
        >
          {uniqueAirlines.map(airline => (
            <option key={airline} value={airline}>{airline === 'all' ? 'Airlines: All' : airline}</option>
          ))}
        </select>
      </div>

      {/* Results Section */}
      <div className="w-full max-w-6xl mt-8 space-y-8">
        {paymentSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-md">
            Payment Successful!
          </div>
        )}
        <div className="space-y-4">
          {getCurrentPageItems().map((flight: any) => (
            <div key={flight.id} className={`border border-gray-200 rounded-lg p-4 relative hover:border-[#bb44f0] ${darkMode ? 'bg-gray-700 dark:border-gray-600' : 'bg-white'}`}>
              <button
                onClick={() => toggleFavorite(flight.id)}
                className={`absolute top-4 left-4 text-gray-400 transition-colors hover:text-red-500 ${favorites.has(flight.id) ? 'text-red-500' : ''} ${darkMode && favorites.has(flight.id) ? 'dark:text-[#bb44f0]' : ''}`}
                style={{ opacity: favorites.has(flight.id) ? 1 : 0.4 }}
              >
                <FaHeart size={20} style={{ opacity: favorites.has(flight.id) ? 1 : undefined }} />
              </button>
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-8">
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{flight.departure} - {flight.arrival}</p>
                      <p className={`text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''}`}>{flight.airline}</p>
                    </div>
                    <div className="text-sm">
                      {flight.isNonstop ? (
                        <span className={`text-green-600 ${darkMode ? 'dark:text-green-300' : ''}`}>nonstop</span>
                      ) : (
                        <span className={`text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''}`}>1 stop</span>
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{flight.duration}</p>
                      <p className={`text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''}`}>{flight.route}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center flex flex-col items-center">
                  <p className={`text-sm text-gray-500 ${darkMode ? 'dark:text-gray-400' : ''}`}>{flight.type}</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>${flight.price}</p>
                  <button onClick={() => handlePayment(flight)} className={`mt-2 px-6 py-2 ${darkMode ? 'bg-[#bb44f0] hover:bg-[#bb44f0]/90' : 'bg-[#4b0086] hover:bg-[#4b0086]/90'} text-white rounded-lg transition-colors`}>
                    Grab Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className={`p-8 rounded-lg shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Payment for {selectedItem.airline || selectedItem.name}</h2>
              <button onClick={handleClosePaymentModal} className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'dark:text-gray-400' : ''}`}>
                <FaTimes size={20} />
              </button>
            </div>
            <div className="mb-4">
              <p className={`text-gray-800 ${darkMode ? 'text-white' : ''}`}>Total: ${selectedItem.price}</p>
            </div>
            <div className="mb-4">
              <StripePayment onSuccess={handlePaymentSuccess} />
            </div>
            <div className="mb-4">
              <PayPalScriptProvider options={{ "client-id": "YOUR_PAYPAL_CLIENT_ID" }}>
                <PayPalPayment onSuccess={handlePaymentSuccess} />
              </PayPalScriptProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightResults;
