# Fimrash Logistics Services — Production Deployment Guide
## Vercel (React Frontend) & Whogohost (PHP / MySQL Backend)

> **Architecture Overview**:
> * **Frontend**: React + Vite + Tailwind CSS deployed on **Vercel** Edge Network for sub-second load times across mobile devices.
> * **Backend**: Ultra-lightweight PHP 8.x Headless REST API hosted on **Whogohost** (cPanel Apache/LiteSpeed with MySQL).
> * **Data Bridge**: CORS-enabled REST endpoints. The MySQL database is the single source of truth; the frontend never fakes success when the API is unreachable.

---

## PART 1: Deploying the Frontend on Vercel

Because you already connected your GitHub account (`OrchidTechie0x60`) to Vercel, deployment takes less than 2 minutes:

### 1. Import Repository in Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Locate and click **"Import"** next to `fimrash-logistics`.

### 2. Configure Build & Root Directory
Vercel will auto-detect Vite. The repository includes root configuration files (`package.json` and `vercel.json`), so either setup works:
* **Option A (Automatic Root)**:
  * **Framework Preset**: `Vite`
  * **Root Directory**: `./` (leave default)
  * **Build Command**: `npm run build --prefix frontend` (auto-detected)
  * **Output Directory**: `frontend/dist` (auto-detected)
* **Option B (Direct Frontend Folder)**:
  * Click **Edit** next to Root Directory and select: `frontend`
  * Build command: `npm run build`
  * Output directory: `dist`

### 3. Add Environment Variable
In the **Environment Variables** section on Vercel:
* **Key**: `VITE_API_BASE_URL`
* **Value**: Your Whogohost backend URL (e.g. `https://api.fimrash.com` or `https://orchidbyte-solutions.com.ng/fimrash-backend/public`)
  *(Note: You can deploy the frontend first, and add this variable once your Whogohost domain is configured).*

### 4. Click "Deploy"
Vercel will build the frontend in ~20 seconds and assign your production URL (e.g., `https://fimrash-logistics.vercel.app`).

---

## PART 2: Deploying the Backend on Whogohost (cPanel)

Whogohost runs cPanel on Apache/LiteSpeed with MySQL and PHP 8.x.

### Step 1: Create the MySQL Database on cPanel
1. Log in to your Whogohost cPanel account (`https://yourdomain.com/cpanel`).
2. Under **Databases**, open **"MySQL® Databases"** (or **"MySQL Database Wizard"**).
3. **Create Database**: e.g. `orchid_fimrash`.
4. **Create Database User**: e.g. `orchid_fimrash_user` with a secure password.
5. **Add User to Database**: Check **"ALL PRIVILEGES"** and click **Make Changes**.

### Step 2: No schema import needed
The API creates and upgrades its own tables on the first request (versioned migrations in `backend/src/Database.php`). Do **not** import any SQL file.

> **Upgrading an existing install?** Migrations run automatically. Old seeded riders (`rider_01`…`rider_05`) are **deactivated** until you set them a PIN, and old plaintext OTPs are hashed. The legacy `cod_ledger` table and `riders.cash_in_hand` column are no longer used; cash is now tracked in `cash_collections` / `remittances`.

### Step 3: Upload the backend
Recommended: create a subdomain such as `api.fimrash.com` whose **document root is `backend/public`**, e.g. upload the `backend/` folder to `/home/<user>/fimrash-backend/` and point the subdomain at `/home/<user>/fimrash-backend/public`. Then `config.php`, `src/` and `storage/` are outside the web root.

If you must place the whole `backend/` folder inside `public_html`, the included `backend/.htaccess` blocks `config.php`, `src/`, `bin/`, `storage/` and `tests/` and forwards requests to `public/`.

```text
fimrash-backend/
├── .htaccess          ← guard (only matters if this folder is web-visible)
├── config.php         ← you create this (Step 4); never commit it
├── bin/manage.php     ← CLI admin tools
├── src/               ← API code
├── storage/           ← created automatically (SQLite dev DB, etc.)
└── public/            ← document root: index.php + .htaccess
```

### Step 4: Create `config.php`
Copy `config.example.php` to `config.php` and fill in **every** value:

* `driver` = `mysql`, plus the database name, user and password from Step 1.
* `app_secret`: a random 64-character hex string. Generate one with
  `php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"` (cPanel → Terminal), or any password manager's 64-char generator. The API refuses to start in MySQL mode without it.
* `allowed_origins`: your Vercel domain(s), e.g. `https://fimrash.vercel.app`. Wildcards like `https://*.vercel.app` are supported for preview deployments.
* `public_app_url`: the customer-facing site URL (used in SMS tracking links).
* `bootstrap_admin`: email, name and a password of **at least 10 characters**. The account is created the first time someone signs in at `/ops`. **After your first successful sign-in, blank out this password in `config.php`.**
* Optional `sms.api_key`: your Termii API key. With it, recipients get their handover code and tracking link by SMS. Without it, senders share the code using the WhatsApp button on the booking confirmation.
* Keep `debug` = `false` in production.

### Step 5: Test the API
Open `https://api.yourdomain.com/api/health`. You should see:
```json
{ "status": "healthy", "service": "Fimrash Logistics API", "version": "3.0.0", "time": "…" }
```
A 500 error here usually means a wrong DB credential or a missing `app_secret`; check cPanel → **Errors** / `error_log`.

---

## PART 3: Connecting Vercel to the API

1. In **Vercel → Settings → Environment Variables**, set `VITE_API_BASE_URL` to the API origin, e.g. `https://api.fimrash.com` (no trailing slash; it must be the URL where `/api/health` works).
2. **Redeploy** (environment variables are baked in at build time).
3. Open the site. The sidebar shows **Service: Online** once the API answers.

## PART 4: First-day setup

1. Go to `https://<your-site>/ops` and sign in with the bootstrap admin. Then blank the bootstrap password in `config.php`.
2. **Fleet → Add rider** for each courier: name, phone, bike plate, home zone and a 4–8 digit PIN (easy PINs like `1234` are rejected). Give each rider their PIN privately.
3. Riders sign in at `https://<your-site>/rider` with their phone number or bike plate and PIN, and tap **On duty** to start receiving jobs.
4. Add more station staff from the server: `php bin/manage.php create-admin email@fimrash.com "Name"`.

## Daily operations

* **Dispatch**: new bookings auto-assign to an on-duty rider in the pickup zone (least busy first). Bookings show as *Unassigned* if nobody is on duty; assign them from **Station Ops → Deliveries**.
* **Lost or locked handover code**: Deliveries → Manage → *Issue new handover code*. Give the new code to the **recipient** only.
* **End of shift cash**: Station Ops → **Cash & CoD**. Count each rider's pouch and enter the amount received; shortfalls are recorded.
* **Paying vendors**: Deliveries → filter *CoD to pay out* → Manage → enter the transfer reference → mark paid.

## If the API is down
The site shows clear error messages (booking, tracking and rider actions need the API). Nothing is stored only in the browser, so no data diverges or gets lost; customers can still reach the desk via the call/WhatsApp buttons.
