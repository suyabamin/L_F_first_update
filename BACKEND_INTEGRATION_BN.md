# Lost & Found Backend Integration Guide

## 1. কোন backend ব্যবহার করবেন?

আপনাদের frontend যেহেতু HTML/CSS/JS দিয়ে তৈরি, সবচেয়ে সহজ পথ হলো:

- Beginner/course demo: `backend-php`
- Modern API style: `backend-node`

আপনারা যদি `fetch()` ব্যবহার করতে না চান, তাহলে PHP version বেশি সহজ। কারণ HTML form সরাসরি PHP file-এ submit করা যায়।

## 2. Database import

MySQL/phpMyAdmin এ এই file import করুন:

```text
database/lost_found_schema.sql
```

Database name:

```text
lost_found_app
```

## 3. Main page flow

```text
Register -> Login -> Dashboard -> Create Post -> Browse Listing -> Post Details
Post Details -> Chat / Claim Item / Report
Admin Login -> Admin Panel -> Review Reports/Claims/Posts
```

## 4. Existing HTML form-এ যেগুলো লাগবে

Server-এ data পাঠাতে input field-এ `name` attribute লাগবে। শুধু `id` থাকলে PHP/Node form submit data পাবে না।

### Login.html

```html
<form id="loginForm" class="login-form" action="backend-php/login.php" method="post">
  <input type="email" id="emailInput" name="email" placeholder="Enter your email">
  <input type="password" id="passwordInput" name="password" placeholder="Enter your password">
</form>
```

### Register or Sign Up.html

এখানে `div id="registerForm"` আছে। এটাকে real form করুন:

```html
<form class="form-card" id="registerForm" action="backend-php/register.php" method="post">
  <input type="text" id="username" name="username">
  <input type="text" id="fullname" name="fullname">
  <input type="email" id="email" name="email">
  <input type="tel" id="phone" name="phone">
  <select id="country" name="country"></select>
  <input type="password" id="password" name="password">
  <input type="radio" name="gender" value="male">
  <button type="submit" class="create-btn" id="createAccountBtn">Create Account</button>
</form>
```

Date of birth যদি day/month/year আলাদা থাকে, JS দিয়ে hidden input বানিয়ে `name="dob"` হিসেবে `YYYY-MM-DD` পাঠাবেন।

### Create Post.html

পুরো post fields একটি form-এর ভিতরে রাখুন:

```html
<form action="backend-php/create_post.php" method="post" enctype="multipart/form-data">
  <input type="text" id="title" name="title">
  <input type="hidden" id="category" name="category" value="electronics">
  <input type="radio" name="status" value="lost" checked>
  <input type="radio" name="status" value="found">
  <textarea id="desc" name="desc"></textarea>
  <input type="text" id="location" name="location">
  <input type="date" id="date" name="date">
  <input type="text" id="contact" name="contact">
  <input type="file" id="fileInput" name="images[]" multiple>
  <button type="submit">Publish Post</button>
</form>
```

## 5. AI ছাড়া matching logic

AI model লাগবে না। Simple rule-based matching:

- Lost item হলে found item খুঁজবে
- Found item হলে lost item খুঁজবে
- Same category: +40 score
- Location match: +30 score
- Title/description keyword match: +30 score

Node starter এ route আছে:

```text
GET /items/:id/matches
```

PHP version এ একই logic `browse_listing.php` বা নতুন `matches.php` file দিয়ে করা যাবে।

## 6. Table purpose

- `users`: registered user/admin
- `items`: lost/found post
- `item_images`: post images
- `item_matches`: manual/suggested matches
- `favorites`: saved posts
- `conversations`: chat thread
- `messages`: chat messages
- `claims`: claim verification request
- `reports`: fake/spam report
- `notifications`: system notification
- `ratings`: return complete হওয়ার পরে user rating

## 7. PHP run plan

```text
1. XAMPP start: Apache + MySQL
2. Import SQL
3. Edit backend-php/config.php
4. Add form action + name attributes in HTML
5. Open project from localhost
```

## 8. Node run plan

```bash
cd backend-node
copy .env.example .env
npm install
npm run dev
```

Node version API দেয়। Existing frontend connect করতে হলে normal form submit বা `fetch()`/Axios লাগবে। যেহেতু আপনারা fetch বাদ দিতে চান, PHP route বেশি practical।

