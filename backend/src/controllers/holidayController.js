const Holiday = require("../models/holiday");

const getHolidays = async (req, res) => {
  const start = req.query.start ? new Date(`${req.query.start}T00:00:00.000Z`) : new Date();
  const end = req.query.end ? new Date(`${req.query.end}T23:59:59.999Z`) : new Date(start);

  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    return res.status(400).json({ message: "Invalid holiday date range" });
  }

  if (!req.query.end) end.setUTCFullYear(start.getUTCFullYear(), start.getUTCMonth() + 1, 0);

  const holidays = await Holiday.find({ date: { $gte: start, $lte: end } })
    .sort({ date: 1 })
    .select("name date type");
  res.json(holidays);
};

module.exports = { getHolidays };
