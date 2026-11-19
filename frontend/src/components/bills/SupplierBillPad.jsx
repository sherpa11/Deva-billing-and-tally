import React from 'react';

/**
 * SupplierBillPad - Master Reference Supplier Bill Template
 * Uses the exact master reference image as the bill canvas and dynamically
 * overlays larger, bold, readable purchase data into the exact blank fields.
 */
const SupplierBillPad = React.forwardRef(({ bill, settings = {} }, ref) => {
  if (!bill) return null;

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

  // Multi-item handling: check bill.items or split bigBoxes and smallBoxes
  let items = Array.isArray(bill.items) && bill.items.length > 0 ? bill.items : [];
  if (items.length === 0) {
    if (bill.bigBoxes > 0 && bill.smallBoxes > 0) {
      items = [
        {
          rate: bill.ratePerBigBox || 0,
          description: 'தக்காளி பெரிய பெட்டி',
          quantity: bill.bigBoxes,
          amount: (bill.bigBoxes * (bill.ratePerBigBox || 0))
        },
        {
          rate: Math.round((bill.ratePerBigBox || 0) * 0.5),
          description: 'தக்காளி சிறிய பெட்டி',
          quantity: bill.smallBoxes,
          amount: (bill.smallBoxes * Math.round((bill.ratePerBigBox || 0) * 0.5))
        }
      ];
    } else {
      items = [
        {
          rate: bill.ratePerBigBox || 0,
          description: bill.smallBoxes > 0 ? 'தக்காளி சிறிய பெட்டி' : 'தக்காளி பெரிய பெட்டி',
          quantity: bill.quantity || bill.bigEquivalent || bill.bigBoxes || bill.smallBoxes || 0,
          amount: bill.grossTotal || bill.totalAmount || ((bill.bigEquivalent || bill.bigBoxes || 0) * (bill.ratePerBigBox || 0)) || 0
        }
      ];
    }
  }

  const grossTotal = Number(bill.grossTotal) || Number(bill.totalAmount) || items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const deductions = bill.deductions || {};
  const comm = Number(deductions.commission) || 0;
  const gate = Number(deductions.gate) || 0;
  const coolie = Number(deductions.coolie) || 0;
  const rent = Number(deductions.rent) || 0;

  const prevBal = bill.previousBalance !== undefined && bill.previousBalance !== null
    ? Number(bill.previousBalance)
    : (bill.oldBalance !== undefined ? Number(bill.oldBalance) : (Number(deductions.debit) || 0));

  const totalPayable = bill.totalPayable !== undefined && bill.totalPayable !== null
    ? Number(bill.totalPayable)
    : (bill.netPayable !== undefined ? Number(bill.netPayable) : Math.max(0, grossTotal - (comm + gate + coolie + rent) + prevBal));

  const amountPaid = Number(bill.amountPaid) || 0;

  const remainingBalance = bill.remainingBalance !== undefined && bill.remainingBalance !== null
    ? Number(bill.remainingBalance)
    : (bill.newBalance !== undefined ? Number(bill.newBalance) : Math.round((totalPayable - amountPaid) * 100) / 100);

  const splitGross = splitAmount(grossTotal);
  const splitTotal = splitAmount(totalPayable);

  // Each item row height in percentage of total bill height (generous vertical spacing, fits up to 7 items)
  const itemRowHeightPct = 4.80;

  return (
    <div
      ref={ref}
      id="supplier-printable-bill"
      className="relative select-none text-slate-900 overflow-hidden mx-auto shadow-2xl bg-white"
      style={{
        width: '142mm',
        height: '201.2mm', // Exactly 142 * (1024 / 723) = 201.12mm (fits perfectly inside A5 148x210)
        maxHeight: '201.2mm',
        boxSizing: 'border-box',
        aspectRatio: '723 / 1024',
        fontFamily: '"Noto Sans Tamil", "Mukta Malar", sans-serif'
      }}
    >
      {/* 1. Master Reference Supplier Bill Template Background */}
      {/* Note: Template has 'எண் : 54' permanently printed in original red ink on the top right */}
      <img
        src="/supplier-bill-template.jpg"
        alt="DEVA & CO Supplier Bill Pad"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none block"
        style={{ width: '100%', height: '100%' }}
      />

      {/* 2. SUPPLIER NAME OVERLAY (திரு : _____________) - Larger & Bold */}
      <div
        className="absolute flex items-center z-10 pl-1.5"
        style={{
          top: '17.6%',
          left: '12.5%',
          width: '51.5%',
          height: '4.0%'
        }}
      >
        <span className="font-black text-slate-950 text-[14.5px] sm:text-[16px] font-tamil truncate tracking-tight">
          {supplierName} {supplierPhone ? `(${supplierPhone})` : ''}
        </span>
      </div>

      {/* 3. DATE OVERLAY (தேதி : _____________) - Larger & Bold */}
      <div
        className="absolute flex items-center justify-center z-10"
        style={{
          top: '17.6%',
          left: '73.5%',
          width: '22.5%',
          height: '4.0%'
        }}
      >
        <span className="font-black font-mono text-slate-950 text-[14px] sm:text-[15.5px] tracking-tight">
          {dateFormatted}
        </span>
      </div>

      {/* 4. TABLE BODY ITEMS OVERLAY (top: 29.2% to 65.72%) - Enhanced Readability */}
      <div
        className="absolute z-10"
        style={{
          top: '29.3%',
          left: '3.32%',
          width: '93.64%',
          height: '36.4%'
        }}
      >
        {items.map((it, idx) => {
          const splitIt = splitAmount(it.amount);
          return (
            <div
              key={idx}
              className="absolute w-full flex items-center"
              style={{
                top: `${idx * itemRowHeightPct}%`,
                height: `${itemRowHeightPct}%`
              }}
            >
              {/* Col 1: விலை (Rate) - Larger font */}
              <div
                className="flex items-center justify-center h-full"
                style={{ width: '14.33%' }}
              >
                <span className="font-black font-mono text-[14.5px] sm:text-[16px] text-slate-950">
                  {it.rate > 0 ? `₹${it.rate}` : '—'}
                </span>
              </div>

              {/* Col 2: விவரம் (Description) - Larger bold Tamil with generous horizontal padding */}
              <div
                className="flex items-center justify-start h-full pl-3 pr-2"
                style={{ width: '48.74%' }}
              >
                <span className="font-extrabold font-tamil text-[14.5px] sm:text-[15.5px] text-slate-950 truncate leading-snug">
                  {it.description}
                </span>
              </div>

              {/* Col 3: எண்ணம் (Quantity / Count) - Larger bold font */}
              <div
                className="flex items-center justify-center h-full"
                style={{ width: '13.44%' }}
              >
                <span className="font-black font-mono text-[15px] sm:text-[17px] text-slate-950">
                  {it.quantity}
                </span>
              </div>

              {/* Col 4: மொத்தம் (Rupees & Paise) - Larger bold font, no border touching */}
              <div
                className="flex items-center h-full"
                style={{ width: '23.49%' }}
              >
                {/* Rupees */}
                <div className="w-[68%] text-right pr-2.5">
                  <span className="font-black font-mono text-[15px] sm:text-[17px] text-slate-950">
                    {splitIt.rupees}
                  </span>
                </div>
                {/* Paise */}
                <div className="w-[32%] text-center">
                  <span className="font-black font-mono text-[12.5px] sm:text-[14px] text-slate-800">
                    {splitIt.paise}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. GROSS TOTAL (மொத்தத் தொகை) AMOUNT BOX - Enhanced Readability */}
      <div
        className="absolute flex items-center z-10"
        style={{
          top: '65.82%',
          left: '72.75%',
          width: '24.20%',
          height: '4.69%'
        }}
      >
        <div className="w-[68%] text-right pr-2.5">
          <span className="font-black font-mono text-[16px] sm:text-[18px] text-slate-950">
            {splitGross.rupees}
          </span>
        </div>
        <div className="w-[32%] text-center">
          <span className="font-black font-mono text-[13px] sm:text-[14.5px] text-slate-800">
            {splitGross.paise}
          </span>
        </div>
      </div>

      {/* 6. DEDUCTIONS ROW 1 (கமிஷன் & கேட்) - Larger Bold Values */}
      <div
        className="absolute flex items-center z-10"
        style={{
          top: '70.61%',
          left: '21.0%',
          width: '25.0%',
          height: '3.61%'
        }}
      >
        <div className="w-full text-right pr-3">
          <span className="font-black font-mono text-[14.5px] sm:text-[16.5px] text-slate-950">
            {comm > 0 ? comm.toLocaleString('en-IN') : '—'}
          </span>
        </div>
      </div>

      <div
        className="absolute flex items-center z-10"
        style={{
          top: '70.61%',
          left: '65.5%',
          width: '30.5%',
          height: '3.61%'
        }}
      >
        <div className="w-full text-right pr-4">
          <span className="font-black font-mono text-[14.5px] sm:text-[16.5px] text-slate-950">
            {gate > 0 ? gate.toLocaleString('en-IN') : '—'}
          </span>
        </div>
      </div>

      {/* 7. DEDUCTIONS ROW 2 (கூலி & வாடகை) - Larger Bold Values */}
      <div
        className="absolute flex items-center z-10"
        style={{
          top: '74.32%',
          left: '16.5%',
          width: '29.5%',
          height: '3.81%'
        }}
      >
        <div className="w-full text-right pr-3">
          <span className="font-black font-mono text-[14.5px] sm:text-[16.5px] text-slate-950">
            {coolie > 0 ? coolie.toLocaleString('en-IN') : '—'}
          </span>
        </div>
      </div>

      <div
        className="absolute flex items-center z-10"
        style={{
          top: '74.32%',
          left: '65.5%',
          width: '30.5%',
          height: '3.81%'
        }}
      >
        <div className="w-full text-right pr-4">
          <span className="font-black font-mono text-[14.5px] sm:text-[16.5px] text-slate-950">
            {rent > 0 ? rent.toLocaleString('en-IN') : '—'}
          </span>
        </div>
      </div>

      {/* 8. PREVIOUS BALANCE (பற்று - முன் பாக்கி) AMOUNT BOX - Prominent */}
      <div
        className="absolute flex items-center justify-end z-10 pr-4"
        style={{
          top: '78.22%',
          left: '72.75%',
          width: '24.20%',
          height: '3.91%'
        }}
      >
        <span className="font-black font-mono text-[16px] sm:text-[18px] text-slate-950">
          {prevBal ? prevBal.toLocaleString('en-IN') : '—'}
        </span>
      </div>

      {/* 9. GRAND TOTAL (மொத்தம்) AMOUNT BOX - Prominent & Bold */}
      <div
        className="absolute flex items-center z-10"
        style={{
          top: '82.23%',
          left: '72.75%',
          width: '24.20%',
          height: '4.79%'
        }}
      >
        <div className="w-[68%] text-right pr-2.5">
          <span className="font-black font-mono text-[18px] sm:text-[21px] text-slate-950">
            {splitTotal.rupees}
          </span>
        </div>
        <div className="w-[32%] text-center">
          <span className="font-black font-mono text-[14px] sm:text-[15.5px] text-slate-900">
            {splitTotal.paise}
          </span>
        </div>
      </div>

      {/* 10. PAYMENT ROW (கொடுத்தது & மீதி பாக்கி) - High-Visibility 50/50 */}
      {/* கொடுத்தது (Amount Paid) */}
      <div
        className="absolute flex items-center justify-end z-10 pr-3"
        style={{
          top: '87.11%',
          left: '26.28%',
          width: '22.54%',
          height: '5.47%'
        }}
      >
        <span className="font-black font-mono text-[16px] sm:text-[18.5px] text-forest-800">
          {amountPaid > 0 ? `₹${amountPaid.toLocaleString('en-IN')}` : '₹0'}
        </span>
      </div>

      {/* மீதி பாக்கி (Remaining Balance) in bold red */}
      <div
        className="absolute flex items-center justify-end z-10 pr-4"
        style={{
          top: '87.11%',
          left: '72.06%',
          width: '24.90%',
          height: '5.47%'
        }}
      >
        <span className="font-black font-mono text-[17.5px] sm:text-[20px] text-red-600">
          ₹{remainingBalance.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
});

SupplierBillPad.displayName = 'SupplierBillPad';

export default SupplierBillPad;
