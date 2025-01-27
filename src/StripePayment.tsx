import React, { useState } from 'react';
    import { loadStripe } from '@stripe/stripe-js';
    import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
    import { useTheme } from './ThemeContext';
    
    const stripePromise = loadStripe('pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'); // Replace with your actual Stripe publishable key
    
    const CardForm = ({ onSuccess }: { onSuccess: () => void }) => {
      const stripe = useStripe();
      const elements = useElements();
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const { darkMode } = useTheme();
    
      const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
    
        if (!stripe || !elements) {
          setError("Stripe.js has not loaded yet.");
          return;
        }
    
        setLoading(true);
        setError(null);
    
        const card = elements.getElement(CardElement);
    
        if (!card) {
          setError("Card details are incomplete.");
          setLoading(false);
          return;
        }
    
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: card,
        });
    
        if (error) {
          setError(error.message || "An error occurred.");
          setLoading(false);
        } else {
          // Simulate successful payment
          console.log("Payment successful:", paymentMethod);
          setLoading(false);
          onSuccess();
        }
      };
    
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <CardElement className={`border border-gray-300 rounded-md p-2 focus:border-[#bb44f0] focus:ring-2 focus:ring-[#bb44f0] ${darkMode ? 'dark:focus:border-[#bb44f0] dark:border-[#bb44f0] bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`} />
          {error && <div className="text-red-500">{error}</div>}
          <button type="submit" disabled={loading} className={`w-full py-2 ${darkMode ? 'bg-[#bb44f0] hover:bg-[#bb44f0]/90' : 'bg-[#4b0086] hover:bg-[#4b0086]/90'} text-white rounded-lg transition-colors`}>
            {loading ? 'Processing...' : 'Pay with Card'}
          </button>
        </form>
      );
    };
    
    function StripePayment({ onSuccess }: { onSuccess: () => void }) {
      return (
        <Elements stripe={stripePromise}>
          <CardForm onSuccess={onSuccess} />
        </Elements>
      );
    }
    
    export default StripePayment;
