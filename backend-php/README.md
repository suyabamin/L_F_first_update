# PHP + MySQL starter

This starter is designed for simple HTML form submission without using `fetch()`.

## Setup

1. Install XAMPP, WAMP, or Laragon.
2. Import `../database/lost_found_schema.sql` into MySQL/phpMyAdmin.
3. Copy this `backend-php` folder into your server root, or keep the full project in `htdocs`.
4. Edit `config.php` database settings.
5. Update your HTML forms:
   - Login form: `action="backend-php/login.php" method="post"`
   - Register form: `action="backend-php/register.php" method="post"`
   - Create post form: `action="backend-php/create_post.php" method="post" enctype="multipart/form-data"`

## Important

This is a starter. Keep frontend validation for user experience, but backend validation must always remain.

