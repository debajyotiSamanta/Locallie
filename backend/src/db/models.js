const mongoose = require('mongoose');

// Shared toJSON/toObject option to map _id to id
const toJSONOptions = {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  }
};

// --- USER SCHEMA ---
const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => `u_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
  },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["Resident", "Community Hero", "NGO/Volunteer", "Government/Admin"]
  },
  xp: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  reputation: { type: String }
}, { timestamps: true });

userSchema.set('toJSON', toJSONOptions);
userSchema.set('toObject', toJSONOptions);

// --- COMMENT SCHEMA ---
const commentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
  },
  username: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
commentSchema.set('toJSON', toJSONOptions);
commentSchema.set('toObject', toJSONOptions);

// --- ISSUE SCHEMA ---
const issueSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => `issue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  address: { type: String, required: true },
  gps: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  image: { type: String },
  video: { type: String, default: "" },
  priority: { type: String, default: "Low" },
  severity: { type: String, default: "Low" },
  status: {
    type: String,
    enum: ["reported", "claimed", "resolved"],
    default: "reported"
  },
  reporter: {
    username: { type: String },
    email: { type: String }
  },
  comments: [commentSchema],
  upvotes: [{ type: String }], // Array of User IDs
  claimedBy: {
    id: { type: String, default: null },
    username: { type: String, default: null },
    role: { type: String, default: null }
  },
  dateReported: { type: Date, default: Date.now },
  dateClaimed: { type: Date, default: null },
  dateResolved: { type: Date, default: null },
  beforeImage: { type: String },
  afterImage: { type: String, default: "" },
  isAnonymous: { type: Boolean, default: false },
  department: { type: String },
  duplicateOf: { type: String, default: null },
  priorityScore: { type: Number, default: 0 }
}, { timestamps: true });

issueSchema.set('toJSON', toJSONOptions);
issueSchema.set('toObject', toJSONOptions);

// --- DRIVE SCHEMA ---
const driveSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => `drive_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  organizer: { type: String, required: true },
  volunteers: [{ type: String }], // Array of usernames
  image: { type: String },
  comments: [commentSchema]
}, { timestamps: true });

driveSchema.set('toJSON', toJSONOptions);
driveSchema.set('toObject', toJSONOptions);

// --- AUDIT LOG SCHEMA ---
const auditLogSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
  },
  timestamp: { type: Date, default: Date.now },
  user: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true }
});

auditLogSchema.set('toJSON', toJSONOptions);
auditLogSchema.set('toObject', toJSONOptions);

// --- EXPORTS ---
const User = mongoose.model('User', userSchema);
const Issue = mongoose.model('Issue', issueSchema);
const Drive = mongoose.model('Drive', driveSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = {
  User,
  Issue,
  Drive,
  AuditLog
};
