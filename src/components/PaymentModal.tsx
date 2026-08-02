import React, { useState } from 'react';
import { X, CreditCard, Landmark, Smartphone, QrCode, CheckCircle, Percent } from 'lucide-react';
import { coupons } from '../data/mockDatabase';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentMethod: string, finalAmount: number, couponCodeUsed?: string) => void;
  amount: number;
  itemName: string;
  itemType: 'course' | 'event';
}

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, itemName, itemType }: PaymentModalProps) {
  const [method, setMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const found = coupons.find(c => c.code.toUpperCase() === coupon.trim().toUpperCase());
    if (found) {
      setDiscountPercent(found.discountPercent);
      setCouponMessage({
        text: `Coupon applied successfully! ${found.discountPercent}% off: ${found.desc}`,
        type: 'success'
      });
    } else {
      setDiscountPercent(0);
      setCouponMessage({
        text: 'Invalid coupon code. Try WELCOME50 or SOFT20.',
        type: 'error'
      });
    }
  };

  const finalAmount = Math.max(0, amount - (amount * discountPercent) / 100);

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate network latency for payment gateway approval
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        let paymentMethodName = 'Credit Card';
        if (method === 'upi') paymentMethodName = `UPI (${upiId || 'QR Code'})`;
        if (method === 'netbanking') paymentMethodName = `Net Banking (${selectedBank || 'HDFC'})`;
        if (method === 'wallet') paymentMethodName = `Wallet (${selectedWallet || 'PhonePe'})`;

        onSuccess(paymentMethodName, finalAmount, discountPercent > 0 ? coupon.toUpperCase() : undefined);
        setSuccess(false);
        setDiscountPercent(0);
        setCoupon('');
        setCouponMessage({ text: '', type: '' });
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-brand-600 text-white">
          <div>
            <h3 className="font-bold text-lg">Secure Payment Gateway</h3>
            <p className="text-xs text-brand-100">Simulating Razorpay Checkout</p>
          </div>
          <button 
            onClick={onClose} 
            disabled={processing}
            className="p-1 rounded-full hover:bg-brand-700 transition text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Processing State */}
        {processing && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
            <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">Authorizing transaction with your bank...</p>
            <p className="text-xs text-slate-500 mt-1">Please do not refresh or close this modal</p>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-slate-900">
            <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
            <p className="mt-4 text-xl font-bold text-slate-800 dark:text-white">Payment Successful!</p>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Receipt reference: TXN_{Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
          </div>
        )}

        <div className="p-6">
          {/* Purchase Info Summary */}
          <div className="mb-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{itemType} Purchase</span>
                <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1">{itemName}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 dark:text-slate-500">Original price</span>
                <p className="font-semibold text-slate-500 line-through">₹{amount}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-2 font-bold text-slate-900 dark:text-white">
              <span>Payable Amount:</span>
              <span className="text-xl text-brand-600 dark:text-brand-400">₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Coupon Code Section */}
          <form onSubmit={handleApplyCoupon} className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Have a Promo/Coupon Code?</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. WELCOME50, SOFT20"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                />
              </div>
              <button 
                type="submit" 
                className="rounded-lg bg-slate-800 dark:bg-slate-700 px-4 text-sm font-semibold text-white hover:bg-slate-700 dark:hover:bg-slate-600 transition"
              >
                Apply
              </button>
            </div>
            {couponMessage.text && (
              <p className={`mt-1.5 text-xs ${couponMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                {couponMessage.text}
              </p>
            )}
          </form>

          {/* Payment Method Selector Tabs */}
          <div className="mb-5 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap sm:flex-nowrap gap-1 text-xs sm:text-sm font-medium">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 border-b-2 transition ${
                  method === 'card' 
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Card
              </button>
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 border-b-2 transition ${
                  method === 'upi' 
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <QrCode className="h-4 w-4" />
                UPI
              </button>
              <button
                type="button"
                onClick={() => setMethod('netbanking')}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 border-b-2 transition ${
                  method === 'netbanking' 
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <Landmark className="h-4 w-4" />
                Net Banking
              </button>
              <button
                type="button"
                onClick={() => setMethod('wallet')}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 border-b-2 transition ${
                  method === 'wallet' 
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                Wallet
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmitPayment}>
            {method === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="4111 2222 3333 4444"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">CVV</label>
                    <input
                      type="password"
                      required
                      placeholder="***"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'upi' && (
              <div className="space-y-4 text-center">
                <div className="flex flex-col items-center justify-center p-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    {/* Simulated QR Code */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=communityva@razorpay%26pn=COMMUNITY.VA%26am=${finalAmount}`} 
                      alt="Payment QR" 
                      className="w-28 h-28"
                    />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Scan QR Code using any UPI App (GPay, PhonePe, Paytm)</p>
                </div>
                <div className="text-slate-400 dark:text-slate-500 text-xs font-bold">— OR ENTER UPI ID —</div>
                <div>
                  <input
                    type="text"
                    placeholder="username@bank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                  />
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Select Your Bank</label>
                <select
                  required
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                >
                  <option value="">-- Select Bank --</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {method === 'wallet' && (
              <div className="grid grid-cols-2 gap-3">
                {['Paytm', 'PhonePe', 'Amazon Pay', 'Google Pay Wallet'].map((w) => (
                  <label
                    key={w}
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${
                      selectedWallet === w 
                        ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-900/10' 
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{w}</span>
                    <input
                      type="radio"
                      name="wallet"
                      required
                      value={w}
                      checked={selectedWallet === w}
                      onChange={() => setSelectedWallet(w)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                  </label>
                ))}
              </div>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              className="w-full mt-6 rounded-xl bg-brand-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand-500/10 hover:bg-brand-700 hover:shadow-brand-500/20 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition duration-200"
            >
              Pay Securely ${finalAmount.toFixed(2)}
            </button>
          </form>

          {/* Secure Badges */}
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">🔒 SSL Secured Connection</span>
            <span className="flex items-center gap-1">💳 PCI-DSS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
