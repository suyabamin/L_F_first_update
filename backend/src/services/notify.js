import { Notification } from '../models/index.js';

export async function notify(user, title, body, linkUrl, io) {
  if (!user) return null;
  const notification = await Notification.create({ user, title, body, linkUrl });
  io?.to(String(user)).emit('notification:new', {
    id: String(notification._id),
    title,
    description: body,
    actionLink: linkUrl,
    read: false,
    createdAt: notification.createdAt
  });
  return notification;
}
