const Project = require('../models/Project');
const Employee = require('../models/Employee');
const moment = require('moment'); // Use for consistent date formatting


// exports.createProject = async (req, res) => {
//   try {
//     const { title, teamLead, teamSizeLimit = 1 } = req.body;

//     if (!title || title.length < 2) {
//       return res.status(400).json({ error: 'Project title must be at least 2 characters' });
//     }

//     // Generate base components
//     const dateStr = moment().format('YYYYMMDD');
//     const suffix = title.trim().substring(0, 2).toUpperCase();

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);

//     const countToday = await Project.countDocuments({
//       createdAt: { $gte: today, $lt: tomorrow }
//     });

//     const count = countToday + 1;
//     const projectId = `PRJ-${dateStr}-${suffix}${count}`;

//     // Assigned employees list initialization
//     const assignedEmployees = [];

//     // If teamLead is provided, add them to assigned employees and update their bench status
//     if (teamLead) {
//       const lead = await Employee.findById(teamLead);
//       if (!lead) return res.status(404).json({ error: 'Team lead not found' });

//       // Set team lead as assigned and off bench
//       await Employee.findByIdAndUpdate(teamLead, { isOnBench: false });

//       assignedEmployees.push(teamLead);
//     }

//     const project = await Project.create({
//       ...req.body,
//       projectId,
//       createdBy: req.user._id,
//       assignedEmployees,
//       vacancy: teamSizeLimit - assignedEmployees.length
//     });

//     const populatedProject = await Project.findById(project._id)
//       .populate('createdBy', 'name email')
//       .populate('teamLead', 'name email')
//       .populate('assignedEmployees', 'name email');

//     res.status(201).json(populatedProject);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };


// exports.createProject = async (req, res) => {
//   try {
//     const { title } = req.body;

//     if (!title || title.length < 2) {
//       return res.status(400).json({ error: 'Project title must be at least 2 characters' });
//     }

//     // Generate base components
//     const dateStr = moment().format('YYYYMMDD');
//     const suffix = title.trim().substring(0, 2).toUpperCase();

//     // Count existing projects for today
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);

//     const countToday = await Project.countDocuments({
//       createdAt: { $gte: today, $lt: tomorrow }
//     });

//     const count = countToday + 1;

//     // Generate projectId
//     const projectId = `PRJ-${dateStr}-${suffix}${count}`;

//     // Create the project
//     const project = await Project.create({
//       ...req.body,
//       projectId,
//       createdBy: req.user._id
//     });

//     res.status(201).json(project).populate('createdBy', 'name email').populate('teamLead', 'name email');
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// exports.createProject = async (req, res) => {
//     try {
//         const project = await Project.create({ ...req.body, createdBy: req.user._id });
//         res.status(201).json(project);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };


exports.createProject = async (req, res) => {
  try {
    const { title, teamLead, teamSizeLimit = 1 } = req.body;

    if (!title || title.length < 2) {
      return res.status(400).json({ error: 'Project title must be at least 2 characters' });
    }

    // Generate projectId
    const dateStr = moment().format('YYYYMMDD');
    const suffix = title.trim().substring(0, 2).toUpperCase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const countToday = await Project.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const count = countToday + 1;
    const projectId = `PRJ-${dateStr}-${suffix}${count}`;

    // Initialize assignedEmployees array
    const assignedEmployees = [];

    // Check and assign team lead if provided
    if (teamLead) {
      const lead = await Employee.findById(teamLead);
      if (!lead) {
        return res.status(404).json({ error: 'Team lead not found' });
      }

      if (!lead.isOnBench) {
        return res.status(400).json({ error: 'Team lead is already assigned to another project' });
      }

      // Mark as off-bench and add to assigned
      await Employee.findByIdAndUpdate(teamLead, { isOnBench: false });
      assignedEmployees.push(teamLead);
    }

    // Create project
    const project = await Project.create({
      ...req.body,
      projectId,
      createdBy: req.user._id,
      assignedEmployees,
      vacancy: teamSizeLimit - assignedEmployees.length
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name employeeId')
      .populate('teamLead', 'name employeeId')
      .populate('assignedEmployees', 'name employeeId');

    res.status(201).json(populatedProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('createdBy', 'name employeeId').populate('teamLead', 'name employeeId').populate('assignedEmployees', 'name employeeId');
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('createdBy', 'name employeeId').populate('teamLead', 'name employeeId').populate('assignedEmployees', 'name employeeId');
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// exports.updateProject = async (req, res) => {
//   try {
//     const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!project) return res.status(404).json({ error: 'Project not found' });
//     res.json(project);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            { $set: req.body }, // Ensures deep updates
            { new: true, runValidators: true }
        ).populate('createdBy', 'name employeeId').populate('teamLead', 'name employeeId').populate('assignedEmployees', 'name employeeId');

        if (!updatedProject) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
