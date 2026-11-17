import React, { useRef, useState, useEffect } from 'react';
import { Printer, X, ChevronDown, ImageDown, Monitor, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { downloadBillImage } from '../utils/billImageDownload';

const BuyerPrintModal = ({ isOpen, onClose, bill }) => {
  const { settings } = useSettings();
  const printAreaRef = useRef();
  const dropdownRef = useRef();
  const [showOptions, setShowOptions] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

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

  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  };

  const buyerName = bill.buyerId?.name || bill.buyerName || 'வாடிக்கையாளர்';
  const buyerPhone = bill.buyerId?.phone || '';
  const dateFormatted = formatDate(bill.transactionDate || bill.createdAt);

  const handleDownloadImage = async () => {
    setShowOptions(false);
    if (!printAreaRef.current) return;

    setIsDownloadingImage(true);
    const safeBuyerName = (bill.buyerId?.name || bill.buyerName || 'வாடிக்கையாளர்')
      .trim()
      .replace(/[\/\s]+/g, '_')
      .replace(/[^a-zA-Z0-9_\-\u0B80-\u0BFF]/g, '');
    const billNo = bill.billNumber || bill.transactionNumber || '';
    const cleanDate = dateFormatted.replace(/[\/\s]/g, '-');
    const filename = `Deva_Buyer_Bill_${safeBuyerName}${billNo ? `_${billNo}` : ''}_${cleanDate}.png`;

    await downloadBillImage(printAreaRef.current, {
      filename,
      targetWidthPx: 472.44, // 125mm at 96 DPI
      targetHeightPx: printAreaRef.current.offsetHeight || 699.21,
      shareTitle: `Buyer Bill - ${safeBuyerName}`,
      onStatusChange: (msg) => {
        setStatusMessage(msg);
        if (msg) setTimeout(() => setStatusMessage(''), 4000);
      }
    });

    setIsDownloadingImage(false);
  };

  // Items processing
  const items = Array.isArray(bill.items) && bill.items.length > 0
    ? bill.items
    : [
        {
          ratePerBigBox: bill.ratePerBigBox || 0,
          description: bill.bigBoxes > 0 && bill.smallBoxes > 0
            ? `தக்காளி (${bill.bigBoxes} பெ / ${bill.smallBoxes} சி)`
            : bill.smallBoxes > 0
            ? 'தக்காளி சிறிய பெட்டி'
            : 'தக்காளி பெரிய பெட்டி',
          bigEquivalent: bill.bigEquivalent || bill.bigBoxes || 0,
          amount: bill.billAmount || 0
        }
      ];

  const totalDisplayRows = 10;
  const emptyRowsCount = Math.max(0, totalDisplayRows - items.length);

  // Financial calculations
  const todayTotal = Number(bill.billAmount) || items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const oldBalance = Number(bill.oldBalance) || 0;
  const grandTotal = Math.round((todayTotal + oldBalance) * 100) / 100;
  const amountPaid = Number(bill.amountPaid) || 0;
  const balanceDue = Math.round((grandTotal - amountPaid) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs no-print" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-4">
          {/* Header Controls (Screen only) */}
          <div className="no-print flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-forest-700" />
              <span className="font-bold text-slate-800 text-sm font-tamil">
                வாடிக்கையாளர் பில் அச்சிடு (Buyer Bill Print)
              </span>
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
                        <div className="font-bold text-forest-700">Download Bill Image</div>
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

          {/* Printable Bill Area Container */}
          <div className="p-4 sm:p-6 overflow-x-auto flex justify-center bg-slate-100/50">
            {/* EXACT REPRODUCTION OF THE NEW OFFICIAL BUYER BILL */}
            <div
              ref={printAreaRef}
              id="buyer-printable-bill"
              className="bg-white text-slate-900 shadow-md font-tamil w-[125mm] min-h-[175mm] mx-auto box-border flex flex-col justify-between p-3.5 border-2 border-[#125538] rounded-2xl select-none"
              style={{
                fontFamily: '"Noto Sans Tamil", "Mukta Malar", sans-serif',
                borderColor: '#125538'
              }}
            >
              {/* Top Header Card */}
              <div>
                <div className="flex items-start justify-between border-2 border-[#125538] rounded-xl p-2 mb-1.5">
                  {/* Left: DEVA Logo */}
                  <div className="w-20 h-16 rounded-lg border border-[#125538]/40 p-1 flex items-center justify-center shrink-0 bg-white">
                    <img
                      src="/deva-logo.png"
                      alt="DEVA"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Center & Right Details */}
                  <div className="flex-1 text-center px-2">
                    <div className="flex items-center justify-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black text-[#125538] tracking-tight leading-none">
                        {settings.storeName || 'தேவா & கோ'}
                      </h1>
                      <div className="h-4 w-px bg-[#125538]" />
                      <div className="text-right text-[9.5px] font-black text-[#125538] leading-tight font-mono">
                        <div>📞 94433 18359</div>
                        <div>95853 56765</div>
                      </div>
                    </div>

                    <p className="text-[11px] font-bold text-[#125538] mt-1 leading-tight">
                      {settings.tagline || 'தக்காளி & காய்கறி கமிஷன் மண்டி'}
                    </p>
                    <p className="text-[9px] font-semibold text-slate-700 mt-0.5 leading-tight">
                      {settings.address || '54 A, அண்ணல் காந்தி மார்க்கெட், திண்டுக்கல் - 624 001'}
                    </p>
                  </div>
                </div>

                {/* Proprietor Curved Banner */}
                <div className="flex justify-center my-1">
                  <div className="bg-[#e4f3ea] border border-[#125538]/30 px-6 py-0.5 rounded-full text-center shadow-2xs">
                    <span className="text-[11px] font-black text-slate-800">
                      Prop: <span className="text-red-600 font-black">{settings.proprietor || 'R.தேவதாஸ்'}</span>
                    </span>
                  </div>
                </div>

                {/* Metadata Row: Bill No & Date */}
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 px-1 py-1">
                  <div className="flex items-baseline">
                    <span className="font-bold text-slate-800">எண் : </span>
                    <span className="font-mono font-black text-sm ml-1.5 px-2 py-0.2 border-b border-slate-700 min-w-[70px]">
                      {bill.billNumber || bill.transactionNumber || '—'}
                    </span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-bold text-slate-800">தேதி : </span>
                    <span className="font-mono font-bold text-xs ml-1.5 px-2 py-0.2 border-b border-slate-700 min-w-[85px]">
                      {dateFormatted}
                    </span>
                  </div>
                </div>

                {/* Customer Name Line */}
                <div className="flex items-baseline text-xs font-bold text-slate-900 px-1 pb-1.5">
                  <span className="font-bold text-slate-800 shrink-0">திரு : </span>
                  <span className="font-bold text-slate-900 ml-1.5 px-2 border-b border-slate-700 flex-1 truncate">
                    {buyerName} {buyerPhone ? `(${buyerPhone})` : ''}
                  </span>
                </div>

                {/* Main 4-Column Table */}
                <table className="w-full text-center border-collapse border-2 border-[#125538] text-[11px] mt-0.5">
                  <thead>
                    <tr className="border-b-2 border-[#125538] text-[#125538] font-black text-xs bg-slate-50/60">
                      <th className="border-r-2 border-[#125538] py-1 px-1 w-[16%]">விலை</th>
                      <th className="border-r-2 border-[#125538] py-1 px-2 text-center w-[46%]">விவரம்</th>
                      <th className="border-r-2 border-[#125538] py-1 px-1 w-[16%]">எண்ணம்</th>
                      <th className="py-1 px-1 w-[22%]">மொத்தம் ரூ. பை.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-[#125538]/70 font-semibold text-slate-900 h-6">
                        <td className="border-r-2 border-[#125538] py-0.5 px-1 text-center font-mono">
                          {item.ratePerBigBox > 0 ? `₹${item.ratePerBigBox}` : '—'}
                        </td>
                        <td className="border-r-2 border-[#125538] py-0.5 px-2 text-left truncate">
                          {item.description || 'தக்காளி பெட்டி'}
                        </td>
                        <td className="border-r-2 border-[#125538] py-0.5 px-1 text-center font-mono font-bold">
                          {item.bigEquivalent || item.bigBoxes || '—'}
                        </td>
                        <td className="py-0.5 px-1 text-right pr-2 font-mono font-bold">
                          {Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}

                    {/* Ruled blank rows matching bill pad */}
                    {Array.from({ length: emptyRowsCount }).map((_, idx) => (
                      <tr key={`empty-${idx}`} className="border-b border-[#125538]/60 h-5">
                        <td className="border-r-2 border-[#125538] py-0.5"></td>
                        <td className="border-r-2 border-[#125538] py-0.5"></td>
                        <td className="border-r-2 border-[#125538] py-0.5"></td>
                        <td className="py-0.5"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary Section - Exactly matching image 2 */}
                <div className="border-2 border-[#125538] border-t-0 text-[11px] font-bold">
                  {/* Row 1: இன்றைய மொத்தம் */}
                  <div className="flex border-b border-[#125538] h-6 items-center">
                    <div className="w-[62%] px-3 text-right border-r-2 border-[#125538] font-bold text-slate-800">
                      இன்றைய மொத்தம் :
                    </div>
                    <div className="w-[38%] px-3 text-right font-mono font-bold text-slate-900">
                      ₹{todayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Row 2: முன் பாக்கி */}
                  <div className="flex border-b border-[#125538] h-6 items-center">
                    <div className="w-[62%] px-3 text-right border-r-2 border-[#125538] font-bold text-slate-800">
                      முன் பாக்கி :
                    </div>
                    <div className="w-[38%] px-3 text-right font-mono font-bold text-slate-900">
                      ₹{oldBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Row 3: மொத்தம் (Shaded in light green) */}
                  <div className="flex border-b border-[#125538] h-6 items-center bg-[#e4f3ea]">
                    <div className="w-[62%] px-3 text-right border-r-2 border-[#125538] font-black text-[#125538] text-xs">
                      மொத்தம் :
                    </div>
                    <div className="w-[38%] px-3 text-right font-mono font-black text-[#125538] text-xs">
                      ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Row 4: வரவு */}
                  <div className="flex border-b border-[#125538] h-6 items-center">
                    <div className="w-[62%] px-3 text-right border-r-2 border-[#125538] font-bold text-slate-800">
                      வரவு :
                    </div>
                    <div className="w-[38%] px-3 text-right font-mono font-bold text-slate-900">
                      ₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Row 5: மொத்த பாக்கி (Shaded in light green) */}
                  <div className="flex h-6.5 items-center bg-[#e4f3ea]">
                    <div className="w-[62%] px-3 text-right border-r-2 border-[#125538] font-black text-[#125538] text-xs">
                      மொத்த பாக்கி :
                    </div>
                    <div className="w-[38%] px-3 text-right font-mono font-black text-red-600 text-xs">
                      ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Section */}
              <div className="pt-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-0.5 w-12 bg-[#125538]/50" />
                  <span className="text-xs font-black text-[#125538] tracking-wider">
                    நன்றி மீண்டும் வருக
                  </span>
                  <div className="h-0.5 w-12 bg-[#125538]/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Print CSS for New Buyer Bill */}
      <style>{`
        @media print {
          @page {
            size: 125mm 185mm;
            margin: 0mm;
          }
          body * {
            visibility: hidden;
          }
          #buyer-printable-bill, #buyer-printable-bill * {
            visibility: visible;
          }
          #buyer-printable-bill {
            position: fixed;
            left: 0;
            top: 0;
            width: 125mm !important;
            min-height: 180mm !important;
            margin: 0 !important;
            padding: 4.5mm !important;
            border: 2px solid #125538 !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default BuyerPrintModal;
