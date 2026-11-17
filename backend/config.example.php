<?php
// Fimrash Logistics Services - Production Config
// Copy this file to config.php on the server and fill in every value.
// config.php is git-ignored: never commit real credentials.

return [
    // ── Database ────────────────────────────────────────────────
    'driver'   => 'mysql',            // 'mysql' in production, 'sqlite' for local development
    'host'     => 'localhost',        // Whogohost cPanel MySQL host is almost always localhost
    'port'     => '3306',
    'database' => 'cpaneluser_fimrash',
    'username' => 'cpaneluser_fimrash_user',
    'password' => 'YourStrongDbPasswordHere',

    // ── Security ────────────────────────────────────────────────
    // Signs login tokens and OTP hashes. Generate one with:
    //   php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
    // Changing it logs everyone out and invalidates outstanding delivery OTPs.
    'app_secret' => 'REPLACE_WITH_64_HEX_CHARS',

    // Browser origins allowed to call the API (your Vercel domain(s)).
    // Auth uses bearer tokens, not cookies, so '*' is not a CSRF risk, but listing
    // your real domains is still recommended.
    'allowed_origins' => [
        'https://fimrash.vercel.app',
        'https://www.fimrash.com',
    ],

    // Public URL of the frontend, used to build tracking links in SMS messages.
    'public_app_url' => 'https://www.fimrash.com',

    // First admin account. Created automatically on first request ONLY if no admin exists.
    // After you have logged in once, delete this block (or blank the password).
    'bootstrap_admin' => [
        'email'    => 'ops@fimrash.com',
        'name'     => 'Kano Station Controller',
        'password' => '', // min 10 characters; leave empty to disable
    ],

    // ── Optional: SMS delivery of recipient OTP via Termii ─────
    // Leave api_key empty to disable; senders then share the code via WhatsApp.
    'sms' => [
        'provider'  => 'termii',
        'api_key'   => '',
        'sender_id' => 'Fimrash',
        'channel'   => 'generic', // use 'dnd' once Termii approves your sender ID for DND routes
    ],

    // Show internal error details in API responses. Keep false in production.
    'debug' => false,
];
