import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer 
} from 'lucide-react';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('DAILY'); // DAILY, AGING
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dailyReport, setDailyReport] = useState([]);
  const [agingData, setAgingData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeReport === 'DAILY') {
      fetchDailyReport();
    } else if (activeReport === 'AGING') {
      fetchAgingReport();
    }
  }, [activeReport, startDate, endDate]);

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/daily?startDate=${startDate}&endDate=${endDate}`);
      if (res.data.success) {
        setDailyReport(res.data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgingReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/aging');
      if (res.data.success) {
        setAgingData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await api.get('/reports/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `deva_co_backup_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download database backup');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-surface-border shadow-subtle">
        <div>
          <h1 className="text-xl font-bold text-content-main tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Operational summaries, crate inventory balance, and debt aging analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-surface-border text-content-main hover:bg-surface-hover rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-content-secondary" />
            <span>Backup DB</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-surface-border pb-2">
        <button
          onClick={() => setActiveReport('DAILY')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeReport === 'DAILY'
              ? 'bg-forest-600 text-white font-semibold shadow-xs'
              : 'bg-white border border-surface-border text-content-secondary hover:text-content-main'
          }`}
        >
          Daily Business Summary
        </button>
        <button
          onClick={() => setActiveReport('AGING')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeReport === 'AGING'
              ? 'bg-forest-600 text-white font-semibold shadow-xs'
              : 'bg-white border border-surface-border text-content-secondary hover:text-content-main'
          }`}
        >
          Aging Analysis
        </button>
      </div>

      {/* Date Range for Daily Report */}
      {activeReport === 'DAILY' && (
        <div className="bg-white p-3.5 rounded-xl border border-surface-border shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-content-secondary" />
            <span className="font-medium text-content-secondary">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1.5 border border-surface-border rounded-lg text-xs bg-surface-bg font-medium"
            />
            <span className="text-content-secondary">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1.5 border border-surface-border rounded-lg text-xs bg-surface-bg font-medium"
            />
          </div>
          <button
            onClick={fetchDailyReport}
            className="px-3 py-1.5 bg-surface-bg hover:bg-surface-hover text-content-main font-semibold border border-surface-border rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Daily Summary Table */}
      {activeReport === 'DAILY' && (
        <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[760px]">
              <thead>
                <tr className="bg-surface-bg text-content-secondary font-semibold border-b border-surface-border">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Inward Eqv</th>
                  <th className="py-3 px-4 text-center">Sales Eqv</th>
                  <th className="py-3 px-4 text-center">Crate Variance</th>
                  <th className="py-3 px-4 text-right">Procurement Value</th>
                  <th className="py-3 px-4 text-right">Sales Turnover</th>
                  <th className="py-3 px-4 text-right">Cash Collected</th>
                  <th className="py-3 px-4 text-right">Expenses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {dailyReport.length > 0 ? (
                  dailyReport.map((row) => {
                    const boxDiff = Math.round((row.inwardBigEqv - row.salesBigEqv) * 10) / 10;
                    return (
                      <tr key={row.date} className="hover:bg-surface-hover">
                        <td className="py-3 px-4 font-semibold text-content-main">{row.date}</td>
                        <td className="py-3 px-4 text-center font-medium text-content-main">
                          {row.inwardBigEqv} crates
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-content-main">
                          {row.salesBigEqv} crates
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={boxDiff === 0 ? 'text-content-secondary' : boxDiff > 0 ? 'text-forest-600' : 'text-status-danger'}>
                            {boxDiff > 0 ? `+${boxDiff}` : boxDiff}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-content-main">
                          ₹{row.purchaseValue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-forest-600">
                          ₹{row.salesValue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-content-main">
                          ₹{row.collections.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-status-danger">
                          ₹{row.expenses.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-content-secondary">
                      No report data available for the selected dates.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aging Analysis View */}
      {activeReport === 'AGING' && agingData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-surface-border p-4 rounded-xl shadow-subtle">
              <div className="text-xs font-semibold text-forest-600">0 - 7 Days</div>
              <div className="text-xl font-bold text-content-main mt-1">
                ₹{agingData.summary.under7Days.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-white border border-surface-border p-4 rounded-xl shadow-subtle">
              <div className="text-xs font-semibold text-content-secondary">8 - 15 Days</div>
              <div className="text-xl font-bold text-content-main mt-1">
                ₹{agingData.summary.days8to15.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-white border border-surface-border p-4 rounded-xl shadow-subtle">
              <div className="text-xs font-semibold text-status-warning">16 - 30 Days</div>
              <div className="text-xl font-bold text-status-warning mt-1">
                ₹{agingData.summary.days16to30.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-white border border-surface-border p-4 rounded-xl shadow-subtle">
              <div className="text-xs font-semibold text-status-danger">30+ Days Overdue</div>
              <div className="text-xl font-bold text-status-danger mt-1">
                ₹{agingData.summary.over30Days.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
            <div className="px-5 py-3.5 border-b border-surface-border font-bold text-xs text-content-main">
              Overdue Customer Ledger Accounts
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[650px]">
                <thead>
                  <tr className="bg-surface-bg text-content-secondary font-semibold border-b border-surface-border">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4 text-center">Days Idle</th>
                    <th className="py-3 px-4">Aging Category</th>
                    <th className="py-3 px-4 text-right">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {agingData.buyers?.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-hover">
                      <td className="py-3 px-4 font-bold text-content-secondary">{b.code}</td>
                      <td className="py-3 px-4 font-semibold text-content-main font-tamil">{b.name}</td>
                      <td className="py-3 px-4 text-content-secondary">{b.phone || '—'}</td>
                      <td className="py-3 px-4 text-center font-medium text-content-main">{b.daysIdle} days</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            b.bucket === '30+ DAYS'
                              ? 'bg-status-dangerLight text-status-danger'
                              : b.bucket === '16-30 DAYS'
                              ? 'bg-status-warningLight text-status-warning'
                              : 'bg-forest-50 text-forest-700'
                          }`}
                        >
                          {b.bucket}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-content-main">
                        ₹{b.balance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
