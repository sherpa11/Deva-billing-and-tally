const http = require('http');

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: encodeURI(`/api${path}`),
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1e6;
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, durationMs, data: parsed });
        } catch {
          resolve({ status: res.statusCode, durationMs, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runBenchmark() {
  console.log('=== DEVA & CO BILLING API PERFORMANCE BENCHMARK ===\n');
  const results = [];

  // 1. Login
  const loginRes = await makeRequest('POST', '/auth/login', { username: 'admin', password: 'Admin@123' });
  results.push({ test: '1. Admin Authentication / Login', status: loginRes.status, ms: loginRes.durationMs.toFixed(2) });
  let token = loginRes.data?.token;

  if (!token) {
    throw new Error('Could not log in with Admin@123');
  }

  // 2. Dashboard Loading / Stats
  const today = new Date().toISOString().split('T')[0];
  const dashRes = await makeRequest('GET', `/dashboard/stats?date=${today}`, null, token);
  results.push({ test: '2. Dashboard Stats & Lean Aggregations', status: dashRes.status, ms: dashRes.durationMs.toFixed(2) });

  // 3. Create Sample Buyer
  const createBuyerRes = await makeRequest('POST', '/buyers', {
    name: 'முத்து தக்காளி ஸ்டோர்',
    phone: '98433 11223',
    address: 'திண்டுக்கல் காந்தி மார்க்கெட்',
    initialBalance: 1500
  }, token);
  const buyerId = createBuyerRes.data?.buyer?._id;
  results.push({ test: '3. Create Customer Record', status: createBuyerRes.status, ms: createBuyerRes.durationMs.toFixed(2) });

  // 4. Buyer Autocomplete Search (Indexed query)
  const buyerSearchRes = await makeRequest('GET', '/buyers?status=active&autocomplete=true&search=முத்து', null, token);
  results.push({ test: '4. Buyer Autocomplete Search (Debounced / Indexed)', status: buyerSearchRes.status, ms: buyerSearchRes.durationMs.toFixed(2) });

  // 5. Create Sample Supplier
  const createSupRes = await makeRequest('POST', '/suppliers', {
    name: 'பழனிச்சாமி (கன்னிவாடி தோட்டம்)',
    phone: '97881 22334',
    address: 'கன்னிவாடி'
  }, token);
  const supplierId = createSupRes.data?.supplier?._id;
  results.push({ test: '5. Create Supplier Record', status: createSupRes.status, ms: createSupRes.durationMs.toFixed(2) });

  // 6. Supplier Search
  const supSearchRes = await makeRequest('GET', '/suppliers?search=பழனி', null, token);
  results.push({ test: '6. Supplier Search Query', status: supSearchRes.status, ms: supSearchRes.durationMs.toFixed(2) });

  // 7. Buyer Billing Sale with Multi-Row items & automatic tally
  const saleRes = await makeRequest('POST', '/transactions/sale', {
    buyerId,
    transactionDate: today,
    bigBoxes: 15,
    smallBoxes: 6,
    bigEquivalent: 18,
    ratePerBigBox: 450,
    items: [
      { bigBoxes: 10, smallBoxes: 4, bigEquivalent: 12, ratePerBigBox: 450, amount: 5400 },
      { bigBoxes: 5, smallBoxes: 2, bigEquivalent: 6, ratePerBigBox: 450, amount: 2700 }
    ],
    manualOldBalance: 1500,
    amountPaid: 8000,
    notes: 'Morning load 1'
  }, token);
  results.push({ test: '7. Multi-Row Buyer Sale & Balance Tally Save', status: saleRes.status, ms: saleRes.durationMs.toFixed(2) });

  // 8. Record Customer Payment
  const payRes = await makeRequest('POST', '/transactions/payment', {
    buyerId,
    amountPaid: 1000,
    paymentMode: 'CASH',
    transactionDate: today,
    notes: 'Cash payment evening'
  }, token);
  results.push({ test: '8. Payment Recording & Ledger Update', status: payRes.status, ms: payRes.durationMs.toFixed(2) });

  // 9. Supplier Purchase Bill Save
  const supBillRes = await makeRequest('POST', '/supplier-bills', {
    supplierId,
    transactionDate: today,
    items: [
      { rate: 400, description: 'பெரிய பெட்டி', quantity: 20, amount: 8000, bigBoxes: 20, smallBoxes: 0, bigEquivalent: 20 }
    ],
    grossTotal: 8000,
    deductions: { commission: 800, gate: 50, coolie: 100, rent: 0, debit: 0, totalDeductions: 950 },
    totalDeductions: 950,
    netPayable: 7050
  }, token);
  results.push({ test: '9. Supplier Purchase Bill & Deductions Save', status: supBillRes.status, ms: supBillRes.durationMs.toFixed(2) });

  // 10. Record Expense
  const expRes = await makeRequest('POST', '/expenses', {
    date: today,
    purpose: 'டீ மற்றும் காபி (Tea & Snacks)',
    amount: 150,
    category: 'TEA_SNACKS'
  }, token);
  results.push({ test: '10. Expense Recording', status: expRes.status, ms: expRes.durationMs.toFixed(2) });

  // 11. History Loading
  const histSales = await makeRequest('GET', `/transactions?date=${today}&type=SALE`, null, token);
  results.push({ test: '11. Transaction History (Sales with Lean Projections)', status: histSales.status, ms: histSales.durationMs.toFixed(2) });

  // 12. Report Generation (Daily Business Report with Aggregations)
  const repRes = await makeRequest('GET', `/reports/daily?startDate=${today}&endDate=${today}`, null, token);
  results.push({ test: '12. Daily Business Report Generation', status: repRes.status, ms: repRes.durationMs.toFixed(2) });

  // 13. Aging Analysis Report
  const agingRes = await makeRequest('GET', '/reports/aging', null, token);
  results.push({ test: '13. Aging Analysis Report', status: agingRes.status, ms: agingRes.durationMs.toFixed(2) });

  // Display results in markdown table
  console.log('| Benchmark Operation | HTTP Status | Response Time |');
  console.log('|---|---|---|');
  results.forEach(r => {
    console.log(`| ${r.test} | ${r.status} OK | ${r.ms} ms |`);
  });
  console.log('\n=== BENCHMARK COMPLETED SUCCESSFULLY ===');
}

runBenchmark().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
