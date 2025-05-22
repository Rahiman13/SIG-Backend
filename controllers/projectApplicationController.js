const ProjectApplication = require('../models/ProjectApplication');
const Employee = require('../models/Employee');

// Apply for project (employee)
exports.applyForProject = async (req, res) => {
  try {
    const { projectId, resumeOrPortfolio } = req.body;

    const employee = await Employee.findById(req.user._id);
    if (!employee.isOnBench) return res.status(400).json({ error: 'You are not on bench' });

    const existing = await ProjectApplication.findOne({ employee: req.user._id, status: 'pending' });
    if (existing) return res.status(400).json({ error: 'Already applied to a project' });

    const newApp = await ProjectApplication.create({
      project: projectId,
      employee: req.user._id,
      resumeOrPortfolio // Link only
    });

    res.status(201).json(newApp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all applications (admin view)
exports.getAllApplications = async (req, res) => {
  try {
    const apps = await ProjectApplication.find()
      .populate('project', 'title')
      .populate('employee', 'name email employeeId');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve application
exports.approveApplication = async (req, res) => {
  try {
    const app = await ProjectApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    app.status = 'approved';
    app.approvedAt = new Date();
    app.assignedBy = req.user._id;
    await app.save();

    await Employee.findByIdAndUpdate(app.employee, {
      isOnBench: false,
      currentProject: app.project
    });

    res.json({ message: 'Application approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reject application
exports.rejectApplication = async (req, res) => {
  try {
    const app = await ProjectApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    app.status = 'rejected';
    app.rejectedReason = req.body.reason;
    await app.save();

    res.json({ message: 'Application rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Drop employee from project
exports.dropFromProject = async (req, res) => {
  try {
    const app = await ProjectApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    app.status = 'dropped';
    app.droppedByAdmin = true;
    await app.save();

    await Employee.findByIdAndUpdate(app.employee, {
      isOnBench: true,
      currentProject: null
    });

    res.json({ message: 'Employee dropped from project' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
    