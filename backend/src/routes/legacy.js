import { Router } from 'express';

const router = Router();

function forward(method, path, handler) {
  router[method](path, handler);
}

forward('get', '/health.php', (_req, res) => res.json({ success: true, database: 'mongodb' }));
forward('post', '/register.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/auth/register', method: 'POST' }), res, next));
forward('post', '/login.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/auth/login', method: 'POST' }), res, next));
forward('post', '/logout.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/auth/logout', method: 'POST' }), res, next));
forward('get', '/me.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/auth/me', method: 'GET' }), res, next));
forward('post', '/profile.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/users/profile', method: 'POST' }), res, next));
forward('post', '/delete-account.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/users/profile', method: 'DELETE' }), res, next));
forward('get', '/browse_listing.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: `/api/posts?${new URLSearchParams(req.query)}`, method: 'GET' }), res, next));
forward('get', '/item.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: `/api/posts/${req.query.id}`, method: 'GET' }), res, next));
forward('get', '/dashboard_posts.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/posts/dashboard/recent', method: 'GET' }), res, next));
forward('get', '/category_stats.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/posts/stats/categories', method: 'GET' }), res, next));
forward('post', '/create_post.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/posts', method: 'POST' }), res, next));
forward('post', '/claim_item.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/claims', method: 'POST' }), res, next));
forward('post', '/send_message.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/messages', method: 'POST' }), res, next));
forward('get', '/messages.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: `/api/messages/conversations/${req.query.conversation_id}`, method: 'GET' }), res, next));
forward('get', '/user.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: `/api/users/${req.query.id}`, method: 'GET' }), res, next));
// Conversations legacy endpoints
forward('post', '/start_conversation.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/conversations/start', method: 'POST' }), res, next));
forward('get', '/conversations.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/conversations', method: 'GET' }), res, next));

forward('post', '/favorite.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/favorites', method: 'POST' }), res, next));
forward('get', '/notifications.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/notifications', method: 'GET' }), res, next));
forward('post', '/notification_read.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/notifications/read', method: 'POST' }), res, next));
forward('post', '/report.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/reports', method: 'POST' }), res, next));
forward('post', '/feedback.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/reports', method: 'POST' }), res, next));
forward('get', '/admin/stats.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/admin/stats', method: 'GET' }), res, next));
forward('get', '/admin/users.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/admin/users', method: 'GET' }), res, next));
forward('get', '/admin/items.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/admin/items', method: 'GET' }), res, next));
forward('get', '/admin/claims.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/admin/claims', method: 'GET' }), res, next));
forward('get', '/admin/reports.php', (req, res, next) => req.app._router.handle(Object.assign(req, { url: '/api/admin/reports', method: 'GET' }), res, next));
forward('post', '/admin/items/:id/remove', (req, res, next) => req.app._router.handle(Object.assign(req, { url: `/api/admin/items/${req.params.id}/remove`, method: 'PATCH' }), res, next));
forward('post', '/admin/claims/:id', (req, res, next) => req.app._router.handle(Object.assign(req, { url: `/api/admin/claims/${req.params.id}`, method: 'PATCH' }), res, next));

router.get('/browse_listing_view.php', (req, res) => {
  const qs = new URLSearchParams(req.query).toString();
  res.redirect(`/Browse Listing.html${qs ? `?${qs}` : ''}`);
});
router.get('/post_details_view.php', (req, res) => res.redirect(`/Post Details.html?id=${encodeURIComponent(req.query.id || '')}`));

export default router;
