import React, { useState, useEffect } from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';
    import './index.css';
    import Favorites from './Favorites';
    import Settings from './Settings';
    import FlightResults from './FlightResults';
    import HotelResults from './HotelResults';
    import PointsOfInterest from './PointsOfInterest';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import { ThemeProvider } from './ThemeContext';
    
    function AgreementModal({ onAgree }: { onAgree: () => void }) {
      const [agreed, setAgreed] = useState(false);
    
      const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAgreed(e.target.checked);
      };
    
      const handleSubmit = () => {
        if (agreed) {
          onAgree();
        }
      };
    
      return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Certification and Compliance Agreement</h2>
            <p className="text-gray-700 mb-4">
              By using Attention Keeper's CRM, I acknowledge and agree to the following:
            </p>
            <ol className="list-decimal list-inside text-gray-700 mb-4 text-sm">
              <li>I am either IATA-certified or affiliated with an IATA-certified travel agency.</li>
              <li>I am solely responsible for ensuring compliance with all applicable certifications, regulations, and legal requirements in the travel industry.</li>
              <li>Attention Keeper's CRM is a software tool designed to support travel agents and agencies and does not provide ticketing services, certifications, or act as a licensed travel agency.</li>
              <li>I assume full responsibility for verifying and maintaining all necessary certifications required for my business activities.</li>
              <li>I agree to indemnify, defend, and hold harmless Attention Keeper's CRM and its affiliates from any claims, liabilities, damages, or losses arising from my failure to comply with these requirements.</li>
            </ol>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="agreement"
                checked={agreed}
                onChange={handleCheckboxChange}
                className="mr-2 h-4 w-4 text-[#4b0086] focus:ring-[#bb44f0] border-gray-300 rounded"
              />
              <label htmlFor="agreement" className="text-gray-700 text-sm">
                I agree to the <a href="https://attentionkeeper.com/terms-and-conditions/" className="text-[#4b0086] hover:underline">terms and conditions</a>.
              </label>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!agreed}
                className={`px-4 py-2 rounded-full text-white font-semibold ${agreed ? 'bg-[#4b0086] hover:bg-[#4b0086]/90' : 'bg-gray-400 cursor-not-allowed'} transition-colors text-sm`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    function MainApp() {
      const [showAgreement, setShowAgreement] = useState(true);
    
      useEffect(() => {
        const hasAgreed = localStorage.getItem('agreementAccepted') === 'true';
        setShowAgreement(!hasAgreed);
      }, []);
    
      const handleAgreement = () => {
        localStorage.setItem('agreementAccepted', 'true');
        setShowAgreement(false);
      };
    
      return (
        <ThemeProvider>
          <div style={{ pointerEvents: showAgreement ? 'none' : 'auto' }}>
            <Router>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/flights" element={<FlightResults />} />
                <Route path="/hotels" element={<HotelResults />} />
                <Route path="/poi" element={<PointsOfInterest />} />
              </Routes>
            </Router>
          </div>
          {showAgreement && <AgreementModal onAgree={handleAgreement} />}
        </ThemeProvider>
      );
    }
    
    ReactDOM.createRoot(document.getElementById('root')!).render(<MainApp />);
