USE lost_found_app;

INSERT INTO items
  (user_id, title, description, item_type, category, location_name, latitude, longitude, date_occurred, public_contact, reward_amount, priority_level, status, view_count)
SELECT u.id, seed.title, seed.description, seed.item_type, seed.category, seed.location_name, seed.latitude, seed.longitude,
       seed.date_occurred, seed.public_contact, seed.reward_amount, seed.priority_level, seed.status, seed.view_count
FROM (
  SELECT 'rahim' AS username, 'Lost AirPods Pro Case' AS title,
         'White AirPods Pro case with a small scratch near the hinge. Last seen after evening class.' AS description,
         'lost' AS item_type, 'electronics' AS category, 'UIU Campus Cafeteria, Dhaka' AS location_name,
         23.7989000 AS latitude, 90.4492000 AS longitude, '2026-05-16' AS date_occurred,
         '+8801711000021' AS public_contact, 1200.00 AS reward_amount, 'important' AS priority_level,
         'open' AS status, 6 AS view_count
  UNION ALL SELECT 'sadia', 'Found Blue Umbrella',
         'Foldable blue umbrella found beside the entrance after rain. Owner can identify the handle sticker.',
         'found', 'others', 'Baily Road, Dhaka', 23.7415000, 90.4101000, '2026-05-16',
         '+8801711000022', 0.00, 'normal', 'open', 4
  UNION ALL SELECT 'tanvir', 'Lost Passport Folder',
         'Black document folder containing passport photocopies and printed travel papers.',
         'lost', 'paper', 'Agargaon Passport Office, Dhaka', 23.7799000, 90.3796000, '2026-05-15',
         '+8801711000023', 3500.00, 'emergency', 'open', 13
  UNION ALL SELECT 'rahim', 'Found Ladies Wristwatch',
         'Rose-gold wristwatch found near the lake walkway bench. Owner should describe the dial.',
         'found', 'jewelry', 'Dhanmondi Lake, Dhaka', 23.7465000, 90.3747000, '2026-05-16',
         '+8801711000024', 0.00, 'normal', 'open', 5
  UNION ALL SELECT 'sadia', 'Lost Office Laptop Bag',
         'Grey laptop shoulder bag with company notebook and charger inside.',
         'lost', 'bag', 'Kawran Bazar Metro Station, Dhaka', 23.7517000, 90.3939000, '2026-05-14',
         '+8801711000025', 2000.00, 'important', 'open', 17
  UNION ALL SELECT 'tanvir', 'Found House Key With Green Tag',
         'Single house key with a green plastic tag found near a pharmacy counter.',
         'found', 'key', 'Mohammadpur Town Hall, Dhaka', 23.7650000, 90.3588000, '2026-05-17',
         '+8801711000026', 0.00, 'normal', 'open', 3
) seed
JOIN users u ON u.username = COALESCE(
  (SELECT username FROM users matched_user WHERE matched_user.username = seed.username LIMIT 1),
  (SELECT username FROM users admin_user WHERE admin_user.username = 'admin' LIMIT 1),
  (SELECT username FROM users any_user ORDER BY id ASC LIMIT 1)
)
WHERE NOT EXISTS (
  SELECT 1 FROM items existing
  WHERE existing.title = seed.title
    AND existing.location_name = seed.location_name
    AND existing.date_occurred = seed.date_occurred
);
