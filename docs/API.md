# API Overview

Base URL:

```text
http://localhost:5000/api
```

Legacy frontend compatibility paths are also available under:

```text
http://localhost:5000/backend-php
```

## Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Users

- `GET /api/users/profile`
- `POST /api/users/profile`
- `DELETE /api/users/profile`

## Posts

- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `GET /api/posts/dashboard/recent`
- `GET /api/posts/stats/categories`

## Messaging

- `POST /api/messages`
- `GET /api/messages/conversations`
- `GET /api/messages/conversations/:id`

## Claims, Favorites, Notifications, Reports

- `POST /api/claims`
- `GET /api/claims/mine`
- `GET /api/favorites`
- `POST /api/favorites`
- `GET /api/notifications`
- `POST /api/notifications/read`
- `POST /api/reports`

## Admin

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/items`
- `PATCH /api/admin/items/:id/remove`
- `GET /api/admin/claims`
- `PATCH /api/admin/claims/:id`
- `GET /api/admin/reports`
