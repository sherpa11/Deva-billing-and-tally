import React, { useRef, useState, useEffect } from 'react';
import { Printer, X, ChevronDown, ImageDown, Monitor, Loader2 } from 'lucide-react';
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
    const parts = num.toFixed(2).split('.');
    return {
      rupees: Number(parts[0]).toLocaleString('en-IN'),
      paise: parts[1] === '00' ? '00' : parts[1]
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

  // For Standard A5 portrait size (148mm x 210mm), 8 total display rows fits cleanly without overflowing
  const totalDisplayRows = 8;
  const emptyRowsCount = Math.max(0, totalDisplayRows - items.length);

  const grossTotal = Number(bill.grossTotal) || Number(bill.totalAmount) || items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const deductions = bill.deductions || {};
  const comm = Number(deductions.commission) || 0;
  const gate = Number(deductions.gate) || 0;
  const coolie = Number(deductions.coolie) || 0;
  const rent = Number(deductions.rent) || 0;
  const debit = Number(deductions.debit) || 0;
  const totalDeductions = Number(bill.totalDeductions) || (comm + gate + coolie + rent + debit);
  const netPayable = Number(bill.netPayable) !== undefined ? Number(bill.netPayable) : Math.round((grossTotal - totalDeductions) * 100) / 100;

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
            {/* EXACT OFFICIAL SUPPLIER BILL FORMAT (STANDARD A5: 148mm x 210mm) */}
            <div
              ref={printAreaRef}
              id="supplier-printable-bill"
              className="bg-white text-slate-900 shadow-md font-tamil w-[148mm] min-h-[200mm] max-w-[148mm] mx-auto box-border flex flex-col justify-between p-3.5 border-2 border-[#125538] rounded-2xl select-none"
              style={{
                fontFamily: '"Noto Sans Tamil", "Mukta Malar", sans-serif',
                borderColor: '#125538'
              }}
            >
              {/* Top Header Card */}
              <div>
                <div className="border-2 border-[#125538] rounded-xl p-2 mb-1.5 bg-white">
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
                            <div className="flex items-center gap-1 text-[9.5px] font-black text-[#125538] leading-tight font-mono">
                              <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-[#125538] text-white text-[7.5px]">📞</span>
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

                {/* Proprietor Curved Pill */}
                <div className="flex justify-center my-1">
                  <div className="bg-[#e4f3ea] border border-[#125538]/30 px-6 py-0.5 rounded-full text-center shadow-xs">
                    <span className="text-xs font-bold text-slate-800">
                      Prop: <span className="text-red-600 font-black">{settings.proprietor || 'R.தேவதாஸ்'}</span>
                    </span>
                  </div>
                </div>

                {/* Customer & Date Line: திரு (Left) & தேதி (Right) */}
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 px-1 py-1">
                  <div className="flex items-baseline flex-1 mr-2">
                    <span className="font-bold text-slate-800 shrink-0">திரு : </span>
                    <span className="font-bold text-slate-900 ml-1.5 px-2 border-b border-slate-700 flex-1 truncate">
                      {supplierName} {supplierPhone ? `(${supplierPhone})` : ''}
                    </span>
                  </div>
                  <div className="flex items-baseline shrink-0">
                    <span className="font-bold text-slate-800">தேதி : </span>
                    <span className="font-mono font-bold text-xs ml-1.5 px-2 border-b border-slate-700 min-w-[80px] text-center">
                      {dateFormatted}
                    </span>
                  </div>
                </div>

                {/* Main 4-Column Table */}
                <table className="w-full text-center border-collapse border-2 border-[#125538] text-[11px] mt-0.5">
                  <thead>
                    <tr className="border-b-2 border-[#125538] text-[#125538] font-black bg-slate-50/60">
                      <th className="border-r-2 border-[#125538] py-1 px-1 w-[16%]">விலை</th>
                      <th className="border-r-2 border-[#125538] py-1 px-2 text-center w-[45%]">விவரம்</th>
                      <th className="border-r-2 border-[#125538] py-1 px-1 w-[16%]">எண்ணணம்</th>
                      <th className="py-0 px-1 w-[23%]">
                        <div className="text-[11px] font-black border-b border-[#125538] py-0.5">மொத்தம்</div>
                        <div className="flex text-[9px] font-bold py-0.5">
                          <span className="w-2/3 border-r border-[#125538]">ரூ.</span>
                          <span className="w-1/3">பை.</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const split = splitAmount(item.amount);
                      return (
                        <tr key={idx} className="border-b border-[#125538]/70 font-semibold text-slate-900 h-6">
                          <td className="border-r-2 border-[#125538] py-0.5 px-1 text-center font-mono">
                            {item.rate > 0 ? `₹${item.rate}` : '—'}
                          </td>
                          <td className="border-r-2 border-[#125538] py-0.5 px-2 text-left truncate">
                            {item.description || 'தக்காளி பெட்டி'}
                          </td>
                          <td className="border-r-2 border-[#125538] py-0.5 px-1 text-center font-mono font-bold">
                            {item.quantity || item.bigEquivalent || '—'}
                          </td>
                          <td className="py-0.5 px-1 text-right font-mono font-bold">
                            <div className="flex items-center">
                              <span className="w-2/3 text-right pr-1 border-r border-[#125538]/40">{split.rupees}</span>
                              <span className="w-1/3 text-center text-[9px]">{split.paise}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Ruled blank rows matching bill pad */}
                    {Array.from({ length: emptyRowsCount }).map((_, idx) => (
                      <tr key={`empty-${idx}`} className="border-b border-[#125538]/50 h-5">
                        <td className="border-r-2 border-[#125538]"></td>
                        <td className="border-r-2 border-[#125538]"></td>
                        <td className="border-r-2 border-[#125538]"></td>
                        <td>
                          <div className="flex h-full">
                            <span className="w-2/3 border-r border-[#125538]/30"></span>
                            <span className="w-1/3"></span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Deductions & Financial Summary Section */}
                <div className="border-2 border-[#125538] border-t-0 text-[10.5px] font-bold">
                  {/* Row 1: மொத்தத் தொகை (Gross Total) */}
                  <div className="flex border-b border-[#125538] h-6 items-center bg-[#e4f3ea]">
                    <div className="w-[77%] px-2 text-right border-r-2 border-[#125538] font-black text-[#125538] text-[11px]">
                      மொத்தத் தொகை (Gross Total) :
                    </div>
                    <div className="w-[23%] px-1 text-right font-mono font-black text-[#125538]">
                      <div className="flex items-center">
                        <span className="w-2/3 text-right pr-1 border-r border-[#125538]/40">{splitAmount(grossTotal).rupees}</span>
                        <span className="w-1/3 text-center text-[9px]">{splitAmount(grossTotal).paise}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: கமிஷன் & கேட் */}
                  <div className="flex border-b border-[#125538] h-6 items-center">
                    <div className="w-[43%] px-2 flex justify-between items-baseline border-r border-dotted border-[#125538]/60">
                      <span className="text-slate-800 font-bold">கமிஷன் :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-1 min-w-[40px] text-right">
                        {comm > 0 ? comm : ''}
                      </span>
                    </div>
                    <div className="w-[34%] px-2 flex justify-between items-baseline border-r-2 border-[#125538]">
                      <span className="text-slate-800 font-bold">கேட் : :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-1 min-w-[34px] text-right">
                        {gate > 0 ? gate : ''}
                      </span>
                    </div>
                    <div className="w-[23%] px-1 text-right font-mono text-[9px] text-slate-700"></div>
                  </div>

                  {/* Row 3: கூலி & வாடகை */}
                  <div className="flex border-b border-[#125538] h-6 items-center">
                    <div className="w-[43%] px-2 flex justify-between items-baseline border-r border-dotted border-[#125538]/60">
                      <span className="text-slate-800 font-bold">கூலி :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-1 min-w-[40px] text-right">
                        {coolie > 0 ? coolie : ''}
                      </span>
                    </div>
                    <div className="w-[34%] px-2 flex justify-between items-baseline border-r-2 border-[#125538]">
                      <span className="text-slate-800 font-bold">வாடகை :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-1 min-w-[34px] text-right">
                        {rent > 0 ? rent : ''}
                      </span>
                    </div>
                    <div className="w-[23%] px-1 text-right font-mono text-[9px] text-slate-700"></div>
                  </div>

                  {/* Row 4: பற்று (முன் பாக்கி) */}
                  <div className="flex border-b border-[#125538] h-6 items-center">
                    <div className="w-[77%] px-2 flex justify-between items-baseline border-r-2 border-[#125538]">
                      <span className="text-slate-800 font-bold">பற்று (முன் பாக்கி) :</span>
                      <span className="font-mono font-bold text-slate-900 border-b border-dotted border-slate-600 px-2 min-w-[65px] text-right">
                        {debit > 0 ? debit : ''}
                      </span>
                    </div>
                    <div className="w-[23%] px-1 text-right font-mono text-[9px] text-slate-700"></div>
                  </div>

                  {/* Row 5: மொத்தம் */}
                  <div className="flex h-6.5 items-center bg-[#e4f3ea]">
                    <div className="w-[77%] px-2 text-center border-r-2 border-[#125538] font-black text-[#125538] text-[11px]">
                      மொத்தம் :
                    </div>
                    <div className="w-[23%] px-1 text-right font-mono font-black text-[#125538]">
                      <div className="flex items-center">
                        <span className="w-2/3 text-right pr-1 border-r border-[#125538]/40">{splitAmount(netPayable).rupees}</span>
                        <span className="w-1/3 text-center text-[9px]">{splitAmount(netPayable).paise}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Section */}
              <div className="pt-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-0.5 w-12 bg-[#125538]/60" />
                  <span className="text-xs font-black text-[#125538] tracking-wider">
                    {settings.footerNote || 'தாங்கள் வருகை நல்வரவு !'}
                  </span>
                  <div className="h-0.5 w-12 bg-[#125538]/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Print CSS for Exact A5 Supplier Bill Format (148mm x 210mm) */}
      <style>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 5mm;
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
            height: 200mm !important;
            max-height: 200mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            border: 2px solid #125538 !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            page-break-after: avoid;
            page-break-inside: avoid;
            overflow: hidden !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SupplierPrintModal;
