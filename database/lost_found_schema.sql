CREATE DATABASE IF NOT EXISTS lost_found_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lost_found_app;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  country VARCHAR(60),
  location_name VARCHAR(180),
  avatar_url TEXT,
  email_notifications TINYINT(1) NOT NULL DEFAULT 1,
  push_notifications TINYINT(1) NOT NULL DEFAULT 1,
  sms_notifications TINYINT(1) NOT NULL DEFAULT 0,
  marketing_notifications TINYINT(1) NOT NULL DEFAULT 0,
  gender ENUM('male', 'female', 'other') DEFAULT 'other',
  date_of_birth DATE,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  item_type ENUM('lost', 'found') NOT NULL,
  category VARCHAR(60) NOT NULL,
  location_name VARCHAR(180) NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  date_occurred DATE,
  public_contact VARCHAR(120),
  reward_amount DECIMAL(10, 2) DEFAULT 0,
  priority_level ENUM('normal', 'important', 'emergency') NOT NULL DEFAULT 'normal',
  status ENUM('open', 'matched', 'claimed', 'returned', 'closed', 'removed') NOT NULL DEFAULT 'open',
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_items_type_status (item_type, status),
  INDEX idx_items_category (category),
  INDEX idx_items_location (location_name),
  FULLTEXT INDEX ft_items_search (title, description, location_name)
);

CREATE TABLE item_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_images_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE item_matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lost_item_id INT NOT NULL,
  found_item_id INT NOT NULL,
  match_score INT NOT NULL DEFAULT 0,
  status ENUM('suggested', 'accepted', 'rejected') NOT NULL DEFAULT 'suggested',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_matches_lost FOREIGN KEY (lost_item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT fk_matches_found FOREIGN KEY (found_item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE KEY uq_match_pair (lost_item_id, found_item_id)
);

CREATE TABLE favorites (
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, item_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  owner_id INT NOT NULL,
  participant_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_conv_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT fk_conv_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_conv_participant FOREIGN KEY (participant_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_conversation (item_id, owner_id, participant_id)
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  message_text TEXT NOT NULL,
  attachment_path VARCHAR(255),
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  claimant_id INT NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  nid_or_passport VARCHAR(80),
  proof_details TEXT NOT NULL,
  additional_info TEXT,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  reviewed_by INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  CONSTRAINT fk_claims_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT fk_claims_claimant FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_claims_admin FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT,
  item_id INT,
  reason VARCHAR(180) NOT NULL,
  details TEXT,
  status ENUM('open', 'reviewed', 'resolved', 'dismissed') NOT NULL DEFAULT 'open',
  reviewed_by INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_reports_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_admin FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  link_url VARCHAR(255),
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_user_id INT NOT NULL,
  to_user_id INT NOT NULL,
  item_id INT,
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_ratings_from FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_to FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
);

CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (username, full_name, email, password_hash, role, is_verified)
VALUES
('admin', 'System Admin', 'admin@lostfound.local', 'node_sha256$240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 1),
('rahim', 'Rahim Ahmed', 'rahim@example.com', 'node_sha256$ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'user', 1),
('sadia', 'Sadia Islam', 'sadia@example.com', 'node_sha256$ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'user', 1),
('tanvir', 'Tanvir Hasan', 'tanvir@example.com', 'node_sha256$ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'user', 1);

INSERT INTO items
  (user_id, title, description, item_type, category, location_name, latitude, longitude, date_occurred, public_contact, reward_amount, priority_level, status, view_count)
VALUES
  ((SELECT id FROM users WHERE username = 'rahim'), 'Lost Black Leather Wallet',
   'Black leather wallet containing university ID card, two bank cards, and a small family photo. Last seen near the food court.',
   'lost', 'wallet', 'Bashundhara City Food Court, Dhaka', 23.7509000, 90.3904000, '2026-05-10', '+8801711000001', 1000.00, 'important', 'open', 24),
  ((SELECT id FROM users WHERE username = 'sadia'), 'Found Black Wallet Near Food Court',
   'A black wallet was found beside a table near the food court escalator. Owner should describe the ID card and contents.',
   'found', 'wallet', 'Bashundhara City Food Court, Dhaka', 23.7507000, 90.3906000, '2026-05-11', '+8801711000002', 0.00, 'normal', 'open', 31),
  ((SELECT id FROM users WHERE username = 'tanvir'), 'Lost Blue Backpack',
   'Blue backpack with laptop charger, notebook, and a water bottle. Lost while boarding a bus from the campus gate.',
   'lost', 'bag', 'Dhanmondi 27 Bus Stop, Dhaka', 23.7561000, 90.3752000, '2026-05-12', '+8801711000003', 1500.00, 'important', 'open', 18),
  ((SELECT id FROM users WHERE username = 'rahim'), 'Found Key Ring With Three Keys',
   'A silver key ring with three keys and a red tag was found near the library entrance.',
   'found', 'key', 'Central Library Entrance, Dhaka', 23.7289000, 90.3854000, '2026-05-13', '+8801711000004', 0.00, 'normal', 'open', 12),
  ((SELECT id FROM users WHERE username = 'sadia'), 'Lost Samsung Phone',
   'Samsung phone in a transparent case. The lock screen has a blue wallpaper. Lost inside a ride-share car near Gulshan.',
   'lost', 'electronics', 'Gulshan 1 Circle, Dhaka', 23.7806000, 90.4168000, '2026-05-14', '+8801711000005', 2500.00, 'emergency', 'open', 42),
  ((SELECT id FROM users WHERE username = 'tanvir'), 'Found Student ID Card',
   'Student ID card found on the sidewalk near the main gate. Name and department are visible; owner must verify details.',
   'found', 'paper', 'University Main Gate, Dhaka', 23.7278000, 90.3849000, '2026-05-15', '+8801711000006', 0.00, 'normal', 'open', 9),
  ((SELECT id FROM users WHERE username = 'rahim'), 'Found Wireless Earbuds',
   'White wireless earbuds found beside the food court escalator. Owner should identify the case marks.',
   'found', 'electronics', 'Bashundhara City Food Court, Dhaka', 23.7507000, 90.3906000, '2026-05-15', '+8801711000007', 0.00, 'normal', 'open', 9),
  ((SELECT id FROM users WHERE username = 'sadia'), 'Lost Cat Milo',
   'Orange tabby cat named Milo, wearing a blue collar. Last seen near Dhanmondi 27.',
   'lost', 'pets', 'Dhanmondi 27, Dhaka', 23.7561000, 90.3752000, '2026-05-12', '+8801711000008', 3000.00, 'important', 'open', 21),
  ((SELECT id FROM users WHERE username = 'tanvir'), 'Found Brown Puppy',
   'Small brown puppy found near the university gate. Finder is keeping it safe.',
   'found', 'pets', 'University Main Gate, Dhaka', 23.7278000, 90.3849000, '2026-05-13', '+8801711000009', 0.00, 'normal', 'open', 14),
  ((SELECT id FROM users WHERE username = 'rahim'), 'Found Laptop Bag',
   'Black laptop bag found on a bus seat near Banani. Contains papers and a charger.',
   'found', 'bag', 'Banani 11, Dhaka', 23.7937000, 90.4066000, '2026-05-15', '+8801711000010', 0.00, 'normal', 'open', 11),
  ((SELECT id FROM users WHERE username = 'sadia'), 'Lost Car Keys',
   'Toyota car key with red keychain lost near the parking lot.',
   'lost', 'key', 'Bashundhara R/A Parking, Dhaka', 23.8195000, 90.4526000, '2026-05-10', '+8801711000011', 1000.00, 'normal', 'open', 7),
  ((SELECT id FROM users WHERE username = 'tanvir'), 'Lost Academic Certificate',
   'Original academic certificate lost in a folder near the library hall.',
   'lost', 'paper', 'Library Hall, Dhaka', 23.7283000, 90.3862000, '2026-05-09', '+8801711000012', 2000.00, 'important', 'open', 16),
  ((SELECT id FROM users WHERE username = 'rahim'), 'Lost Gold Necklace',
   'Gold necklace with small pendant lost at Jamuna Future Park.',
   'lost', 'jewelry', 'Jamuna Future Park, Dhaka', 23.8133000, 90.4242000, '2026-05-11', '+8801711000013', 5000.00, 'important', 'open', 19),
  ((SELECT id FROM users WHERE username = 'sadia'), 'Found Silver Bracelet',
   'Silver bracelet found near the lake walkway. Owner should describe the charm.',
   'found', 'jewelry', 'Dhanmondi Lake, Dhaka', 23.7461000, 90.3742000, '2026-05-16', '+8801711000014', 0.00, 'normal', 'open', 8);

INSERT INTO item_images (item_id, image_path, is_primary)
VALUES
  ((SELECT id FROM items WHERE title = 'Lost Black Leather Wallet' LIMIT 1), 'backend-php/uploads/items/seed-wallet-lost.svg', 1),
  ((SELECT id FROM items WHERE title = 'Found Black Wallet Near Food Court' LIMIT 1), 'backend-php/uploads/items/seed-wallet-found.svg', 1),
  ((SELECT id FROM items WHERE title = 'Lost Blue Backpack' LIMIT 1), 'backend-php/uploads/items/seed-backpack.svg', 1),
  ((SELECT id FROM items WHERE title = 'Found Key Ring With Three Keys' LIMIT 1), 'backend-php/uploads/items/seed-keys.svg', 1),
  ((SELECT id FROM items WHERE title = 'Lost Samsung Phone' LIMIT 1), 'backend-php/uploads/items/seed-phone.svg', 1),
  ((SELECT id FROM items WHERE title = 'Found Student ID Card' LIMIT 1), 'backend-php/uploads/items/seed-id-card.svg', 1);

INSERT INTO item_matches (lost_item_id, found_item_id, match_score, status)
VALUES
  (
    (SELECT id FROM items WHERE title = 'Lost Black Leather Wallet' LIMIT 1),
    (SELECT id FROM items WHERE title = 'Found Black Wallet Near Food Court' LIMIT 1),
    92,
    'suggested'
  );
