import React from 'react';

/**
 * BuyerBillPad - Master Reference Buyer Bill Template
 * Uses the exact master reference image as the bill canvas and dynamically
 * overlays readable transaction data into the exact blank fields using 100% self-contained
 * inline styles. Sized to 138mm x 195.4mm for physical A5 single-sheet printing.
 */
const BuyerBillPad = React.forwardRef(({ bill, settings = {} }, ref) => {
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

  const formatMoney = (val, showZero = true) => {
    const num = Number(val) || 0;
    if (!showZero && num === 0) return '—';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const buyerName = bill.buyerId?.name || bill.buyerName || 'வாடிக்கையாளர்';
  const buyerPhone = bill.buyerId?.phone || bill.buyerPhone || '';
  const billNo = bill.billNumber || bill.transactionNumber || '';
  const dateFormatted = formatDate(bill.transactionDate || bill.date || bill.createdAt);

  // Multi-item handling
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
          quantity: bill.bigEquivalent || bill.bigBoxes || bill.smallBoxes || bill.quantity || 1,
          amount: bill.billAmount || bill.totalAmount || ((bill.bigEquivalent || bill.bigBoxes || 1) * (bill.ratePerBigBox || 0)) || 0
        }
      ];
    }
  }

  // Financial calculations
  const todayTotal = Number(bill.billAmount) || Number(bill.totalAmount) || items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const oldBalance = Number(bill.oldBalance) || Number(bill.previousBalance) || 0;
  const grandTotal = Math.round((todayTotal + oldBalance) * 100) / 100;
  const amountPaid = Number(bill.amountPaid) || 0;
  const balanceDue = bill.newBalance !== undefined && bill.newBalance !== null
    ? Number(bill.newBalance)
    : Math.round((grandTotal - amountPaid) * 100) / 100;

  // Row height: 38px height + 8px gap = 46px per item row
  const rowHeightPx = 38;
  const rowGapPx = 8;

  return (
    <div
      ref={ref}
      id="buyer-printable-bill"
      className="buyer-bill-canvas"
      style={{
        position: 'relative',
        width: '138mm',
        height: '195.4mm', // Exact 723:1024 ratio, fits inside physical A5 148x210 with hardware margins
        maxWidth: '138mm',
        maxHeight: '195.4mm',
        margin: '0 auto',
        padding: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        fontFamily: '"Noto Sans Tamil", "Mukta Malar", sans-serif',
        userSelect: 'none',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact'
      }}
    >
      {/* 1. Master Reference Buyer Bill Template Background */}
      {/* Note: Template permanently displays 'எண் : 54' in original red ink on the top right */}
      <img
        src="/buyer-bill-template.jpg"
        alt="DEVA & CO Buyer Bill Pad"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          pointerEvents: 'none',
          userSelect: 'none',
          display: 'block',
          zIndex: 1
        }}
      />

      {/* 2. CUSTOMER NAME OVERLAY (திரு : _____________) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '17.8%',
          left: '12.5%',
          width: '51.0%',
          height: '3.8%',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '6px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <span
          style={{
            fontFamily: '"Noto Sans Tamil", "Mukta Malar", sans-serif',
            fontSize: '15px',
            fontWeight: 700,
            color: '#0f172a',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.2px'
          }}
        >
          {buyerName} {buyerPhone ? `(${buyerPhone})` : ''} {billNo ? `(பில்: #${billNo})` : ''}
        </span>
      </div>

      {/* 3. DATE OVERLAY (தேதி : _____________) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '17.8%',
          left: '73.5%',
          width: '22.5%',
          height: '3.8%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14.5px',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.3px'
          }}
        >
          {dateFormatted}
        </span>
      </div>

      {/* 4. TABLE BODY ITEMS OVERLAY (Starts safely below header line with ~42px top clearance) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '31.2%', // Safely below table header border (y=277 / 27.05%) so Row 1 never touches the line
          left: '3.32%',
          width: '93.64%',
          height: '42.0%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {items.map((it, idx) => {
          const splitIt = splitAmount(it.amount);
          const rateVal = it.rate || it.ratePerBigBox || 0;
          const qtyVal = it.quantity || it.bigEquivalent || it.bigBoxes || it.smallBoxes || '—';
          const topOffset = idx * (rowHeightPx + rowGapPx);
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: `${topOffset}px`,
                left: 0,
                width: '100%',
                height: `${rowHeightPx}px`,
                display: 'flex',
                alignItems: 'center',
                boxSizing: 'border-box'
              }}
            >
              {/* Col 1: விலை (Rate) - Centered */}
              <div
                style={{
                  width: '14.22%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.2px'
                  }}
                >
                  {rateVal > 0 ? `₹${rateVal}` : '—'}
                </span>
              </div>

              {/* Col 2: விவரம் (Description) - Left aligned with generous padding away from border */}
              <div
                style={{
                  width: '48.88%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingLeft: '14px',
                  paddingRight: '10px',
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
                <span
                  style={{
                    fontFamily: '"Noto Sans Tamil", "Mukta Malar", sans-serif',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '1.3'
                  }}
                >
                  {it.description || 'தக்காளி பெட்டி'}
                </span>
              </div>

              {/* Col 3: எண்ணம் (Quantity / Count) - Centered */}
              <div
                style={{
                  width: '13.18%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '15.5px',
                    fontWeight: 700,
                    color: '#0f172a'
                  }}
                >
                  {qtyVal}
                </span>
              </div>

              {/* Col 4: மொத்தம் (Rupees & Paise) - Right aligned with padding away from divider */}
              <div
                style={{
                  width: '23.70%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  boxSizing: 'border-box'
                }}
              >
                {/* Rupees */}
                <div
                  style={{
                    width: '68%',
                    textAlign: 'right',
                    paddingRight: '12px',
                    boxSizing: 'border-box'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '15.5px',
                      fontWeight: 700,
                      color: '#0f172a',
                      letterSpacing: '-0.3px'
                    }}
                  >
                    {splitIt.rupees}
                  </span>
                </div>
                {/* Paise */}
                <div
                  style={{
                    width: '32%',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#334155'
                    }}
                  >
                    {splitIt.paise}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. BOTTOM CALCULATION SECTION (5 Rows) */}
      {/* Row 1: இன்றைய மொத்தம் : (Current Total) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '74.41%',
          left: '64.59%',
          width: '32.09%',
          height: '4.10%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '16px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '16.5px',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.3px'
          }}
        >
          {formatMoney(todayTotal)}
        </span>
      </div>

      {/* Row 2: முன் பாக்கி : (Previous Balance) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '78.51%',
          left: '64.59%',
          width: '32.09%',
          height: '3.32%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '16px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '15.5px',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.3px'
          }}
        >
          {oldBalance > 0 ? formatMoney(oldBalance) : '—'}
        </span>
      </div>

      {/* Row 3: மொத்தம் : (Grand Total - Highlighted light green) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '81.83%',
          left: '64.59%',
          width: '32.09%',
          height: '3.52%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '16px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '18px',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.3px'
          }}
        >
          {formatMoney(grandTotal)}
        </span>
      </div>

      {/* Row 4: வரவு : (Amount Paid / Received) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '85.35%',
          left: '64.59%',
          width: '32.09%',
          height: '3.52%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '16px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '16px',
            fontWeight: 700,
            color: '#15803d',
            letterSpacing: '-0.3px'
          }}
        >
          {amountPaid > 0 ? formatMoney(amountPaid) : '₹0'}
        </span>
      </div>

      {/* Row 5: மொத்த பாக்கி : (Balance Due - Highlighted light green) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '88.87%',
          left: '64.59%',
          width: '32.09%',
          height: '4.29%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '16px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '18px',
            fontWeight: 800,
            color: '#dc2626',
            letterSpacing: '-0.3px'
          }}
        >
          {formatMoney(balanceDue)}
        </span>
      </div>
    </div>
  );
});

BuyerBillPad.displayName = 'BuyerBillPad';

export default BuyerBillPad;
