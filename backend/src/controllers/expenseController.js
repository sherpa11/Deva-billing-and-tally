const Expense = require('../models/Expense');

exports.getExpenses = async (req, res, next) => {
  try {
    const { date, startDate, endDate } = req.query;
    let filter = { isVoid: false };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .populate('createdBy', 'name')
      .lean();

    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    res.json({
      success: true,
      count: expenses.length,
      totalExpense,
      expenses
    });
  } catch (error) {
    next(error);
  }
};

exports.createExpense = async (req, res, next) => {
  try {
    const { date, purpose, amount, category, notes } = req.body;
    if (!purpose || !amount) {
      return res.status(400).json({ success: false, message: 'செலவு விவரம் மற்றும் தொகையை உள்ளிடவும்' });
    }

    const expense = await Expense.create({
      date: date ? new Date(date) : new Date(),
      purpose: purpose.trim(),
      amount: Number(amount),
      category: category || 'GENERAL',
      notes: notes ? notes.trim() : '',
      createdBy: req.user ? req.user._id : null
    });

    res.status(201).json({
      success: true,
      message: 'செலவு பதிவு செய்யப்பட்டது',
      expense
    });
  } catch (error) {
    next(error);
  }
};

exports.voidExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'செலவு விவரம் கிடைக்கவில்லை' });
    }
    expense.isVoid = true;
    await expense.save();
    res.json({ success: true, message: 'செலவு பதிவு நீக்கப்பட்டது' });
  } catch (error) {
    next(error);
  }
};
