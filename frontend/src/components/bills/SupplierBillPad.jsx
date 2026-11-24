import React, { useState, useEffect } from 'react';

/**
 * SupplierBillPad - Master Reference Supplier Bill Template
 * Uses the exact master reference image as the bill canvas and dynamically
 * overlays readable purchase data into the exact blank fields using 100% self-contained
 * inline styles. Sized to 138mm x 195.4mm for physical A5 single-sheet printing.
 */
const SupplierBillPad = React.forwardRef(({ bill, supplier, settings = {} }, ref) => {
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/supplier-bill-template.jpg';
    if (img.complete) {
      setImageReady(true);
    } else {
      img.onload = () => setImageReady(true);
      img.onerror = () => setImageReady(true);
    }
  }, []);

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

  const resolvedSupplier = (bill.supplierId && typeof bill.supplierId === 'object')
    ? bill.supplierId
    : (supplier && typeof supplier === 'object')
      ? supplier
      : (bill.supplier && typeof bill.supplier === 'object')
        ? bill.supplier
        : null;

  const supplierName = bill.supplierName
    || resolvedSupplier?.name
    || '';
  const supplierPhone = bill.supplierPhone
    || resolvedSupplier?.phone
    || '';
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

  // Row height: 38px height + 8px gap = 46px per item row
  const rowHeightPx = 38;
  const rowGapPx = 8;

  return (
    <div
      ref={ref}
      id="supplier-printable-bill"
      className="supplier-bill-canvas"
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
      {/* 1. Master Reference Supplier Bill Template Background */}
      {/* Note: Template permanently displays 'எண் : 54' in original red ink on the top right */}
      {!imageReady && (
        <div
          className="no-print"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            zIndex: 20
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              border: '3px solid #166534',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}
          />
          <span style={{ marginTop: '8px', fontSize: '11px', fontWeight: 700, color: '#166534', fontFamily: 'sans-serif' }}>
            Loading Bill Pad...
          </span>
        </div>
      )}
      <img
        src="/supplier-bill-template.jpg"
        alt="DEVA & CO Supplier Bill Pad"
        loading="eager"
        fetchpriority="high"
        decoding="sync"
        onLoad={() => setImageReady(true)}
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

      {/* 2. SUPPLIER NAME OVERLAY (திரு : _____________) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '18.7%',
          left: '12.5%',
          width: '51.0%',
          height: '3.6%',
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
          {supplierName} {supplierPhone ? `(${supplierPhone})` : ''}
        </span>
      </div>

      {/* 3. DATE OVERLAY (தேதி : _____________) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '18.7%',
          left: '73.5%',
          width: '22.5%',
          height: '3.6%',
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

      {/* 4. TABLE BODY ITEMS OVERLAY (Starts safely below header line with 25px top padding) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '31.2%', // Safely below the table header border (y=295 / 28.8%) so Row 1 never touches the line
          left: '3.32%',
          width: '93.64%',
          height: '34.5%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {items.map((it, idx) => {
          const splitIt = splitAmount(it.amount);
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
                  width: '14.33%',
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
                  {it.rate > 0 ? `₹${it.rate}` : '—'}
                </span>
              </div>

              {/* Col 2: விவரம் (Description) - Left aligned with generous padding away from border */}
              <div
                style={{
                  width: '48.74%',
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
                  {it.description}
                </span>
              </div>

              {/* Col 3: எண்ணம் (Quantity / Count) - Centered */}
              <div
                style={{
                  width: '13.44%',
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
                  {it.quantity}
                </span>
              </div>

              {/* Col 4: மொத்தம் (Rupees & Paise) - Right aligned with padding away from divider */}
              <div
                style={{
                  width: '23.49%',
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

      {/* 5. GROSS TOTAL (மொத்தத் தொகை) AMOUNT BOX */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '65.82%',
          left: '72.75%',
          width: '24.20%',
          height: '4.69%',
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
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
              fontSize: '16.5px',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.3px'
            }}
          >
            {splitGross.rupees}
          </span>
        </div>
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
            {splitGross.paise}
          </span>
        </div>
      </div>

      {/* 6. DEDUCTIONS ROW 1 (கமிஷன் & கேட்) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '70.61%',
          left: '21.0%',
          width: '25.0%',
          height: '3.61%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '14px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '15px',
            fontWeight: 700,
            color: '#0f172a'
          }}
        >
          {comm > 0 ? comm.toLocaleString('en-IN') : '—'}
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '70.61%',
          left: '65.5%',
          width: '30.5%',
          height: '3.61%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '18px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '15px',
            fontWeight: 700,
            color: '#0f172a'
          }}
        >
          {gate > 0 ? gate.toLocaleString('en-IN') : '—'}
        </span>
      </div>

      {/* 7. DEDUCTIONS ROW 2 (கூலி & வாடகை) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '74.32%',
          left: '16.5%',
          width: '29.5%',
          height: '3.81%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '14px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '15px',
            fontWeight: 700,
            color: '#0f172a'
          }}
        >
          {coolie > 0 ? coolie.toLocaleString('en-IN') : '—'}
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '74.32%',
          left: '65.5%',
          width: '30.5%',
          height: '3.81%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '18px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '15px',
            fontWeight: 700,
            color: '#0f172a'
          }}
        >
          {rent > 0 ? rent.toLocaleString('en-IN') : '—'}
        </span>
      </div>

      {/* 8. PREVIOUS BALANCE (பற்று - முன் பாக்கி) AMOUNT BOX */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '78.22%',
          left: '72.75%',
          width: '24.20%',
          height: '3.91%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '18px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '16.5px',
            fontWeight: 700,
            color: '#0f172a'
          }}
        >
          {prevBal ? prevBal.toLocaleString('en-IN') : '—'}
        </span>
      </div>

      {/* 9. GRAND TOTAL (மொத்தம்) AMOUNT BOX */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '82.23%',
          left: '72.75%',
          width: '24.20%',
          height: '4.79%',
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
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
              fontSize: '18px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.3px'
            }}
          >
            {splitTotal.rupees}
          </span>
        </div>
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
              fontSize: '14px',
              fontWeight: 800,
              color: '#0f172a'
            }}
          >
            {splitTotal.paise}
          </span>
        </div>
      </div>

      {/* 10. PAYMENT ROW (கொடுத்தது & மீதி பாக்கி) */}
      {/* கொடுத்தது (Amount Paid) in white box */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '87.11%',
          left: '26.28%',
          width: '22.54%',
          height: '5.47%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '12px',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '16px',
            fontWeight: 700,
            color: '#15803d'
          }}
        >
          {amountPaid > 0 ? `₹${amountPaid.toLocaleString('en-IN')}` : '₹0'}
        </span>
      </div>

      {/* மீதி பாக்கி (Remaining Balance) in white box */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: '87.11%',
          left: '72.06%',
          width: '24.90%',
          height: '5.47%',
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
            fontSize: '17px',
            fontWeight: 800,
            color: '#dc2626'
          }}
        >
          ₹{remainingBalance.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
});

SupplierBillPad.displayName = 'SupplierBillPad';

export default SupplierBillPad;
