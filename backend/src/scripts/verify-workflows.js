const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('=== STARTING DEVA & CO WORKFLOW VERIFICATION ===\n');

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('✔ Health Check:', health);

    // 2. Login as Admin
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin@123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error(loginData.message);
    const token = loginData.token;
    console.log('✔ Admin Login Successful. Token obtained for:', loginData.user.name);
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 3. Settings Check
    const settingsRes = await fetch(`${BASE_URL}/settings`, { headers: authHeaders });
    const settingsData = await settingsRes.json();
    console.log('✔ Mandi Settings:', settingsData.settings.storeName, settingsData.settings.phones);
    if (settingsData.settings.storeName !== 'தேவா & கோ') {
      throw new Error('Store name does not match தேவா & கோ');
    }

    // 4. Create a New Buyer
    const buyerRes = await fetch(`${BASE_URL}/buyers`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'செல்வம் வெஜிடபிள்ஸ்',
        phone: '98433 11223',
        address: 'திண்டுக்கல் மார்க்கெட்',
        initialBalance: 1000
      })
    });
    const buyerData = await buyerRes.json();
    const buyerId = buyerData.buyer._id;
    console.log(`✔ Created Buyer: ${buyerData.buyer.name} (Code: ${buyerData.buyer.buyerCode}) with Initial Balance: ₹${buyerData.buyer.currentBalance}`);

    // 5. Create a Buyer Bill (Sale)
    // 10 big boxes + 4 small boxes = 10 + 2 = 12 Big Eqv
    // Rate = ₹400 / big box
    // Bill amount = 12 * 400 = ₹4800
    // Old balance = ₹1000
    // Total due = ₹5800
    // Amount paid = ₹3000
    // Expected new balance = ₹2800
    const saleRes = await fetch(`${BASE_URL}/transactions/sale`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        buyerId,
        transactionDate: new Date().toISOString(),
        bigBoxes: 10,
        smallBoxes: 4,
        ratePerBigBox: 400,
        amountPaid: 3000,
        notes: 'முதல் பில் சோதனை'
      })
    });
    const saleData = await saleRes.json();
    const saleBill = saleData.bill;
    console.log(`✔ Generated Buyer Bill #${saleBill.billNumber}:`);
    console.log(`   - Big Eqv: ${saleBill.bigEquivalent} (Expected: 12)`);
    console.log(`   - Bill Amount: ₹${saleBill.billAmount} (Expected: 4800)`);
    console.log(`   - Total Due: ₹${saleBill.totalDue} (Expected: 5800)`);
    console.log(`   - Amount Paid: ₹${saleBill.amountPaid} (Expected: 3000)`);
    console.log(`   - New Balance: ₹${saleBill.newBalance} (Expected: 2800)`);

    if (saleBill.bigEquivalent !== 12 || saleBill.billAmount !== 4800 || saleBill.newBalance !== 2800) {
      throw new Error('Buyer sale calculation mismatch!');
    }

    // 6. Record Partial Payment (No sales bill)
    // Pay ₹1500
    // Old balance = ₹2800
    // Expected new balance = ₹1300
    const payRes = await fetch(`${BASE_URL}/transactions/payment`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        buyerId,
        amountPaid: 1500,
        paymentMode: 'GPAY',
        notes: 'GPay பரிவர்த்தனை வரவு'
      })
    });
    const payData = await payRes.json();
    const payment = payData.payment;
    console.log(`✔ Recorded Customer Payment:`);
    console.log(`   - Old Balance: ₹${payment.oldBalance} (Expected: 2800)`);
    console.log(`   - Paid: ₹${payment.amountPaid} (Expected: 1500)`);
    console.log(`   - New Balance: ₹${payment.newBalance} (Expected: 1300)`);

    if (payment.newBalance !== 1300) {
      throw new Error('Payment tally balance mismatch!');
    }

    // 7. Verify Buyer Ledger
    const ledgerRes = await fetch(`${BASE_URL}/buyers/${buyerId}/ledger`, { headers: authHeaders });
    const ledgerData = await ledgerRes.json();
    console.log(`✔ Buyer Ledger Transactions Count: ${ledgerData.transactions.length}`);

    // 8. Create a New Supplier
    const supRes = await fetch(`${BASE_URL}/suppliers`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'பழனிச்சாமி (கன்னிவாடி தோட்டம்)',
        phone: '97881 22334',
        address: 'கன்னிவாடி, திண்டுக்கல்',
        initialBalance: 0
      })
    });
    const supData = await supRes.json();
    const supplierId = supData.supplier._id;
    console.log(`✔ Created Supplier: ${supData.supplier.name} (Code: ${supData.supplier.supplierCode})`);

    // 9. Generate Supplier Bill (Matching the Physical Bill Pad format)
    // Items:
    // Lot 1: விலை 420, விவரம் "தக்காளி முதல் ரகம்", 15 பெரிய + 6 சிறிய = 18 சமன். மொத்தம் = 18 * 420 = ₹7560
    // Lot 2: விலை 380, விவரம் "இரண்டாம் ரகம்", 5 பெட்டி = ₹1900
    // Gross Total = 7560 + 1900 = ₹9460
    // Deductions:
    // Commission (10%) = ₹946
    // Gate pass = ₹50
    // Coolie = ₹180
    // Total Deductions = 946 + 50 + 180 = ₹1176
    // Net Payable = 9460 - 1176 = ₹8284
    const supBillRes = await fetch(`${BASE_URL}/supplier-bills`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        supplierId,
        transactionDate: new Date().toISOString(),
        items: [
          {
            rate: 420,
            description: 'தக்காளி முதல் ரகம்',
            bigBoxes: 15,
            smallBoxes: 6,
            quantity: 18,
            amount: 7560
          },
          {
            rate: 380,
            description: 'இரண்டாம் ரகம்',
            bigBoxes: 5,
            smallBoxes: 0,
            quantity: 5,
            amount: 1900
          }
        ],
        deductions: {
          commission: 946,
          gate: 50,
          coolie: 180,
          rent: 0,
          debit: 0
        },
        notes: 'கன்னிவாடி லோடு காலை வரத்து'
      })
    });
    const supBillData = await supBillRes.json();
    const supBill = supBillData.bill;
    console.log(`✔ Generated Supplier Bill Pad #${supBill.billNumber}:`);
    console.log(`   - Items Count: ${supBill.items.length}`);
    console.log(`   - Gross Total: ₹${supBill.grossTotal} (Expected: 9460)`);
    console.log(`   - Total Deductions: ₹${supBill.totalDeductions} (Expected: 1176)`);
    console.log(`   - Net Payable: ₹${supBill.netPayable} (Expected: 8284)`);
    console.log(`   - Supplier New Balance: ₹${supBill.newBalance} (Expected: 8284)`);

    if (supBill.grossTotal !== 9460 || supBill.netPayable !== 8284) {
      throw new Error('Supplier bill pad calculation mismatch!');
    }

    // 10. Dashboard Stats Check
    const today = new Date().toISOString().split('T')[0];
    const dashRes = await fetch(`${BASE_URL}/dashboard/stats?date=${today}`, { headers: authHeaders });
    const dashData = await dashRes.json();
    console.log(`✔ Dashboard Stats for ${today}:`);
    console.log(`   - Daily Sales Turnover: ₹${dashData.stats.sales.totalSales}`);
    console.log(`   - Cash Collections: ₹${dashData.stats.collections}`);
    console.log(`   - Total Customer Outstanding: ₹${dashData.stats.outstanding.totalBuyerOutstanding}`);
    console.log(`   - Total Supplier Payable: ₹${dashData.stats.outstanding.totalSupplierPayable}`);

    // 11. Record Daily Expense
    const expRes = await fetch(`${BASE_URL}/outlay`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        purpose: 'லோடு தொழிலாளர்கள் தேநீர் & சிற்றுண்டி',
        amount: 250,
        category: 'TEA_SNACKS'
      })
    });
    const expData = await expRes.json();
    console.log(`✔ Recorded Expense: ₹${expData.expense.amount} for ${expData.expense.purpose}`);

    // 12. Test Void Reversal Safeguard
    // Let's void the payment of ₹1500 and verify buyer balance reverts from 1300 back to 2800!
    const voidRes = await fetch(`${BASE_URL}/transactions/${payment._id}/void`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ reason: 'சோதனை ரத்து (Test Reversal)' })
    });
    const voidData = await voidRes.json();
    console.log(`✔ Voided Transaction: ${voidData.message}`);

    const verifyBuyerRes = await fetch(`${BASE_URL}/buyers/${buyerId}`, { headers: authHeaders });
    const verifyBuyer = await verifyBuyerRes.json();
    console.log(`✔ Reconciled Buyer Balance after void: ₹${verifyBuyer.buyer.currentBalance} (Expected: 2800)`);
    if (verifyBuyer.buyer.currentBalance !== 2800) {
      throw new Error('Reversal did not reconcile buyer balance correctly!');
    }

    console.log('\n=== ALL WORKFLOW TESTS PASSED PERFECTLY (100% RECONCILED) ===\n');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
};

runTests();
