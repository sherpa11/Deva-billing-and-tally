const parseTransactionDate = (dateInput) => {
  if (!dateInput) return new Date();

  // If input is YYYY-MM-DD string, combine with current time
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    const [year, month, day] = dateInput.trim().split('-').map(Number);
    const date = new Date();
    date.setFullYear(year, month - 1, day);
    return date;
  }

  const parsed = new Date(dateInput);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

module.exports = {
  parseTransactionDate
};
