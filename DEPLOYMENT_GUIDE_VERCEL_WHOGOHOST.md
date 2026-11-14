# Fimrash Logistics Services — Production Deployment Guide
## Vercel (React Frontend) & Whogohost (PHP / MySQL Backend)

> **Architecture Overview**:
> * **Frontend**: React + Vite + Tailwind CSS deployed on **Vercel** Edge Network for sub-second load times across mobile devices.
> * **Backend**: Ultra-lightweight PHP 8.x Headless REST API hosted on **Whogohost** (cPanel Apache/LiteSpeed with MySQL).
> * **Data Bridge**: CORS-enabled REST endpoints connecting the Vercel client with Whogohost MySQL, with automatic offline / local storage fallback resilience.

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

### Step 2: Import the Database Schema
1. In cPanel, click **"phpMyAdmin"**.
2. Select your newly created database (`orchid_fimrash`) in the left sidebar.
3. Click the **"Import"** tab at the top.
4. Click **"Choose File"** and upload [`backend/schema.sql`](file:///c:/Users/DELL/Downloads/OrchidByte_Solutions/fimrash-logistics/backend/schema.sql).
5. Click **"Go"** at the bottom. The tables (`deliveries`, `landmarks`, `zones`, `riders`, `cod_ledger`) will be created.

### Step 3: Upload Backend Files to Whogohost
1. In cPanel, open **"File Manager"**.
2. Recommended Domain Structure:
   * **Subdomain Setup (Recommended)**: In cPanel > **Domains**, create a subdomain like `api.fimrash.com` pointing to `public_html/api`.
   * **Subdirectory Setup**: Or create a folder inside `public_html`, e.g., `public_html/backend`.
3. Upload the files from the `backend/` directory so the server contains:
   ```text
   backend_root/
   ├── config.php          <-- Created from config.example.php (stores DB credentials)
   ├── schema.sql
   ├── src/
   │   └── Database.php
   └── public/
       ├── .htaccess       <-- Apache mod_rewrite for REST routing
       └── index.php       <-- Main API gateway & CORS handler
   ```

### Step 4: Configure Database Credentials
In Whogohost File Manager, copy or rename `config.example.php` to `config.php` and edit it:
```php
<?php
return [
    'driver'   => 'mysql',
    'host'     => 'localhost',              // Whogohost MySQL host is localhost
    'port'     => '3306',
    'database' => 'orchid_fimrash',         // Your cPanel Database Name
    'username' => 'orchid_fimrash_user',    // Your cPanel Database Username
    'password' => 'YourStrongDbPassword',   // Your cPanel Database Password
];
```

### Step 5: Test the Whogohost API
Open your browser and navigate to the health endpoint:
```text
https://api.yourdomain.com/api/health
```
*(or `https://yourdomain.com/backend/public/api/health`)*

You will see:
```json
{
  "status": "healthy",
  "service": "Fimrash Logistics Services REST API",
  "version": "1.2.0-production",
  "coverage": "Kano Metropolitan Area, Nigeria"
}
```

---

## PART 3: Connecting Vercel Frontend to Whogohost Backend

1. In your **Vercel Dashboard**, go to **Settings** $\rightarrow$ **Environment Variables**.
2. Set or update:
   * **Key**: `VITE_API_BASE_URL`
   * **Value**: `https://api.yourdomain.com` *(no trailing slash, e.g. pointing to the `public/` directory where `index.php` lives)*
3. Go to **Deployments** $\rightarrow$ Click the three dots `...` on the latest deployment $\rightarrow$ Click **"Redeploy"**.
4. Open your Vercel URL. The navbar will display **`API CONNECTED`** with a green pulse dot!

---

## Resilience & Offline Fallback
Even if your Whogohost hosting experiences temporary downtime or server maintenance, the React frontend is engineered with an **automatic fallback to local storage / indexed mesh**:
* Customers can still fill booking forms and generate waybill passes.
* Couriers can still verify 4-digit OTPs and update transit states.
* Zero blank screens or crash errors.
