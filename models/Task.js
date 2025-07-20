import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, isCompleted: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ dueDate: 1 });

// Set completedAt when task is completed
taskSchema.pre('save', function(next) {
  if (this.isModified('isCompleted')) {
    if (this.isCompleted) {
      this.completedAt = new Date();
    } else {
      this.completedAt = undefined;
    }
  }
  next();
});

export default mongoose.model('Task', taskSchema);
