import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const opts = { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } };

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, index: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  phone: String,
  country: String,
  locationName: String,
  avatarUrl: String,
  gender: { type: String, default: 'other' },
  dateOfBirth: Date,
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active', index: true },
  resetPasswordTokenHash: String,
  resetPasswordExpires: Date,
  preferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false }
  }
}, opts);

const postSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, text: true },
  description: { type: String, required: true, trim: true, text: true },
  itemType: { type: String, enum: ['lost', 'found'], required: true, index: true },
  category: { type: String, required: true, index: true },
  locationName: { type: String, required: true, index: true },
  coordinates: { lat: Number, lng: Number },
  dateOccurred: Date,
  publicContact: String,
  rewardAmount: { type: Number, default: 0 },
  priorityLevel: { type: String, enum: ['normal', 'important', 'emergency'], default: 'normal' },
  status: { type: String, enum: ['open', 'claimed', 'returned', 'removed'], default: 'open', index: true },
  viewCount: { type: Number, default: 0 },
  images: [{ path: String, isPrimary: Boolean, alt: String }]
}, opts);
postSchema.index({ title: 'text', description: 'text', locationName: 'text' });
postSchema.index({ itemType: 1, category: 1, status: 1, createdAt: -1 });

const favoriteSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true }
}, opts);
favoriteSchema.index({ user: 1, post: 1 }, { unique: true });

const conversationSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage: String,
  lastMessageAt: Date
}, opts);
conversationSchema.index({ post: 1, participants: 1 });

const messageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messageText: { type: String, required: true },
  attachmentPath: String,
  isRead: { type: Boolean, default: false }
}, opts);

const claimSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  claimant: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  nidOrPassport: String,
  proofDetails: { type: String, required: true },
  additionalInfo: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date
}, opts);

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  linkUrl: String,
  type: { type: String, default: 'system' },
  isRead: { type: Boolean, default: false }
}, opts);

const reportSchema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: 'User' },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  reason: { type: String, required: true },
  details: String,
  status: { type: String, enum: ['open', 'reviewing', 'resolved', 'dismissed'], default: 'open', index: true },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date
}, opts);

const adminLogSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entityType: String,
  entityId: String,
  meta: Schema.Types.Mixed
}, opts);

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  icon: String,
  active: { type: Boolean, default: true }
}, opts);

export const User = model('User', userSchema);
export const Post = model('Post', postSchema);
export const Favorite = model('Favorite', favoriteSchema);
export const Conversation = model('Conversation', conversationSchema);
export const Message = model('Message', messageSchema);
export const Claim = model('Claim', claimSchema);
export const Notification = model('Notification', notificationSchema);
export const Report = model('Report', reportSchema);
export const AdminLog = model('AdminLog', adminLogSchema);
export const Category = model('Category', categorySchema);
