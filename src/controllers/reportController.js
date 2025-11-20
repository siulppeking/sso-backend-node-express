const Report = require('../models/Report');

// GET /api/reports?page=1&limit=10&q=search&tag=name
async function listReports(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
    const q = req.query.q;
    const tag = req.query.tag;

    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ];
    }
    if (tag) filter.tags = tag;

    const total = await Report.countDocuments(filter);
    const items = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('owner', 'username email');

    res.json({ page, limit, total, items });
  } catch (err) {
    next(err);
  }
}

async function getReport(req, res, next) {
  try {
    const { id } = req.params;
    const report = await Report.findById(id).populate('owner', 'username email');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    next(err);
  }
}

async function createReport(req, res, next) {
  try {
    const { title, content, tags } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });
    const ownerId = req.user.sub;
    const doc = new Report({ title, content, tags: tags || [], owner: ownerId });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

async function deleteReport(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await Report.findById(id);
    if (!doc) return res.status(404).json({ message: 'Report not found' });
    await doc.remove();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listReports, getReport, createReport, deleteReport };
