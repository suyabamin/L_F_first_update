# CLAUDE.md - Lost & Found Platform Guide

## 1. Project Overview / প্রজেক্ট ওভারভিউ
**English:**
Lost & Found is a comprehensive platform designed to help users report lost items and find found ones. The project serves as a transitionary architecture, featuring both a modern MERN-stack implementation and a legacy PHP-based system. It supports real-time communication, map-based location tracking, and administrative reporting.

**Bangla:**
Lost & Found হলো একটি পূর্ণাঙ্গ প্ল্যাটফর্ম যার মাধ্যমে ব্যবহারকারীরা হারানো জিনিস রিপোর্ট করতে এবং প্রাপ্ত জিনিস খুঁজে পেতে পারেন। এই প্রজেক্টটি একটি ট্রানজিশনাল আর্কিটেকচার হিসেবে কাজ করে, যেখানে আধুনিক MERN-স্ট্যাক ইমপ্লিমেন্টেশন এবং লিগ্যাসি PHP-ভিত্তিক সিস্টেম—উভয়টিই বিদ্যমান। এটি রিয়েল-টাইম কমিউনিকেশন, ম্যাপ-ভিত্তিক লোকেশন ট্র্যাকিং এবং অ্যাডমিনিস্ট্রেটিভ রিপোর্টিং সাপোর্ট করে।

---

## 2. Tech Stack / টেক স্ট্যাক
**Frontend (ফ্রন্টএন্ড):**
- **Modern Stack:** React, Vite, Tailwind CSS, Framer Motion, Leaflet (Maps), Socket.io-client.
- **Classic Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+).

**Backend (ব্যাকএন্ড):**
- **Node.js (MERN):** Express, MongoDB, Mongoose, Socket.io (Located in `backend/`).
- **Node.js (Starter):** Express, MySQL, Supabase (Located in `backend-node/`).
- **PHP:** Apache/Nginx, MySQL (Located in `backend-php/`).

**Infrastructure (ইনফ্রাস্ট্রাকচার):**
- **Proxy Server:** Node.js custom server (`dev-server.js`).
- **Databases:** MongoDB, MySQL, and SQLite (for local fallback).

---

## 3. Architecture / আর্কিটেকচার
**English:**
The project uses a multi-backend strategy managed by a central proxy server (`dev-server.js`) running on port 8000.
- **Request Routing:**
  - `/api/*` and `/socket.io/*` $\rightarrow$ Routed to the Node.js MERN backend (Default: `http://localhost:5000`).
  - `/backend-php/*` $\rightarrow$ Routed to the PHP backend (Default: `http://localhost:80`).
  - **Static Files:** All other requests serve the `.html` files in the root or utilize local SQLite handlers.
- **Dual Frontend:** The app operates as both a Single Page Application (React in `frontend/`) and a Multi-Page Application (Static HTML in root).

**Bangla:**
এই প্রজেক্টটি একটি মাল্টি-ব্যাকএন্ড স্ট্র্যাটেজি ব্যবহার করে, যা একটি সেন্ট্রাল প্রক্সি সার্ভার (`dev-server.js`) দ্বারা নিয়ন্ত্রিত হয় (পোর্ট ৮০০০)।
- **রিকোয়েস্ট রাউটিং:**
  - `/api/*` এবং `/socket.io/*` $\rightarrow$ নোড ডট জেএস MERN ব্যাকএন্ডে পাঠানো হয় (ডিফল্ট: `http://localhost:5000`)।
  - `/backend-php/*` $\rightarrow$ পিএইচপি ব্যাকএন্ডে পাঠানো হয় (ডিফল্ট: `http://localhost:80`)।
  - **স্ট্যাটিক ফাইল:** অন্যান্য সমস্ত রিকোয়েস্ট রুটে থাকা `.html` ফাইলগুলো সার্ভ করে অথবা লোকাল SQLite হ্যান্ডলার ব্যবহার করে।
- **ডুয়াল ফ্রন্টএন্ড:** অ্যাপ্লিকেশনটি একটি সিঙ্গেল পেজ অ্যাপ্লিকেশন (React `frontend/` ফোল্ডারে) এবং একটি মাল্টি-পেজ অ্যাপ্লিকেশন (রুটে থাকা স্ট্যাটিক HTML) হিসেবে কাজ করে।

---

## 4. Setup and Run / সেটআপ এবং রান
**English:**
1. **Proxy Server:** Install root dependencies `npm install` and run `npm start`.
2. **Node Backend:** `cd backend && npm install && npm start`.
3. **PHP Backend:** Use XAMPP/WAMP to host the `backend-php` folder.
4. **React Frontend:** `cd frontend && npm install && npm run dev`.

**Bangla:**
১. **প্রক্সি সার্ভার:** রুটে `npm install` করুন এবং `npm start` কমান্ড চালান।
২. **নোড ব্যাকএন্ড:** `cd backend && npm install && npm start` কমান্ডটি চালান।
৩. **পিএইচপি ব্যাকএন্ড:** XAMPP/WAMP ব্যবহার করে `backend-php` ফোল্ডারটি হোস্ট করুন।
৪. **রিঅ্যাক্ট ফ্রন্টএন্ড:** `cd frontend && npm install && npm run dev` কমান্ডটি চালান।

---

## 5. Development Workflow / ডেভেলপমেন্ট ওয়ার্কফ্লো
**English:**
- **Static Page Feature:** Create an `.html` file in the root and a corresponding logic file in `js/`.
- **React Feature:** Develop components within `frontend/src`.
- **API Integration (Static):** Use the `LF.api()` helper from `js/lf-core.js`.
  - Example: `LF.api('endpoint.php').then(({ data }) => { ... })`
- **Routing:** Static pages use file-based routing (e.g., `Profile Page.html`). The React app uses `react-router-dom`.

**Bangla:**
- **স্ট্যাটিক পেজ ফিচার:** রুটে একটি `.html` ফাইল তৈরি করুন এবং `js/` ফোল্ডারে প্রয়োজনীয় লজিক ফাইল তৈরি করুন।
- **রিঅ্যাক্ট ফিচার:** `frontend/src` এর ভেতরে কম্পোনেন্ট তৈরি করুন।
- **এপিআই ইন্টিগ্রেশন (স্ট্যাটিক):** `js/lf-core.js` থেকে `LF.api()` হেল্পারটি ব্যবহার করুন।
  - উদাহরণ: `LF.api('endpoint.php').then(({ data }) => { ... })`
- **রাউটিং:** স্ট্যাটিক পেজগুলো ফাইল-ভিত্তিক রাউটিং ব্যবহার করে (যেমন: `Profile Page.html`)। রিঅ্যাক্ট অ্যাপটি `react-router-dom` ব্যবহার করে।

---

## 6. Coding Guidelines / কোডিং গাইডলাইনস
**English:**
- **Naming:** Use descriptive, spaced names for HTML files (e.g., `Create Post.html`).
- **Global Helper:** Always use the `LF` global object for shared utilities (Auth, HTML escaping, URL generation).
- **Auth Guard:** Use `data-require-auth` or `data-require-admin` attributes on script tags to protect static pages.

**Bangla:**
- **নেমিং:** এইচটিএমএল ফাইলের জন্য বর্ণনামূলক এবং স্পেস-যুক্ত নাম ব্যবহার করুন (যেমন: `Create Post.html`)।
- **গ্লোবাল হেল্পার:** শেয়ারড ইউটিলিটিজ (অথেনটিকেশন, HTML এস্কেপিং, URL জেনারেশন) এর জন্য সর্বদা `LF` গ্লোবাল অবজেক্ট ব্যবহার করুন।
- **অথ গার্ড:** স্ট্যাটিক পেজ সুরক্ষিত করতে স্ক্রিপ্ট ট্যাগে `data-require-auth` অথবা `data-require-admin` অ্যাট্রিবিউট ব্যবহার করুন।

---

## 7. Common Commands / কমন কমান্ডস
**English:**
- `npm start`: Start proxy server.
- `npm run backend`: Start the MERN backend.
- `npm run clean`: Stop process on port 8000.
- `npm run restart`: Reset and start the proxy.
- `cd frontend && npm run dev`: Start React development server.

**Bangla:**
- `npm start`: প্রক্সি সার্ভার শুরু করতে।
- `npm run backend`: MERN ব্যাকএন্ড শুরু করতে।
- `npm run clean`: পোর্ট ৮০০০ এর প্রসেস বন্ধ করতে।
- `npm run restart`: প্রক্সি সার্ভার রিসেট করে শুরু করতে।
- `cd frontend && npm run dev`: রিঅ্যাক্ট ডেভেলপমেন্ট সার্ভার শুরু করতে।
