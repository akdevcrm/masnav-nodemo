import { useState } from 'react';
    import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
    
    function PayPalPayment({ onSuccess }: { onSuccess: () => void }) {
      const [{ isPending }] = usePayPalScriptReducer();
      const [paymentError, setPaymentError] = useState<string | null>(null);
    
      const handleApprove = async (_data: any, actions: any) => {
        try {
          const order = await actions.order.capture();
          console.log('PayPal payment successful:', order);
          onSuccess();
        } catch (error: any) {
          setPaymentError(error.message || "An error occurred during payment.");
        }
      };
    
      return (
        <div className="space-y-4">
          {paymentError && <div className="text-red-500">{paymentError}</div>}
          <PayPalButtons
            createOrder={(_data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: '10.00', // Replace with the actual amount
                    },
                  },
                ],
              });
            }}
            onApprove={handleApprove}
            onError={(err: any) => {
              setPaymentError(err?.message || "An error occurred during payment.");
            }}
            onCancel={() => {
              setPaymentError("Payment cancelled.");
            }}
            disabled={isPending}
          />
        </div>
      );
    }
    
    export default PayPalPayment;
