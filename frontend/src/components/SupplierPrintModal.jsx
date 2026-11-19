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
              className="bg-white text-slate-900 shadow-md font-tamil w-[138mm] min-h-[198mm] max-w-[138mm] mx-auto box-border flex flex-col justify-between p-3.5 border-2 border-[#125538] rounded-2xl select-none"
              style={{
                fontFamily: '"Noto Sans Tamil", "Mukta Malar", sans-serif',
                borderColor: '#125538',
                boxSizing: 'border-box'
              }}
            >
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col">
                {/* 1. Header Card */}
                <div className="border-2 border-[#125538] rounded-xl p-2 mb-1 bg-white">
                  <div className="flex items-start justify-between">
                    {/* Left: DEVA Logo Box */}
                    <div className="w-[68px] h-[58px] rounded-lg border border-[#125538]/50 p-1 flex items-center justify-center shrink-0 bg-white">
                      <img
                        src="/deva-logo.png"
                        alt="DEVA"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Center & Right Details */}
                    <div className="flex-1 ml-2.5">
                      {/* Line 1: Title + Phone */}
                      <div className="flex items-center justify-between">
                        <h1 className="text-lg sm:text-xl font-black text-[#125538] tracking-tight leading-none">
                          {settings.storeName || 'தேவா & கோ'}
                        </h1>
                        {(phone1 || phone2) && (
                          <>
                            <div className="h-4 w-px bg-[#125538] mx-1.5" />
                            <div className="flex items-center gap-1.5 text-[9.5px] font-black text-[#125538] leading-tight font-mono">
                              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#125538] text-white shrink-0">
                                <Phone className="w-2 h-2 text-white fill-white" />
                              </span>
                              <div className="text-right">
                                {phone1 && <div>{phone1}</div>}
                                {phone2 && <div>{phone2}</div>}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Line 2: Tagline + Bill Number in RED */}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] font-bold text-[#125538] leading-tight">
                          {settings.tagline || 'தக்காளி & காய்கறி கமிஷன் மண்டி'}
                        </span>
                        <span className="text-xs font-black text-red-600 font-mono tracking-tight">
                          எண் : <span className="font-black">{bill.billNumber || bill.lotNumber || '54'}</span>
                        </span>
                      </div>

                      {/* Line 3: Address in RED */}
                      <div className="text-[9.5px] font-bold text-red-600 leading-tight mt-0.5">
                        {settings.address || '54 A, அண்ணல் காந்தி மார்க்கெட், திண்டுக்கல் - 624 001'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Proprietor Curved Pill */}
                <div className="flex justify-center my-0.5">
                  <div className="bg-[#dcf0e2] border border-[#125538]/40 px-6 py-0.5 rounded-full text-center shadow-2xs">
                    <span className="text-xs font-bold text-slate-800">
                      Prop: <span className="text-red-600 font-black">{settings.proprietor || 'R.தேவதாஸ்'}</span>
                    </span>
                  </div>
                </div>

                {/* 3. Customer & Date Line: திரு (Left) & தேதி (Right) */}
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 px-1 py-1">
                  <div className="flex items-baseline flex-1 mr-2">
                    <span className="font-bold text-slate-800 shrink-0">திரு : </span>
                    <span className="font-bold text-slate-900 ml-1.5 px-2 border-b border-slate-700 flex-1 truncate">
                      {supplierName} {supplierPhone ? `(${supplierPhone})` : ''}
                    </span>
                  </div>
                  <div className="flex items-baseline shrink-0">
                    <span className="font-bold text-slate-800">தேதி : </span>
                    <span className="font-mono font-bold text-xs ml-1.5 px-2 border-b border-slate-700 min-w-[85px] text-center">
                      {dateFormatted}
                    </span>
                  </div>
                </div>

                {/* 4. Main 4-Column Table with Large Open Vertical Track Area (~76mm) */}
                <div className="w-full border-2 border-[#125538] text-[11px] mt-0.5 bg-white flex flex-col flex-1">
                  {/* Table Header Row */}
                  <div className="flex border-b-2 border-[#125538] text-[#125538] font-black bg-slate-50/60 text-center text-xs">
                    <div className="w-[15%] py-1.5 px-1 border-r-2 border-[#125538] flex items-center justify-center">
                      விலை
                    </div>
                    <div className="w-[48%] py-1.5 px-2 border-r-2 border-[#125538] flex items-center justify-center">
                      விவரம்
                    </div>
                    <div className="w-[15%] py-1.5 px-1 border-r-2 border-[#125538] flex items-center justify-center">
                      எண்ணம்
                    </div>
                    <div className="w-[22%]">
                      <div className="text-[11px] font-black border-b border-[#125538] py-0.5">
                        மொத்தம்
                      </div>
                      <div className="flex text-[9px] font-bold py-0.5">
                        <span className="w-2/3 border-r border-[#125538]">ரூ.</span>
                        <span className="w-1/3">பை.</span>
                      </div>
                    </div>
                  </div>

                  {/* Table Body: Large Open Vertical Area matching Master Reference (~76mm tall) */}
                  <div className="relative min-h-[76mm] flex-1 flex">
                    {/* Background Vertical Column Track Lines that run continuously to the bottom */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      <div className="w-[15%] border-r-2 border-[#125538] h-full" />
                      <div className="w-[48%] border-r-2 border-[#125538] h-full" />
                      <div className="w-[15%] border-r-2 border-[#125538] h-full" />
                      <div className="w-[22%] flex h-full">
                        <div className="w-2/3 border-r border-[#125538]/50 h-full" />
                        <div className="w-1/3 h-full" />
                      </div>
                    </div>

                    {/* Purchase Items Rendered at Top of this Open Track Area */}
                    <div className="relative z-10 w-full">
                      {items.map((item, idx) => {
                        const split = splitAmount(item.amount);
                        return (
                          <div key={idx} className="flex font-semibold text-slate-900 min-h-[6.5mm] items-center text-xs">
                            <div className="w-[15%] text-center font-mono py-1">
                              {item.rate > 0 ? `₹${item.rate}` : '—'}
                            </div>
                            <div className="w-[48%] text-left px-2 truncate py-1">
                              {item.description || 'தக்காளி பெரிய பெட்டி'}
                            </div>
                            <div className="w-[15%] text-center font-mono font-bold py-1">
                              {item.quantity || item.bigEquivalent || '—'}
                            </div>
                            <div className="w-[22%] flex items-center font-mono font-bold py-1">
                              <span className="w-2/3 text-right pr-1.5">{split.rupees}</span>
                              <span className="w-1/3 text-center text-[10px]">{split.paise}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 5. Financial Summary Section - EXACT ATTACHMENT TO TABLE */}
                <div className="border-2 border-[#125538] border-t-0 text-xs font-bold bg-white">
                  {/* Row 1: மொத்தத் தொகை (Gross Total) */}
                  <div className="flex border-b border-[#125538] h-[7.2mm] items-center bg-[#dcf0e2]">
                    <div className="w-[78%] px-2 text-right border-r-2 border-[#125538] font-black text-[#125538] text-xs">
                      மொத்தத் தொகை (Gross Total) :
                    </div>
                    <div className="w-[22%] px-0 text-right font-mono font-black text-[#125538] h-full flex items-center">
                      <span className="w-2/3 text-right pr-1.5 border-r border-[#125538]/50 h-full flex items-center justify-end">{splitGross.rupees}</span>
                      <span className="w-1/3 text-center text-[10px] h-full flex items-center justify-center">{splitGross.paise}</span>
                    </div>
                  </div>

                  {/* Row 2: கமிஷன் & கேட் */}
                  <div className="flex border-b border-[#125538] h-[7.2mm] items-center bg-white">
                    <div className="w-[45%] px-2 flex justify-between items-center border-r-2 border-[#125538] h-full">
                      <span className="text-slate-800 font-bold">கமிஷன் :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-1 min-w-[45px] text-right">
                        {comm > 0 ? comm : ''}
                      </span>
                    </div>
                    <div className="w-[33%] px-2 flex justify-between items-center border-r-2 border-[#125538] h-full">
                      <span className="text-slate-800 font-bold">கேட் : :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-1 min-w-[38px] text-right">
                        {gate > 0 ? gate : ''}
                      </span>
                    </div>
                    <div className="w-[22%] h-full flex">
                      <span className="w-2/3 border-r border-[#125538]/50 h-full" />
                      <span className="w-1/3 h-full" />
                    </div>
                  </div>

                  {/* Row 3: கூலி & வாடகை */}
                  <div className="flex border-b border-[#125538] h-[7.2mm] items-center bg-white">
                    <div className="w-[45%] px-2 flex justify-between items-center border-r-2 border-[#125538] h-full">
                      <span className="text-slate-800 font-bold">கூலி :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-1 min-w-[45px] text-right">
                        {coolie > 0 ? coolie : ''}
                      </span>
                    </div>
                    <div className="w-[33%] px-2 flex justify-between items-center border-r-2 border-[#125538] h-full">
                      <span className="text-slate-800 font-bold">வாடகை :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-1 min-w-[38px] text-right">
                        {rent > 0 ? rent : ''}
                      </span>
                    </div>
                    <div className="w-[22%] h-full flex">
                      <span className="w-2/3 border-r border-[#125538]/50 h-full" />
                      <span className="w-1/3 h-full" />
                    </div>
                  </div>

                  {/* Row 4: பற்று (முன் பாக்கி) */}
                  <div className="flex border-b border-[#125538] h-[7.2mm] items-center bg-white">
                    <div className="w-[78%] px-2 flex justify-between items-center border-r-2 border-[#125538] h-full">
                      <span className="text-slate-800 font-bold">பற்று (முன் பாக்கி) :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-2 min-w-[70px] text-right">
                        {prevBal !== 0 ? prevBal : ''}
                      </span>
                    </div>
                    <div className="w-[22%] h-full flex">
                      <span className="w-2/3 border-r border-[#125538]/50 h-full" />
                      <span className="w-1/3 h-full" />
                    </div>
                  </div>

                  {/* Row 5: மொத்தம் */}
                  <div className="flex border-b-2 border-[#125538] h-[8mm] items-center bg-[#dcf0e2]">
                    <div className="w-[78%] px-2 text-center border-r-2 border-[#125538] font-black text-[#125538] text-sm tracking-wide">
                      மொத்தம் :
                    </div>
                    <div className="w-[22%] px-0 text-right font-mono font-black text-[#125538] h-full flex items-center">
                      <span className="w-2/3 text-right pr-1.5 border-r border-[#125538]/50 h-full flex items-center justify-end">{splitTotal.rupees}</span>
                      <span className="w-1/3 text-center text-[10px] h-full flex items-center justify-center">{splitTotal.paise}</span>
                    </div>
                  </div>

                  {/* Row 6: NEW PAYMENT ROW (கொடுத்தது & மீதி பாக்கி) EXACT 50/50 SPLIT */}
                  <div className="flex h-[8mm] items-stretch bg-white">
                    {/* Left 50%: கொடுத்தது */}
                    <div className="w-1/2 flex items-stretch border-r-2 border-[#125538]">
                      <div className="w-[45%] px-2 flex items-center justify-start border-r border-[#125538] font-black text-[#125538] text-xs">
                        கொடுத்தது :
                      </div>
                      <div className="w-[55%] px-2 flex items-center justify-end font-mono font-black text-slate-900 bg-white text-xs">
                        {amountPaid > 0 ? `₹${splitPaid.rupees}.${splitPaid.paise}` : '₹0.00'}
                      </div>
                    </div>

                    {/* Right 50%: மீதி பாக்கி */}
                    <div className="w-1/2 flex items-stretch">
                      <div className="w-[45%] px-2 flex items-center justify-start border-r border-[#125538] font-black text-[#125538] text-xs">
                        மீதி பாக்கி :
                      </div>
                      <div className={`w-[55%] px-2 flex items-center justify-end font-mono font-black text-xs bg-white ${
                        remainingBalance > 0 ? 'text-red-600' : remainingBalance < 0 ? 'text-blue-700' : 'text-slate-900'
                      }`}>
                        {remainingBalance < 0 ? `-₹${splitRemaining.rupees}.${splitRemaining.paise}` : `₹${splitRemaining.rupees}.${splitRemaining.paise}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Bottom Footer Section */}
              <div className="pt-2 text-center shrink-0">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-0.5 w-16 bg-[#125538]" />
                  <span className="text-xs font-black text-[#125538] tracking-wider font-tamil">
                    {settings.footerNote || 'நன்றி மீண்டும் வருக'}
                  </span>
                  <div className="h-0.5 w-16 bg-[#125538]" />
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
            width: 138mm !important;
            max-width: 138mm !important;
            height: 198mm !important;
            max-height: 198mm !important;
            margin: 0 !important;
            padding: 3.5mm !important;
            border: 2px solid #125538 !important;
            border-radius: 14px !important;
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
