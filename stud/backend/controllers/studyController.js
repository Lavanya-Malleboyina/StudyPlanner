const StudyPlan = require('../models/StudyPlan');
const Quote = require('../models/Quote');

// Get all study plans for user
const getStudyPlans = async (req, res) => {
  try {
    const studyPlans = await StudyPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(studyPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new study plan
const createStudyPlan = async (req, res) => {
  try {
    const { subject, topic, duration, priority, dueDate, color } = req.body;

    const studyPlan = await StudyPlan.create({
      userId: req.user._id,
      subject,
      topic,
      duration,
      priority,
      dueDate,
      color
    });

    res.status(201).json(studyPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update study plan
const updateStudyPlan = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findById(req.params.id);

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Check if user owns the study plan
    if (studyPlan.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedStudyPlan = await StudyPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedStudyPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete study plan
const deleteStudyPlan = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findById(req.params.id);

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Check if user owns the study plan
    if (studyPlan.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await StudyPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Study plan removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get motivational quotes
const getQuotes = async (req, res) => {
  try {
    // For now, return hardcoded quotes. You can replace this with database quotes
    const quotes = [
      {
        text: "The secret of getting ahead is getting started.",
        author: "Mark Twain"
      },
      {
        text: "Education is the most powerful weapon which you can use to change the world.",
        author: "Nelson Mandela"
      },
      {
        text: "The beautiful thing about learning is that no one can take it away from you.",
        author: "B.B. King"
      },
      {
        text: "Don't let what you cannot do interfere with what you can do.",
        author: "John Wooden"
      },
      {
        text: "The expert in anything was once a beginner.",
        author: "Helen Hayes"
      }
    ];

    // Get random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json(randomQuote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get progress statistics
const getProgress = async (req, res) => {
  try {
    const totalPlans = await StudyPlan.countDocuments({ userId: req.user._id });
    const completedPlans = await StudyPlan.countDocuments({ 
      userId: req.user._id, 
      completed: true 
    });
    
    const progress = totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0;

    res.json({
      total: totalPlans,
      completed: completedPlans,
      progress: Math.round(progress)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudyPlans,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
  getQuotes,
  getProgress
};