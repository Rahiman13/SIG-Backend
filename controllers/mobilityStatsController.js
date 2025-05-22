const Project = require('../models/Project');
const ProjectApplication = require('../models/ProjectApplication');

exports.getMobilityStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const openProjects = await Project.countDocuments({ status: 'open' });
    const closedProjects = await Project.countDocuments({ status: 'closed' });

    const totalApplications = await ProjectApplication.countDocuments();
    const pending = await ProjectApplication.countDocuments({ status: 'pending' });
    const approved = await ProjectApplication.countDocuments({ status: 'approved' });
    const rejected = await ProjectApplication.countDocuments({ status: 'rejected' });
    const dropped = await ProjectApplication.countDocuments({ status: 'dropped' });

    res.json({
      totalProjects,
      openProjects,
      closedProjects,
      totalApplications,
      pending,
      approved,
      rejected,
      dropped
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Date-wise application counts (grouped by appliedAt date)
// GET /api/mobility/datewise?startDate=2024-01-01&endDate=2024-12-31

exports.getApplicationsByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required in YYYY-MM-DD format' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999); // Include end of day

    const data = await ProjectApplication.aggregate([
      {
        $match: {
          appliedAt: {
            $gte: start,
            $lte: end
          }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          counts: {
            $push: {
              k: '$_id.status',
              v: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          total: 1,
          counts: {
            $arrayToObject: '$counts'
          }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json(data);
  } catch (err) {
    console.error('Error in getApplicationsByDate:', err);
    res.status(500).json({ error: err.message });
  }
};


