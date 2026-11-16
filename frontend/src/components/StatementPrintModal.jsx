import React, { useRef, useState } from 'react';
import { Printer, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const StatementPrintModal = ({ isOpen, onClose, buyer, transactions, startDate, endDate }) => {
  const { settings } = useSettings();
  const [printFormat, setPrintFormat] = useState('a4'); // 'a4' or 'thermal'

  if (!isOpen || !buyer) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs no-print" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6">
          {/* Header Controls */}
          <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Printer className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-base font-tamil">
                கணக்கு விபரம் (Account Statement)
              </h3>
              <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setPrintFormat('a4')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    printFormat === 'a4' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  A4 பக்கம்
                </button>
                <button
                  onClick={() => setPrintFormat('thermal')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    printFormat === 'thermal' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  80mm தெர்மல்
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 transition-all"
              >
                <Printer className="w-4 h-4" />
                அச்சிடு (Print)
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Statement Content */}
          <div className="p-8 max-h-[75vh] overflow-y-auto bg-slate-100/50 flex justify-center">
            <div
              id="statement-printable"
              className={`bg-white p-8 text-slate-900 shadow-sm border border-slate-200 ${
                printFormat === 'thermal' ? 'w-[80mm] p-3 text-xs' : 'w-full max-w-3xl text-sm'
              }`}
            >
              {/* Header Letterhead */}
              <div className="text-center border-b-2 border-emerald-700 pb-4 mb-4">
                <h1 className="text-2xl font-black text-emerald-800 font-tamil">
                  {settings.storeName || 'தேவா & கோ'}
                </h1>
                <p className="text-xs font-bold text-emerald-600 font-tamil mt-0.5">
                  {settings.tagline || 'தக்காளி & காய்கனி கமிஷன் மண்டி'}
                </p>
                <p className="text-[11px] text-slate-600 font-tamil mt-0.5">
                  {settings.address} | Cell: {Array.isArray(settings.phones) ? settings.phones.join(', ') : settings.phones}
                </p>
              </div>

              {/* Statement Target Info */}
              <div className="flex justify-between items-start mb-6 text-xs font-tamil">
                <div>
                  <div className="text-slate-500 font-medium">வாடிக்கையாளர் விபரம்:</div>
                  <div className="text-base font-bold text-slate-900">{buyer.name}</div>
                  {buyer.phone && <div>செல்: {buyer.phone}</div>}
                  {buyer.address && <div>முகவரி: {buyer.address}</div>}
                  <div>குறியீடு: {buyer.buyerCode}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 font-medium">அறிக்கை காலம்:</div>
                  <div className="font-bold text-slate-800">
                    {startDate ? formatDate(startDate) : 'ஆரம்பம்'} முதல் {endDate ? formatDate(endDate) : 'இன்று வரை'}
                  </div>
                  <div className="mt-2 text-sm font-black">
                    தற்போதைய பாக்கி:{' '}
                    <span className={buyer.currentBalance > 0 ? 'text-red-600' : 'text-emerald-700'}>
                      ₹{buyer.currentBalance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <table className="w-full text-left border-collapse border border-slate-300 text-xs font-tamil mb-6">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2">தேதி</th>
                    <th className="border border-slate-300 p-2">வகை / விவரம்</th>
                    <th className="border border-slate-300 p-2 text-center">பெட்டிகள்</th>
                    <th className="border border-slate-300 p-2 text-right">பில் தொகை</th>
                    <th className="border border-slate-300 p-2 text-right">வரவு தொகை</th>
                    <th className="border border-slate-300 p-2 text-right">மீதி இருப்பு</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions && transactions.length > 0 ? (
                    transactions.map((t, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="border border-slate-300 p-2 font-medium">
                          {formatDate(t.transactionDate)}
                        </td>
                        <td className="border border-slate-300 p-2">
                          <span className={`font-bold ${t.type === 'SALE' ? 'text-emerald-800' : 'text-blue-700'}`}>
                            {t.type === 'SALE' ? `பில் #${t.billNumber}` : 'ரொக்க வரவு'}
                          </span>
                          {t.notes && <div className="text-[10px] text-slate-500">{t.notes}</div>}
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          {t.type === 'SALE' ? `${t.bigBoxes} பெ / ${t.smallBoxes} சி (${t.bigEquivalent} சமன்)` : '—'}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-semibold">
                          {t.type === 'SALE' ? `₹${t.billAmount}` : '—'}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-semibold text-emerald-700">
                          {t.amountPaid > 0 ? `₹${t.amountPaid}` : '—'}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-bold text-slate-900">
                          ₹{t.newBalance}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500">
                        பரிவர்த்தனைகள் எதுவும் இல்லை
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="flex justify-between items-end mt-12 pt-6 border-t border-slate-300 text-xs font-tamil">
                <div>வாடிக்கையாளர் கையொப்பம்</div>
                <div className="text-right">
                  <div>தேவா & கோ சார்பாக</div>
                  <div className="mt-8 font-bold">உரிமையாளர் கையொப்பம்</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: ${printFormat === 'thermal' ? '80mm auto' : 'A4 portrait'};
            margin: ${printFormat === 'thermal' ? '0' : '15mm'};
          }
          body * {
            visibility: hidden;
          }
          #statement-printable, #statement-printable * {
            visibility: visible;
          }
          #statement-printable {
            position: fixed;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StatementPrintModal;
