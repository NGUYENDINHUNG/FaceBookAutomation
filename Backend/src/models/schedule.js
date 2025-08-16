// models/Schedule.js
import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page',
    required: true
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly'],
    required: true
  },
  time: {
    type: String,  // Format "HH:mm"
    required: true
  },
  daysOfWeek: [{   // Cho weekly schedule
    type: Number,   // 0-6 (Chủ nhật - Thứ 7)
  }],
  dayOfMonth: {    // Cho monthly schedule
    type: Number,  // 1-31
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRun: Date,   // Lần chạy gần nhất
  nextRun: Date    // Lần chạy tiếp theo
}, {
  timestamps: true
});