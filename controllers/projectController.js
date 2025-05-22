const Project = require('../models/Project');

exports.createProject = async (req, res) => {
    try {
        const project = await Project.create({ ...req.body, createdBy: req.user._id });
        res.status(201).json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('createdBy', 'name email');
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('createdBy', 'name email');
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
        );

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
