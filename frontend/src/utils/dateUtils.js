/**
 * Date and Time utilities with explicit Asia/Kolkata timezone support
 */

/**
 * Formats a record or timestamp into 12-hour Indian Standard Time (Asia/Kolkata).
 * Example: "06:45 PM"
 *
 * Prioritizes `createdAt` (the true database insertion moment) over `transactionDate`
 * to ensure that date-only entries (e.g. 2026-11-25T00:00:00Z) never display 05:30 AM.
 */
export const formatTime = (recordOrTimestamp) => {
  if (!recordOrTimestamp) return '';
  let rawDate;

  if (typeof recordOrTimestamp === 'object' && recordOrTimestamp !== null) {
    // If createdAt is available, prefer it because it captures the actual submission instant
    rawDate = recordOrTimestamp.createdAt || recordOrTimestamp.paymentDate || recordOrTimestamp.transactionDate || recordOrTimestamp.date;
  } else {
    rawDate = recordOrTimestamp;
  }

  if (!rawDate) return '';

  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formats a date string or object to DD-MM-YYYY
 * Example: "25-11-2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  if (typeof dateStr === 'string') {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
};

/**
 * Formats a timestamp into "DD-MM-YYYY, hh:mm A"
 */
export const formatDateTime = (recordOrTimestamp) => {
  if (!recordOrTimestamp) return '';
  const dStr = formatDate(recordOrTimestamp);
  const tStr = formatTime(recordOrTimestamp);
  if (!dStr) return '';
  return tStr ? `${dStr}, ${tStr}` : dStr;
};
