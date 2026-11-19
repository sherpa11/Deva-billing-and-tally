import React, { useRef, useState, useEffect } from 'react';
import { Printer, X, ChevronDown, ImageDown, Monitor, Loader2, Phone } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { downloadBillImage } from '../utils/billImageDownload';

const SupplierPrintModal = ({ isOpen, onClose, bill }) => {
  const { settings, fetchSettings } = useSettings();
  const printAreaRef = useRef();
  const dropdownRef = useRef();
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

  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  };

  const splitAmount = (amt) => {
    const num = Number(amt) || 0;
    const parts = Math.abs(num).toFixed(2).split('.');
    return {
      rupees: Number(parts[0]).toLocaleString('en-IN'),
      paise: parts[1] === '00' ? '00' : parts[1],
      isNegative: num < 0
    };
  };

  const supplierName = bill.supplierId?.name || bill.supplierName || 'விவசாயி / விற்பனையாளர்';
  const supplierPhone = bill.supplierId?.phone || '';
  const dateFormatted = formatDate(bill.transactionDate || bill.createdAt);

  const phone1 = Array.isArray(settings?.phones) && settings.phones[0] ? settings.phones[0] : '';
  const phone2 = Array.isArray(settings?.phones) && settings.phones[1] ? settings.phones[1] : '';

  const handleDownloadImage = async () => {
    setShowOptions(false);
    if (!printAreaRef.current) return;

    setIsDownloadingImage(true);
    const safeSupplierName = (bill.supplierId?.name || bill.supplierName || 'Supplier')
      .trim()
      .replace(/[\/\s]+/g, '_')
      .replace(/[^a-zA-Z0-9_\-\u0B80-\u0BFF]/g, '');
    const billNo = bill.billNumber || bill.lotNumber || bill.transactionNumber || '';
    const cleanDate = dateFormatted.replace(/[\/\s]/g, '-');
    const filename = `Deva_Supplier_Bill_${safeSupplierName}${billNo ? `_${billNo}` : ''}_${cleanDate}.png`;

    await downloadBillImage(printAreaRef.current, {
      filename,
      targetWidthPx: 559.37, // Exact A5 portrait width (148mm @ 96 DPI)
      targetHeightPx: 793.70, // Exact A5 portrait height (210mm @ 96 DPI)
      shareTitle: `Supplier Bill - ${safeSupplierName}`,
      onStatusChange: (msg) => {
        setStatusMessage(msg);
        if (msg) setTimeout(() => setStatusMessage(''), 4000);
      }
    });

    setIsDownloadingImage(false);
  };

  const items = Array.isArray(bill.items) && bill.items.length > 0
    ? bill.items
    : [
        {
          rate: bill.ratePerBigBox || 0,
          description: bill.bigBoxes > 0 && bill.smallBoxes > 0
            ? `தக்காளி (${bill.bigBoxes} பெ / ${bill.smallBoxes} சி)`
            : bill.smallBoxes > 0
            ? 'தக்காளி சிறிய பெட்டி'
            : 'தக்காளி பெரிய பெட்டி',
          quantity: bill.quantity || bill.bigEquivalent || bill.bigBoxes || 0,
          amount: bill.grossTotal || bill.totalAmount || (bill.bigEquivalent * bill.ratePerBigBox) || 0
        }
      ];

  // For Standard A5 portrait size (148mm x 210mm), exactly 8 total display rows matching reference pad
  const totalDisplayRows = 8;
  const emptyRowsCount = Math.max(0, totalDisplayRows - items.length);

  const grossTotal = Number(bill.grossTotal) || Number(bill.totalAmount) || items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const deductions = bill.deductions || {};
  const comm = Number(deductions.commission) || 0;
  const gate = Number(deductions.gate) || 0;
  const coolie = Number(deductions.coolie) || 0;
  const rent = Number(deductions.rent) || 0;
  
  // Previous balance / பற்று (முன் பாக்கி)
  const prevBal = bill.previousBalance !== undefined && bill.previousBalance !== null
    ? Number(bill.previousBalance)
    : (bill.oldBalance !== undefined ? Number(bill.oldBalance) : (Number(deductions.debit) || 0));

  // மொத்தம் (Total Payable to Supplier)
  const totalPayable = bill.totalPayable !== undefined && bill.totalPayable !== null
    ? Number(bill.totalPayable)
    : (bill.netPayable !== undefined ? Number(bill.netPayable) : Math.max(0, grossTotal - (comm + gate + coolie + rent) + prevBal));

  // Field 1: கொடுத்தது / செலுத்திய தொகை (Amount Paid)
  const amountPaid = Number(bill.amountPaid) || 0;

  // Field 2: மீதி பாக்கி (Remaining Balance = மொத்தம் - செலுத்திய தொகை)
  const remainingBalance = bill.remainingBalance !== undefined && bill.remainingBalance !== null
    ? Number(bill.remainingBalance)
    : (bill.newBalance !== undefined ? Number(bill.newBalance) : Math.round((totalPayable - amountPaid) * 100) / 100);

  const splitGross = splitAmount(grossTotal);
  const splitTotal = splitAmount(totalPayable);
  const splitPaid = splitAmount(amountPaid);
  const splitRemaining = splitAmount(remainingBalance);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs no-print" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-4">
          {/* Header Controls (Screen only) */}
          <div className="no-print flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-forest-700" />
              <span className="font-bold text-slate-800 text-sm font-tamil">
                விவசாயி பில் அச்சிடு (Supplier Bill A5 Print)
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
                  title="Browser Print Preview (A5)"
                >
                  <Printer className="w-4 h-4" />
                  <span>அச்சிடு (Print A5)</span>
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
                        <div className="text-[10px] text-slate-500 font-normal">Direct A5 print dialog preview</div>
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
                          {isDownloadingImage ? 'Generating PNG...' : 'High-resolution A5 PNG (1-click)'}
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
          <div className="p-4 sm:p-6 overflow-x-auto flex justify-center bg-slate-100/60">
            {/* EXACT MASTER REFERENCE SUPPLIER BILL PAD (STANDARD A5: 148mm x 210mm) */}
            <div
              ref={printAreaRef}
              id="supplier-printable-bill"
              className="bg-white text-slate-900 shadow-2xl font-tamil w-[142mm] min-h-[204mm] max-w-[142mm] mx-auto box-border flex flex-col justify-between p-3.5 border-[2.5px] border-[#0a4d2e] rounded-2xl select-none"
              style={{
                fontFamily: '"Noto Sans Tamil", "Mukta Malar", sans-serif',
                borderColor: '#0a4d2e',
                boxSizing: 'border-box'
              }}
            >
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col justify-between">
                {/* 1. Header Area (No Inner Box - Open & Prominent matching Master Reference) */}
                <div className="relative pb-1">
                  <div className="flex items-start justify-between">
                    {/* Left: DEVA Logo in Rounded Box with text */}
                    <div className="w-[84px] h-[72px] rounded-xl border-2 border-[#0a4d2e] p-1 flex flex-col items-center justify-center shrink-0 bg-white shadow-2xs">
                      <img
                        src="/deva-logo.png"
                        alt="DEVA"
                        className="h-[46px] w-auto object-contain"
                      />
                    </div>

                    {/* Center & Right Business Details */}
                    <div className="flex-1 ml-3 flex flex-col justify-between">
                      {/* Row 1: Title + Vertical divider + Phone Numbers */}
                      <div className="flex items-center justify-between">
                        <h1 className="text-2xl sm:text-[26px] font-black text-[#0a4d2e] tracking-tight leading-none font-tamil">
                          {settings.storeName || 'தேவா & கோ'}
                        </h1>
                        <div className="h-6 w-[2px] bg-[#0a4d2e] mx-2" />
                        <div className="flex items-center gap-1.5 font-mono font-black text-[#0a4d2e] leading-tight">
                          <div className="w-4 h-4 rounded-full bg-[#0a4d2e] flex items-center justify-center shrink-0 shadow-2xs">
                            <Phone className="w-2.5 h-2.5 text-white fill-white" />
                          </div>
                          <div className="text-right text-[11px] sm:text-xs">
                            <div>{phone1 || '94433 18359'}</div>
                            <div>{phone2 || '95853 56765'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Tagline + Bill Number in RED */}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs sm:text-[13px] font-extrabold text-[#0a4d2e] leading-tight font-tamil">
                          {settings.tagline || 'தக்காளி & காய்கறி கமிஷன் மண்டி'}
                        </span>
                        <span className="text-sm sm:text-base font-black text-red-600 font-mono tracking-tight">
                          எண் : <span className="font-black">{bill.billNumber || bill.lotNumber || '54'}</span>
                        </span>
                      </div>

                      {/* Row 3: Full-width Business Address in RED */}
                      <div className="text-[10.5px] sm:text-[11.5px] font-bold text-red-600 leading-tight mt-1 font-tamil">
                        {settings.address || '54 A, அண்ணல் காந்தி மார்க்கெட், திண்டுக்கல் - 624 001'}
                      </div>
                    </div>
                  </div>

                  {/* Decorative Light-Green Wave & Centered Proprietor Banner */}
                  <div className="relative mt-2 mb-1 flex items-center justify-center overflow-hidden py-1">
                    {/* Decorative Wave SVG behind */}
                    <svg
                      className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-8 text-[#bbf7d0] pointer-events-none"
                      viewBox="0 0 500 32"
                      preserveAspectRatio="none"
                      fill="currentColor"
                    >
                      <path d="M0,16 C100,32 180,2 250,16 C320,30 400,2 500,16 L500,30 L0,30 Z" opacity="0.8" />
                    </svg>

                    {/* Proprietor Pill in Center */}
                    <div className="relative z-10 bg-[#e2f5e8] border border-[#0a4d2e]/50 px-8 py-0.5 rounded-full text-center shadow-2xs">
                      <span className="text-xs sm:text-[13px] font-bold text-slate-900 font-tamil">
                        Prop: <span className="text-red-600 font-black">{settings.proprietor || 'R.தேவதாஸ்'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Customer & Date Line: திரு (Left) & தேதி (Right) */}
                  <div className="flex justify-between items-center text-[13px] font-black text-slate-900 px-1 py-1 mt-0.5">
                    <div className="flex items-baseline flex-1 mr-3">
                      <span className="font-black text-[#0a4d2e] shrink-0 font-tamil text-[14px]">திரு : </span>
                      <span className="font-bold text-slate-900 ml-2 px-2 border-b-2 border-slate-700 flex-1 truncate font-tamil">
                        {supplierName} {supplierPhone ? `(${supplierPhone})` : ''}
                      </span>
                    </div>
                    <div className="flex items-baseline shrink-0">
                      <span className="font-black text-[#0a4d2e] font-tamil text-[14px]">தேதி : </span>
                      <span className="font-mono font-bold text-xs sm:text-[13px] ml-2 px-2 border-b-2 border-slate-700 min-w-[95px] text-center">
                        {dateFormatted}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Main 4-Column Table with Large Open Vertical Track Area (~85mm) */}
                <div className="w-full border-[2.5px] border-[#0a4d2e] rounded-t-xl overflow-hidden mt-1 bg-white flex flex-col flex-1">
                  {/* Table Header Row */}
                  <div className="flex border-b-[2.5px] border-[#0a4d2e] text-[#0a4d2e] font-black bg-white text-center text-[13px] sm:text-sm font-tamil">
                    <div className="w-[14%] py-1.5 px-1 border-r-[2.5px] border-[#0a4d2e] flex items-center justify-center">
                      விலை
                    </div>
                    <div className="w-[48%] py-1.5 px-2 border-r-[2.5px] border-[#0a4d2e] flex items-center justify-center">
                      விவரம்
                    </div>
                    <div className="w-[14%] py-1.5 px-1 border-r-[2.5px] border-[#0a4d2e] flex items-center justify-center">
                      எண்ணம்
                    </div>
                    <div className="w-[24%]">
                      <div className="text-[13px] font-black border-b-[2px] border-[#0a4d2e] py-0.5">
                        மொத்தம்
                      </div>
                      <div className="flex text-[11px] font-bold py-0.5">
                        <span className="w-2/3 border-r-[2px] border-[#0a4d2e]">ரூ.</span>
                        <span className="w-1/3">பை.</span>
                      </div>
                    </div>
                  </div>

                  {/* Table Body: Large Open Vertical Area matching Master Reference (~85mm tall) */}
                  <div className="relative min-h-[85mm] flex-1 flex">
                    {/* Continuous Vertical Column Tracks running from top to bottom */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      <div className="w-[14%] border-r-[2.5px] border-[#0a4d2e] h-full" />
                      <div className="w-[48%] border-r-[2.5px] border-[#0a4d2e] h-full" />
                      <div className="w-[14%] border-r-[2.5px] border-[#0a4d2e] h-full" />
                      <div className="w-[24%] flex h-full">
                        <div className="w-2/3 border-r-[2px] border-[#0a4d2e] h-full" />
                        <div className="w-1/3 h-full" />
                      </div>
                    </div>

                    {/* Purchase Items Rendered at Top */}
                    <div className="relative z-10 w-full">
                      {items.map((item, idx) => {
                        const split = splitAmount(item.amount);
                        return (
                          <div key={idx} className="flex font-bold text-slate-900 min-h-[7.5mm] items-center text-xs sm:text-[13px]">
                            <div className="w-[14%] text-center font-mono py-1">
                              {item.rate > 0 ? `₹${item.rate}` : '—'}
                            </div>
                            <div className="w-[48%] text-left px-3 truncate py-1 font-tamil font-bold">
                              {item.description || 'தக்காளி பெரிய பெட்டி'}
                            </div>
                            <div className="w-[14%] text-center font-mono font-black py-1">
                              {item.quantity || item.bigEquivalent || '—'}
                            </div>
                            <div className="w-[24%] flex items-center font-mono font-black py-1">
                              <span className="w-2/3 text-right pr-2">{split.rupees}</span>
                              <span className="w-1/3 text-center text-[10.5px]">{split.paise}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Financial Summary Section - EXACT REPRODUCTION OF MASTER REFERENCE */}
                <div className="border-[2.5px] border-[#0a4d2e] border-t-0 text-xs sm:text-[12.5px] font-bold bg-white">
                  {/* Row 1: மொத்தத் தொகை (Gross Total) */}
                  <div className="flex border-b-[2px] border-[#0a4d2e] h-[8mm] items-center bg-[#daf0e3]">
                    <div className="w-[76%] px-3 text-right border-r-[2.5px] border-[#0a4d2e] font-black text-[#0a4d2e] text-xs sm:text-[13px] font-tamil">
                      மொத்தத் தொகை (Gross Total) :
                    </div>
                    <div className="w-[24%] px-0 text-right font-mono font-black text-[#0a4d2e] h-full flex items-center">
                      <span className="w-2/3 text-right pr-2 border-r-[2px] border-[#0a4d2e] h-full flex items-center justify-end font-mono font-black text-xs sm:text-sm">{splitGross.rupees}</span>
                      <span className="w-1/3 text-center text-[10.5px] h-full flex items-center justify-center font-mono font-black">{splitGross.paise}</span>
                    </div>
                  </div>

                  {/* Row 2: கமிஷன் & கேட் */}
                  <div className="flex border-b-[2px] border-[#0a4d2e] h-[8mm] items-center bg-white">
                    <div className="w-[45%] px-3 flex justify-between items-center border-r-[2px] border-[#0a4d2e] h-full">
                      <span className="text-slate-900 font-extrabold font-tamil">கமிஷன் :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-1 min-w-[50px] text-right">
                        {comm > 0 ? comm : ''}
                      </span>
                    </div>
                    <div className="w-[31%] px-3 flex justify-between items-center border-r-[2.5px] border-[#0a4d2e] h-full">
                      <span className="text-slate-900 font-extrabold font-tamil">கேட் : :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-1 min-w-[40px] text-right">
                        {gate > 0 ? gate : ''}
                      </span>
                    </div>
                    <div className="w-[24%] h-full flex">
                      <span className="w-2/3 border-r-[2px] border-[#0a4d2e] h-full" />
                      <span className="w-1/3 h-full" />
                    </div>
                  </div>

                  {/* Row 3: கூலி & வாடகை */}
                  <div className="flex border-b-[2px] border-[#0a4d2e] h-[8mm] items-center bg-white">
                    <div className="w-[45%] px-3 flex justify-between items-center border-r-[2px] border-[#0a4d2e] h-full">
                      <span className="text-slate-900 font-extrabold font-tamil">கூலி :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-1 min-w-[50px] text-right">
                        {coolie > 0 ? coolie : ''}
                      </span>
                    </div>
                    <div className="w-[31%] px-3 flex justify-between items-center border-r-[2.5px] border-[#0a4d2e] h-full">
                      <span className="text-slate-900 font-extrabold font-tamil">வாடகை :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-1 min-w-[40px] text-right">
                        {rent > 0 ? rent : ''}
                      </span>
                    </div>
                    <div className="w-[24%] h-full flex">
                      <span className="w-2/3 border-r-[2px] border-[#0a4d2e] h-full" />
                      <span className="w-1/3 h-full" />
                    </div>
                  </div>

                  {/* Row 4: பற்று (முன் பாக்கி) */}
                  <div className="flex border-b-[2px] border-[#0a4d2e] h-[8mm] items-center bg-white">
                    <div className="w-[76%] px-3 flex justify-between items-center border-r-[2.5px] border-[#0a4d2e] h-full">
                      <span className="text-slate-900 font-extrabold font-tamil">பற்று (முன் பாக்கி) :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-2 min-w-[80px] text-right">
                        {prevBal !== 0 ? prevBal : ''}
                      </span>
                    </div>
                    <div className="w-[24%] h-full flex">
                      <span className="w-2/3 border-r-[2px] border-[#0a4d2e] h-full" />
                      <span className="w-1/3 h-full" />
                    </div>
                  </div>

                  {/* Row 5: மொத்தம் */}
                  <div className="flex border-b-[2.5px] border-[#0a4d2e] h-[9mm] items-center bg-[#daf0e3]">
                    <div className="w-[76%] px-3 text-center border-r-[2.5px] border-[#0a4d2e] font-black text-[#0a4d2e] text-sm sm:text-base tracking-wider font-tamil">
                      மொத்தம் :
                    </div>
                    <div className="w-[24%] px-0 text-right font-mono font-black text-[#0a4d2e] h-full flex items-center">
                      <span className="w-2/3 text-right pr-2 border-r-[2px] border-[#0a4d2e] h-full flex items-center justify-end text-sm sm:text-base font-black">{splitTotal.rupees}</span>
                      <span className="w-1/3 text-center text-xs h-full flex items-center justify-center font-mono font-black">{splitTotal.paise}</span>
                    </div>
                  </div>

                  {/* Row 6: PAYMENT ROW (கொடுத்தது & மீதி பாக்கி) EXACT 50/50 SPLIT */}
                  <div className="flex h-[9mm] items-stretch bg-white">
                    {/* Left 50%: கொடுத்தது */}
                    <div className="w-1/2 flex items-stretch border-r-[2.5px] border-[#0a4d2e]">
                      <div className="w-[45%] px-2.5 flex items-center justify-start border-r-[2px] border-[#0a4d2e] font-black text-[#0a4d2e] text-xs sm:text-[13px] font-tamil">
                        கொடுத்தது :
                      </div>
                      <div className="w-[55%] px-2.5 flex items-center justify-end font-mono font-black text-slate-900 bg-white text-xs sm:text-[13.5px]">
                        {amountPaid > 0 ? `₹${splitPaid.rupees}.${splitPaid.paise}` : '₹0.00'}
                      </div>
                    </div>

                    {/* Right 50%: மீதி பாக்கி */}
                    <div className="w-1/2 flex items-stretch">
                      <div className="w-[45%] px-2.5 flex items-center justify-start border-r-[2px] border-[#0a4d2e] font-black text-[#0a4d2e] text-xs sm:text-[13px] font-tamil">
                        மீதி பாக்கி :
                      </div>
                      <div className={`w-[55%] px-2.5 flex items-center justify-end font-mono font-black text-xs sm:text-[13.5px] bg-white ${
                        remainingBalance > 0 ? 'text-red-600' : remainingBalance < 0 ? 'text-blue-700' : 'text-slate-900'
                      }`}>
                        {remainingBalance < 0 ? `-₹${splitRemaining.rupees}.${splitRemaining.paise}` : `₹${splitRemaining.rupees}.${splitRemaining.paise}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Bottom Footer Section */}
              <div className="pt-2 pb-0.5 text-center shrink-0">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[2px] w-24 bg-[#0a4d2e]" />
                  <span className="text-xs sm:text-[13px] font-black text-[#0a4d2e] tracking-widest font-tamil">
                    {settings.footerNote || 'நன்றி மீண்டும் வருக'}
                  </span>
                  <div className="h-[2px] w-24 bg-[#0a4d2e]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Print CSS for Reference A5 Supplier Bill Format (148mm x 210mm) */}
      <style>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 5mm;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
          }
          body * {
            visibility: hidden;
          }
          #supplier-printable-bill, #supplier-printable-bill * {
            visibility: visible;
          }
          #supplier-printable-bill {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 140mm !important;
            max-width: 140mm !important;
            height: 202mm !important;
            max-height: 202mm !important;
            margin: 0 !important;
            padding: 3.5mm !important;
            border: 2.5px solid #0a4d2e !important;
            border-radius: 16px !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SupplierPrintModal;
