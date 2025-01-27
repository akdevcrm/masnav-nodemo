import { useState } from 'react';
import { FaArrowLeft, FaStar, FaChevronLeft, FaChevronRight, FaHeart, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import StripePayment from './StripePayment';
import PayPalPayment from './PayPalPayment';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useTheme } from './ThemeContext';

interface HotelResult {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  description: string;
  distance: string;
  price: number;
  totalPrice: number;
  nights: number;
  image: string;
  provider: string;
  features: string[];
}

const ITEMS_PER_PAGE = 20;

function HotelResults() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { darkMode } = useTheme();
  const [sortOrder, setSortOrder] = useState('none');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [results, _setResults] = useState<HotelResult[]>([]);

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return applyFilters().slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleSkipToPayment = () => {
    // In a real app, you would navigate to the payment page
    console.log("Navigating to payment page");
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

  const handleRatingFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRatingFilter(e.target.value);
  };

  const handleBrandFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBrandFilter(e.target.value);
  };

  const applyFilters = () => {
    let filteredResults = [...results];

    // Apply brand filter
    if (brandFilter !== 'all') {
      filteredResults = filteredResults.filter(hotel => {
        const brand = hotel.name.startsWith("The ") ? hotel.name.substring(4) : hotel.name;
        return brand.includes(brandFilter);
      });
    }

    // Apply rating filter
    if (ratingFilter !== 'all') {
      filteredResults = filteredResults.filter(hotel => hotel.rating >= parseFloat(ratingFilter));
    }

    // Apply sorting
    if (sortOrder !== 'none') {
      filteredResults.sort((a, b) => {
        if (sortOrder === 'price_low_high') {
          return a.price - b.price;
        } else if (sortOrder === 'price_high_low') {
          return b.price - a.price;
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

  const uniqueBrands = ['all', ...Array.from(new Set(results.map((hotel: any) => hotel.name.startsWith("The ") ? hotel.name.substring(4).split(' ')[0] : hotel.name.split(' ')[0])))];
  const uniqueRatings = ['all', ...Array.from(new Set(results.map((hotel: any) => hotel.rating))).sort((a, b) => b - a)];

  return (
    <div className={`min-h-screen flex flex-col items-center px-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="w-full max-w-6xl mt-8 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className={`text-gray-600 hover:text-[#4b0086] transition-colors ${darkMode ? 'dark:text-gray-300 dark:hover:text-[#bb44f0]' : 'hover:text-[#4b0086]'}`}>
          <FaArrowLeft size={24} />
        </button>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Hotel Results</h1>
        <button onClick={handleSkipToPayment} className={`text-gray-600 hover:text-[#4b0086] transition-colors ${darkMode ? 'dark:text-gray-300 dark:hover:text-[#bb44f0]' : 'hover:text-[#4b0086]'}`}>
          Skip to Payment
        </button>
      </div>

      {/* Filters */}
      <div className="w-full max-w-6xl mt-4 flex justify-center space-x-4">
        <select
          value={brandFilter}
          onChange={handleBrandFilterChange}
          className={`px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none hover:border-[#4b0086] ${darkMode ? 'bg-gray-700 text-gray-100 dark:hover:border-[#bb44f0]' : 'bg-white text-gray-800 hover:border-[#4b0086]'}`}
        >
          {uniqueBrands.map(brand => (
            <option key={brand} value={brand}>{brand === 'all' ? 'Brands: All' : brand}</option>
          ))}
        </select>
        <select
          value={ratingFilter}
          onChange={handleRatingFilterChange}
          className={`px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none hover:border-[#4b0086] ${darkMode ? 'bg-gray-700 text-gray-100 dark:hover:border-[#bb44f0]' : 'bg-white text-gray-800 hover:border-[#4b0086]'}`}
        >
          {uniqueRatings.map(rating => (
            <option key={rating} value={rating}>{rating === 'all' ? 'Ratings: All' : rating}</option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={handleSortChange}
          className={`px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none hover:border-[#4b0086] ${darkMode ? 'bg-gray-700 text-gray-100 dark:hover:border-[#bb44f0]' : 'bg-white text-gray-800 hover:border-[#4b0086]'}`}
        >
          <option value="none">Sort</option>
          <option value="price_low_high">Price: Low to High</option>
          <option value="price_high_low">Price: High to Low</option>
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
          {getCurrentPageItems().map((hotel: any) => (
            <div key={hotel.id} className={`rounded-lg overflow-hidden relative border border-gray-200 hover:border-[#bb44f0] ${darkMode ? 'bg-gray-700 dark:border-gray-600' : 'bg-white'}`}>
              <button
                onClick={() => toggleFavorite(hotel.id)}
                className={`absolute top-4 left-4 text-gray-400 transition-colors hover:text-red-500 ${favorites.has(hotel.id) ? 'text-red-500' : ''} ${darkMode ? 'dark:text-[#bb44f0]' : ''}`}
                style={{ opacity: favorites.has(hotel.id) ? 1 : 0.4 }}
              >
                <FaHeart size={20} style={{ opacity: favorites.has(hotel.id) ? 1 : undefined }} />
              </button>
              <div className="flex">
                <div className="w-1/3">
                  <img 
                    src={hotel.image} 
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {hotel.name}
                        <button className="ml-2 text-gray-400 hover:text-[#4b0086] dark:text-gray-500">
                          <FaStar />
                        </button>
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-400"><FaStar /></span>
                        <span className={`ml-1 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{hotel.rating}</span>
                        <span className={`text-sm ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({hotel.reviews} ratings)</span>
                      </div>
                      <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{hotel.description}</p>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{hotel.distance}</p>
                    </div>
                    <div className="text-center flex flex-col items-center">
                      <p className="mt-2">
                        <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>${hotel.price}</span>
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {hotel.nights} nights for ${hotel.totalPrice}
                      </p>
                      <button onClick={() => handlePayment(hotel)} className={`mt-2 px-6 py-2 ${darkMode ? 'bg-[#bb44f0] hover:bg-[#bb44f0]/90' : 'bg-[#4b0086] hover:bg-[#4b0086]/90'} text-white rounded-lg transition-colors`}>
                        Grab Deal
                      </button>
                    </div>
                  </div>
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
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Payment for {selectedItem.name || selectedItem.airline}</h2>
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

export default HotelResults;
