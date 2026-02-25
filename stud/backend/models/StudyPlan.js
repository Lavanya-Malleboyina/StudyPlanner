const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true
  },
  topic: {
    type: String,
    required: [true, 'Please add a topic'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Please add study duration'],
    min: 1
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);