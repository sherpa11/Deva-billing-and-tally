import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, ChevronDown, ImageDown, Monitor, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { downloadBillImage } from '../utils/billImageDownload';
import SupplierBillPad from './bills/SupplierBillPad';

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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  };

  const dateFormatted = formatDate(bill.transactionDate || bill.createdAt);

  /**
   * Guaranteed 1-Sheet A5 Print via Isolated Hidden Iframe
   * This eliminates all background page overflow, modals, backdrops, and multi-page height bugs.
   */
  const handlePrint = () => {
    setShowOptions(false);
    if (!printAreaRef.current) {
      window.print();
      return;
    }

    try {
      let printFrame = document.getElementById('supplier-bill-print-iframe');
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'supplier-bill-print-iframe';
        printFrame.style.position = 'fixed';
        printFrame.style.left = '-99999px';
        printFrame.style.top = '0';
        printFrame.style.width = '148mm';
        printFrame.style.height = '210mm';
        printFrame.style.border = 'none';
        printFrame.style.zIndex = '-9999';
        document.body.appendChild(printFrame);
      }

      const frameDoc = printFrame.contentDocument || printFrame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Supplier_Bill_${dateFormatted}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Mukta+Malar:wght@400;600;700;800&family=Noto+Sans+Tamil:wght@400;600;700;800;900&display=swap" rel="stylesheet">
            <style>
              @page {
                size: A5 portrait !important;
                margin: 0 !important;
              }
              *, *:before, *:after {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 148mm !important;
                height: 210mm !important;
                max-width: 148mm !important;
                max-height: 210mm !important;
                overflow: hidden !important;
                background: #ffffff !important;
                font-family: 'Noto Sans Tamil', 'Mukta Malar', sans-serif;
              }
              .a5-sheet-wrapper {
                width: 148mm !important;
                height: 210mm !important;
                max-height: 210mm !important;
                overflow: hidden !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 auto !important;
                padding: 0 !important;
                page-break-before: avoid !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                break-before: avoid !important;
                break-after: avoid !important;
                break-inside: avoid !important;
              }
              #supplier-printable-bill {
                width: 138mm !important;
                height: 195.4mm !important;
                max-width: 138mm !important;
                max-height: 195.4mm !important;
                margin: 0 auto !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                overflow: hidden !important;
                page-break-before: avoid !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                break-before: avoid !important;
                break-after: avoid !important;
                break-inside: avoid !important;
              }
            </style>
          </head>
          <body>
            <div class="a5-sheet-wrapper">
              ${printAreaRef.current.outerHTML}
            </div>
          </body>
        </html>
      `);
      frameDoc.close();

      const triggerIframePrint = () => {
        setTimeout(() => {
          try {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
          } catch (e) {
            console.error('Iframe print failed, falling back to window.print():', e);
            window.print();
          }
        }, 200);
      };

      const img = frameDoc.querySelector('img');
      if (img && !img.complete) {
        img.onload = triggerIframePrint;
        img.onerror = triggerIframePrint;
      } else {
        triggerIframePrint();
      }
    } catch (err) {
      console.warn('Iframe print initialization warning, fallback to window.print():', err);
      window.print();
    }
  };

  const handleDownloadImage = async () => {
    setShowOptions(false);
    if (!printAreaRef.current) return;

    setIsDownloadingImage(true);
    const safeSupplierName = (bill.supplierId?.name || bill.supplierName || 'Supplier')
      .trim()
      .replace(/[\/\s]+/g, '_')
      .replace(/[^a-zA-Z0-9_\-\u0B80-\u0BFF]/g, '');
    const cleanDate = dateFormatted.replace(/[\/\s]/g, '-');
    const filename = `Deva_Supplier_Bill_${safeSupplierName}_${cleanDate}.png`;

    await downloadBillImage(printAreaRef.current, {
      filename,
      targetWidthPx: 723, // Exact master template width
      targetHeightPx: 1024, // Exact master template height
      shareTitle: `Supplier Bill - ${safeSupplierName}`,
      onStatusChange: (msg) => {
        setStatusMessage(msg);
        if (msg) setTimeout(() => setStatusMessage(''), 4000);
      }
    });

    setIsDownloadingImage(false);
  };

  const modalContent = (
    <div className="supplier-modal-portal fixed inset-0 z-50 overflow-y-auto">
      <div className="supplier-modal-wrap flex min-h-screen items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs no-print" onClick={onClose} />

        <div className="supplier-modal-card relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-4">
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
                  title="Browser Print Preview (A5 - Exactly 1 Sheet)"
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
                      onClick={handlePrint}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <Monitor className="w-4 h-4 text-slate-600" />
                      <div>
                        <div className="font-bold">Browser Print Preview</div>
                        <div className="text-[10px] text-slate-500 font-normal">A5 portrait (strictly 1 single sheet)</div>
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
          <div className="supplier-modal-body p-4 sm:p-6 overflow-x-auto flex justify-center bg-slate-100/60">
            {/* EXACT MASTER REFERENCE SUPPLIER BILL PAD */}
            <SupplierBillPad ref={printAreaRef} bill={bill} settings={settings} />
          </div>
        </div>
      </div>

      {/* Direct Fallback Print CSS - Strictly 1 Single Sheet A5 Portrait (148mm x 210mm) if printed via Ctrl+P */}
      <style>{`
        @media print {
          @page {
            size: A5 portrait !important;
            margin: 0 !important;
          }
          *, *:before, *:after {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            width: 148mm !important;
            height: 210mm !important;
            max-width: 148mm !important;
            max-height: 210mm !important;
            min-height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #ffffff !important;
          }
          /* Completely hide entire main application tree */
          #root {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          .supplier-modal-portal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 148mm !important;
            height: 210mm !important;
            max-height: 210mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .supplier-modal-wrap {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 auto !important;
            width: 148mm !important;
            height: 210mm !important;
            max-height: 210mm !important;
            overflow: hidden !important;
          }
          .supplier-modal-card {
            position: static !important;
            width: 148mm !important;
            height: 210mm !important;
            max-height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            overflow: hidden !important;
          }
          .supplier-modal-body {
            position: static !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            overflow: hidden !important;
            height: 210mm !important;
            max-height: 210mm !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          #supplier-printable-bill {
            position: static !important;
            margin: auto !important;
            width: 138mm !important;
            height: 195.4mm !important;
            max-width: 138mm !important;
            max-height: 195.4mm !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-before: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SupplierPrintModal;
