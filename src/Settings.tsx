import React, { useState } from 'react';
import { FaArrowLeft, FaSearch, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';

interface Trip {
  id: number;
  clientName: string;
  route: string;
  date: string;
  status: 'upcoming' | 'process' | 'completed' | 'cancelled';
  commission: string;
  vendorAmount: number;
  totalAmount: number;
  commissionType: 'percentage' | 'fixed';
  type: 'flight' | 'hotel';
}

const ITEMS_PER_PAGE = 12;

function Settings() {
  const navigate = useNavigate();
  const [commissionType, setCommissionType] = useState('percentage');
  const [commissionValue, setCommissionValue] = useState(10);
  const [serviceFee, setServiceFee] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTripId, setEditingTripId] = useState<number | null>(null);
  const [newCommission, setNewCommission] = useState('');
  const [newCommissionType, setNewCommissionType] = useState<'percentage' | 'fixed'>('percentage');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [cancelingTripId, setCancelingTripId] = useState<number | null>(null);
  const [cancelConfirmation, setCancelConfirmation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newStatus, setNewStatus] = useState<'upcoming' | 'process' | 'completed'>('upcoming');
  const { darkMode } = useTheme();

  const handleCommissionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCommissionType(e.target.value);
  };

  const handleCommissionValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommissionValue(Number(e.target.value));
  };

  const handleServiceFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServiceFee(Number(e.target.value));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleEditCommission = (tripId: number, currentCommission: string, currentCommissionType: 'percentage' | 'fixed', currentStatus: 'upcoming' | 'process' | 'completed' | 'cancelled') => {
    setEditingTripId(tripId);
    setNewCommission(currentCommission.replace(/[^0-9.]/g, ''));
    setNewCommissionType(currentCommissionType);
    setNewStatus(currentStatus === 'cancelled' ? 'upcoming' : currentStatus);
  };

  const handleSaveCommission = () => {
    if (editingTripId !== null) {
      const updatedTrips = trips.map(trip => {
        if (trip.id === editingTripId) {
          const commissionValue = Number(newCommission);
          let commissionAmount = 0;
          if (newCommissionType === 'percentage') {
            commissionAmount = trip.vendorAmount * (commissionValue / 100);
          } else {
            commissionAmount = commissionValue;
          }
          const totalAmount = trip.vendorAmount + commissionAmount;
          return { ...trip, commission: newCommission + (newCommissionType === 'percentage' ? '%' : ''), commissionType: newCommissionType, totalAmount: totalAmount, status: newStatus };
        }
        return trip;
      });
      setTrips(updatedTrips as Trip[]);
      setEditingTripId(null);
      setNewCommission('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTripId(null);
    setNewCommission('');
  };

  const handleNewCommissionTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCommissionType(e.target.value as 'percentage' | 'fixed');
  };

  const handleCancelTrip = (tripId: number) => {
    setCancelingTripId(tripId);
    setCancelConfirmation('');
  };

  const handleConfirmCancel = () => {
    if (cancelingTripId !== null && cancelConfirmation.toLowerCase() === 'cancel') {
      const updatedTrips = trips.map(trip => {
        if (trip.id === cancelingTripId) {
          return { ...trip, status: 'cancelled' };
        }
        return trip;
      });
      setTrips(updatedTrips as Trip[]);
      setCancelingTripId(null);
      setCancelConfirmation('');
    }
  };

  const handleCancelConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCancelConfirmation(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const handleNewStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewStatus(e.target.value as 'upcoming' | 'process' | 'completed');
  };

  const filteredTrips = trips.filter(trip => {
    const searchLower = searchQuery.toLowerCase();
    return (
      trip.clientName.toLowerCase().includes(searchLower) ||
      trip.date.includes(searchLower) ||
      trip.status.includes(searchLower)
    ) && (statusFilter === 'all' || trip.status === statusFilter) && (typeFilter === 'all' || trip.type === typeFilter);
  });

  const totalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTrips.slice(startIndex, endIndex);
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

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} flex flex-col items-center px-4`}>
      {/* Header */}
      <div className="w-full max-w-3xl mt-8 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className={`text-gray-600 hover:text-[#4b0086] transition-colors ${darkMode ? 'dark:text-gray-300 dark:hover:text-[#bb44f0]' : 'hover:text-[#4b0086]'}`}>
          <FaArrowLeft size={24} />
        </button>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Trip Management</h1>
      </div>

      {/* Settings */}
      <div className="w-full max-w-3xl mt-8 space-y-8">
        {/* Default Commission Settings */}
        <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Default Commission Settings</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Commission Type</label>
              <select
                value={commissionType}
                onChange={handleCommissionTypeChange}
                className={`w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none hover:border-[#4b0086] ${darkMode ? 'bg-gray-800 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Commission Value</label>
              <input
                type="number"
                value={commissionValue}
                onChange={handleCommissionValueChange}
                className={`w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none ${darkMode ? 'bg-gray-800 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service Fee</label>
              <input
                type="number"
                value={serviceFee}
                onChange={handleServiceFeeChange}
                className={`w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none ${darkMode ? 'bg-gray-800 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
              />
            </div>
          </div>
        </div>

        {/* Client Trips */}
        <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Client Trips</h2>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className={`px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none hover:border-[#4b0086] ${darkMode ? 'bg-gray-800 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="process">Process</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={typeFilter}
                onChange={handleTypeFilterChange}
                className={`px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none hover:border-[#4b0086] ${darkMode ? 'bg-gray-800 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
              >
                <option value="all">All Types</option>
                <option value="flight">Flights</option>
                <option value="hotel">Hotels</option>
              </select>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={`w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none pl-10 ${darkMode ? 'bg-gray-800 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
                />
                <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <FaSearch />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {getCurrentPageItems().map((trip) => (
              <div key={trip.id} className={`rounded-lg p-4 flex justify-between items-start ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{trip.clientName}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{trip.route}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{trip.date}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      trip.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : (trip.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100')
                    }`}>
                      {trip.status}
                    </span>
                    {trip.status !== 'cancelled' && (
                      <button onClick={() => handleCancelTrip(trip.id)} className={`text-sm hover:text-red-500 ml-4 ${darkMode ? 'text-gray-400 dark:hover:text-[#bb44f0]' : 'text-gray-500'}`}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    Vendor: <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>${trip.vendorAmount}</span>
                  </p>
                  <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    Commission: <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{trip.commission}</span>
                  </p>
                  <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-300' : ''}`}>
                    Total: <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>${trip.totalAmount}</span>
                  </p>
                  <button
                    onClick={() => {
                      // Ensure `trip.commissionType` is valid
                      if (['fixed', 'percentage'].includes(trip.commissionType)) {
                        handleEditCommission(
                          trip.id,
                          trip.commission,
                          trip.commissionType as 'fixed' | 'percentage',
                          trip.status as 'upcoming' | 'process' | 'completed' | 'cancelled'
                        );
                      } else {
                        console.error(
                          `Invalid commissionType: ${trip.commissionType}`
                        );
                      }
                    }}
                    className={`text-[#4b0086] text-sm hover:underline ${
                      darkMode ? 'dark:text-[#bb44f0]' : ''
                    }`}
                  >
                    Edit Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {filteredTrips.length > ITEMS_PER_PAGE && renderPagination()}

      {/* Edit Commission Modal */}
      {editingTripId !== null && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className={`p-8 rounded-lg shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Edit Trip</h2>
              <button onClick={handleCancelEdit} className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'dark:text-gray-400' : ''}`}>
                <FaTimes size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Commission</label>
              <input
                type="text"
                value={newCommission}
                onChange={(e) => setNewCommission(e.target.value)}
                className={`w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none ${darkMode ? 'bg-gray-800 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
              />
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Commission Type</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="percentage"
                    checked={newCommissionType === 'percentage'}
                    onChange={handleNewCommissionTypeChange}
                    className="form-radio text-[#4b0086] focus:ring-[#bb44f0] h-4 w-4"
                  />
                  <span className={`ml-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Percentage</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="fixed"
                    checked={newCommissionType === 'fixed'}
                    onChange={handleNewCommissionTypeChange}
                    className="form-radio text-[#4b0086] focus:ring-[#bb44f0] h-4 w-4"
                  />
                  <span className={`ml-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Fixed</span>
                </label>
              </div>
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="upcoming"
                    checked={newStatus === 'upcoming'}
                    onChange={handleNewStatusChange}
                    className="form-radio text-[#4b0086] focus:ring-[#bb44f0] h-4 w-4"
                  />
                  <span className={`ml-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Upcoming</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="process"
                    checked={newStatus === 'process'}
                    onChange={handleNewStatusChange}
                    className="form-radio text-[#4b0086] focus:ring-[#bb44f0] h-4 w-4"
                  />
                  <span className={`ml-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Process</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="completed"
                    checked={newStatus === 'completed'}
                    onChange={handleNewStatusChange}
                    className="form-radio text-[#4b0086] focus:ring-[#bb44f0] h-4 w-4"
                  />
                  <span className={`ml-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Completed</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={handleCancelEdit} className={`px-4 py-2 rounded-lg border border-gray-300 hover:border-[#4b0086] ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Cancel
              </button>
              <button onClick={handleSaveCommission} className="px-4 py-2 bg-[#4b0086] text-white rounded-lg hover:opacity-90 transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Trip Modal */}
      {cancelingTripId !== null && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className={`p-8 rounded-lg shadow-lg w-full max-w-md ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Cancel Trip</h2>
              <button onClick={() => setCancelingTripId(null)} className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'dark:text-gray-400' : ''}`}>
                <FaTimes size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Type "cancel" to confirm cancellation
              </label>
              <input
                type="text"
                value={cancelConfirmation}
                onChange={handleCancelConfirmationChange}
                className={`w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#4b0086] focus:border-[#4b0086] outline-none ${darkMode ? 'bg-gray-800 text-gray-100 dark:focus:border-[#bb44f0]' : 'bg-white text-gray-800 focus:border-[#4b0086]'}`}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setCancelingTripId(null)} className={`px-4 py-2 rounded-lg border border-gray-300 hover:border-[#4b0086] ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Cancel
              </button>
              <button onClick={handleConfirmCancel} className="px-4 py-2 bg-[#4b0086] text-white rounded-lg hover:opacity-90 transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
