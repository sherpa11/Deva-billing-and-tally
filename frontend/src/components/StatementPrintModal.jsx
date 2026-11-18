import React, { useRef, useState, useEffect } from 'react';
import { Printer, X, ChevronDown, ImageDown, Monitor, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { downloadBillImage } from '../utils/billImageDownload';

const StatementPrintModal = ({ isOpen, onClose, buyer, transactions, startDate, endDate }) => {
  const { settings, fetchSettings } = useSettings();
  const printAreaRef = useRef();
  const dropdownRef = useRef();
  const [printFormat, setPrintFormat] = useState('a4'); // 'a4' or 'thermal'
  const [showOptions, setShowOptions] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen && typeof fetchSettings === 'function') {
      fetchSettings();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  if (!isOpen || !buyer) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  };

  const handleDownloadImage = async () => {
    setShowOptions(false);
    if (!printAreaRef.current) return;

    setIsDownloadingImage(true);
    const safeBuyerName = (buyer.name || 'Customer')
      .trim()
      .replace(/[\/\s]+/g, '_')
      .replace(/[^a-zA-Z0-9_\-\u0B80-\u0BFF]/g, '');
    const todayStr = new Date().toISOString().slice(0, 10);
    const filename = `Deva_Statement_${safeBuyerName}_${todayStr}.png`;

    await downloadBillImage(printAreaRef.current, {
      filename,
      targetWidthPx: printFormat === 'thermal' ? 302.36 : 794,
      targetHeightPx: null,
      shareTitle: `Statement - ${safeBuyerName}`,
      onStatusChange: (msg) => {
        setStatusMessage(msg);
        if (msg) setTimeout(() => setStatusMessage(''), 4000);
      }
    });

    setIsDownloadingImage(false);
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
              {statusMessage && (
                <span className="text-[11px] font-bold text-forest-700 bg-forest-50 border border-forest-200/80 px-2.5 py-1 rounded-lg">
                  {statusMessage}
                </span>
              )}

              {/* Printing & Download Dropdown */}
              <div className="relative inline-flex items-stretch shadow-xs rounded-xl" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-l-xl text-xs font-bold shadow-md shadow-forest-600/25 transition-all cursor-pointer active:scale-95"
                  title="Browser Print Preview"
                >
                  <Printer className="w-4 h-4" />
                  <span>அச்சிடு (Print)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowOptions(!showOptions)}
                  className="px-2 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-r-xl border-l border-forest-500/50 shadow-md shadow-forest-600/25 transition-all cursor-pointer"
                  title="Print & Download Options"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`} />
                </button>

                {/* Options Dropdown Menu */}
                {showOptions && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* 1. Browser Print Preview */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowOptions(false);
                        handlePrint();
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <Monitor className="w-4 h-4 text-slate-600" />
                      <div>
                        <div className="font-bold">Browser Print Preview</div>
                        <div className="text-[10px] text-slate-500 font-normal">Direct print dialog preview</div>
                      </div>
                    </button>

                    {/* 2. Download Bill Image */}
                    <button
                      type="button"
                      onClick={handleDownloadImage}
                      disabled={isDownloadingImage}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {isDownloadingImage ? (
                        <Loader2 className="w-4 h-4 text-forest-600 animate-spin" />
                      ) : (
                        <ImageDown className="w-4 h-4 text-forest-600" />
                      )}
                      <div>
                        <div className="font-bold text-forest-700">Download Statement Image</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {isDownloadingImage ? 'Generating PNG...' : 'High-resolution PNG (1-click)'}
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Statement Content */}
          <div className="p-8 max-h-[75vh] overflow-y-auto bg-slate-100/50 flex justify-center">
            <div
              ref={printAreaRef}
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
                  <div>{settings.storeName || 'தேவா & கோ'} சார்பாக</div>
                  <div className="mt-8 font-bold">
                    {settings.proprietor ? `${settings.proprietor} (உரிமையாளர்)` : 'உரிமையாளர் கையொப்பம்'}
                  </div>
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
