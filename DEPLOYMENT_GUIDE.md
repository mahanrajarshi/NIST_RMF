# Deployment Guide: Vercel + Render + MongoDB Atlas

Complete step-by-step guide to deploy the NIST AI RMF Compliance Assessment Tool for free.

```
Architecture:
  Vercel (Frontend)  -->  Render (Backend)  -->  MongoDB Atlas (Database)
  React app               FastAPI app             Free M0 cluster
  Free tier               Free tier               Free forever
```

---

## PART 1: MongoDB Atlas (Database) — Do This First

You need the database URL before deploying the backend.

### Step 1.1 — Create an Atlas Account

1. Go to **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with email or Google (free, no credit card required)
3. Choose the **FREE M0 tier** when prompted

### Step 1.2 — Create a Free Cluster

1. Click **"Build a Database"**
2. Select **M0 FREE** tier
3. Choose a cloud provider & region (pick the one closest to you):
   - AWS → `us-east-1` (recommended)
   - Or GCP/Azure equivalent
4. Cluster name: `nist-ai-rmf` (or anything you like)
5. Click **"Create Deployment"**

### Step 1.3 — Create a Database User

1. Under **"Security Quickstart"**, choose **Username & Password**
2. Set:
   - Username: `nistadmin`
   - Password: Click **"Autogenerate Secure Password"** → **copy and save this password**
3. Click **"Create User"**

### Step 1.4 — Allow Network Access

1. Under **"Where would you like to connect from?"**, choose **"Cloud Environment"**
2. Click **"Add IP Address"** → Select **"Allow Access from Anywhere"** (sets `0.0.0.0/0`)
   - This is required so Render can connect to Atlas
3. Click **"Finish and Close"**

### Step 1.5 — Get Your Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Drivers"**
3. Copy the connection string. It looks like:
   ```
   mongodb+srv://nistadmin:<password>@nist-ai-rmf.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. **Replace `<password>`** with the password you saved in Step 1.3
5. **Add a database name** after `.net/`:
   ```
   mongodb+srv://nistadmin:YOUR_PASSWORD@nist-ai-rmf.xxxxx.mongodb.net/nist_ai_rmf?retryWrites=true&w=majority
   ```

Save this full connection string — you'll need it for the backend.

---

## PART 2: Download Your Code

### Step 2.1 — Get the Code from Emergent

1. In the Emergent workspace, click the **"Code"** button (top toolbar)
2. Download the ZIP file
3. Unzip it to a folder on your computer, e.g., `nist-ai-rmf-tool/`

### Step 2.2 — Push to GitHub

You need a GitHub repository for both Vercel and Render to connect to.

```bash
cd nist-ai-rmf-tool

# Initialize git
git init
git add .
git commit -m "NIST AI RMF Compliance Assessment Tool"

# Create a new repo on GitHub (https://github.com/new)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/nist-ai-rmf.git
git branch -M main
git push -u origin main
```

---

## PART 3: Render (Backend) — Deploy the FastAPI API

### Step 3.1 — Create a Render Account

1. Go to **https://render.com**
2. Sign up with GitHub (recommended — auto-connects your repos)

### Step 3.2 — Create a `render.yaml` or Use Manual Setup

**Manual setup is simpler for a first deploy:**

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Configure:

| Setting              | Value                                            |
|----------------------|--------------------------------------------------|
| **Name**             | `nist-ai-rmf-api`                                |
| **Region**           | Pick closest to your Atlas cluster (e.g., Oregon)|
| **Root Directory**   | `backend`                                        |
| **Runtime**          | `Python 3`                                       |
| **Build Command**    | `pip install -r requirements.txt`                |
| **Start Command**    | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| **Instance Type**    | **Free**                                         |

> **Important**: Render sets the `PORT` env var automatically. Use `$PORT` in the start command, NOT `8001`.

### Step 3.3 — Set Environment Variables

In the Render dashboard for your service, go to **"Environment"** tab and add:

| Key             | Value                                                                   |
|-----------------|-------------------------------------------------------------------------|
| `MONGO_URL`     | `mongodb+srv://nistadmin:YOUR_PASSWORD@nist-ai-rmf.xxxxx.mongodb.net/nist_ai_rmf?retryWrites=true&w=majority` |
| `DB_NAME`       | `nist_ai_rmf`                                                          |
| `CORS_ORIGINS`  | `*`                                                                     |
| `PYTHON_VERSION`| `3.11.0`                                                                |

> After deploy, you'll update `CORS_ORIGINS` to your actual Vercel domain for security.

### Step 3.4 — Clean Up requirements.txt Before Deploy

The current `requirements.txt` has some packages specific to the Emergent environment. Create a clean version for Render.

Open `backend/requirements.txt` in your local code and replace its contents with:

```txt
fastapi==0.110.1
uvicorn==0.25.0
python-dotenv>=1.0.1
pymongo==4.5.0
pydantic>=2.6.4
motor==3.3.1
python-multipart>=0.0.9
```

> This is the minimal set. The Emergent version has extras like `boto3`, `emergentintegrations`, `pandas`, etc. that aren't needed for this app.

Commit and push this change:
```bash
git add backend/requirements.txt
git commit -m "Clean requirements.txt for Render deployment"
git push
```

### Step 3.5 — Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy automatically
3. Wait for the build to complete (2-3 minutes)
4. You'll get a URL like: **`https://nist-ai-rmf-api.onrender.com`**

### Step 3.6 — Verify Backend

Test it in your browser or terminal:

```bash
curl https://nist-ai-rmf-api.onrender.com/api/

# Expected: {"message":"NIST AI RMF Assessment API"}

curl https://nist-ai-rmf-api.onrender.com/api/assessment/industries

# Expected: JSON with 7 industries
```

> **Note**: Render free tier spins down after 15 min of inactivity. First request after idle takes ~30-60 seconds to cold-start.

---

## PART 4: Vercel (Frontend) — Deploy the React App

### Step 4.1 — Create a Vercel Account

1. Go to **https://vercel.com**
2. Sign up with GitHub (recommended)

### Step 4.2 — Prepare Frontend for Vercel

Vercel needs a small config to handle client-side routing (React Router). Create a file `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/((?!api).*)", "destination": "/index.html" }
  ]
}
```

Also, the Emergent build uses `craco`. This works fine on Vercel, but make sure the build scripts in `frontend/package.json` are:

```json
"scripts": {
  "start": "craco start",
  "build": "craco build",
  "test": "craco test"
}
```

These are already correct — no change needed.

Commit and push:
```bash
# Create vercel.json in frontend directory
echo '{"rewrites":[{"source":"/((?!api).*)","destination":"/index.html"}]}' > frontend/vercel.json
git add frontend/vercel.json
git commit -m "Add Vercel rewrite config for React Router"
git push
```

### Step 4.3 — Import Project on Vercel

1. Go to **https://vercel.com/dashboard**
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repo
4. Configure:

| Setting                | Value                                                 |
|------------------------|-------------------------------------------------------|
| **Framework Preset**   | `Create React App`                                    |
| **Root Directory**     | Click **"Edit"** → type `frontend`                    |
| **Build Command**      | `craco build` (auto-detected, or set manually)        |
| **Output Directory**   | `build` (auto-detected)                               |

### Step 4.4 — Set Environment Variables

In the Vercel project settings, add this environment variable:

| Key                        | Value                                          |
|----------------------------|-------------------------------------------------|
| `REACT_APP_BACKEND_URL`   | `https://nist-ai-rmf-api.onrender.com`          |

> Replace with your actual Render URL from Part 3, Step 3.5. **No trailing slash.**

### Step 4.5 — Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy (1-2 minutes)
3. You'll get a URL like: **`https://nist-ai-rmf.vercel.app`**

---

## PART 5: Post-Deployment Configuration

### Step 5.1 — Update CORS on Render

Now that you have your Vercel URL, update the CORS setting on Render for security:

1. Go to Render dashboard → your `nist-ai-rmf-api` service
2. Go to **"Environment"** tab
3. Change `CORS_ORIGINS` from `*` to your Vercel domain:
   ```
   https://nist-ai-rmf.vercel.app
   ```
4. Click **"Save Changes"** → Render will auto-redeploy

### Step 5.2 — Verify Full Flow

1. Open your Vercel URL in a browser
2. Select an industry (e.g., Healthcare)
3. Click **Start Assessment**
4. Answer a few questions
5. Submit and verify the results page loads with radar chart

### Step 5.3 — Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → **Domains**
2. Add your custom domain (e.g., `nist-audit.yourdomain.com`)
3. Follow DNS instructions (add CNAME record)

**Render:**
1. Go to Service Settings → **Custom Domains**
2. Add your API domain (e.g., `api.nist-audit.yourdomain.com`)
3. Update `REACT_APP_BACKEND_URL` on Vercel to match

---

## Summary: All URLs & Environment Variables

### MongoDB Atlas
```
Connection String: mongodb+srv://nistadmin:PASSWORD@cluster.mongodb.net/nist_ai_rmf?retryWrites=true&w=majority
```

### Render (Backend)
| Variable         | Value                                                  |
|------------------|--------------------------------------------------------|
| `MONGO_URL`      | Your Atlas connection string (from Part 1)             |
| `DB_NAME`        | `nist_ai_rmf`                                          |
| `CORS_ORIGINS`   | Your Vercel URL (e.g., `https://nist-ai-rmf.vercel.app`) |
| `PYTHON_VERSION` | `3.11.0`                                               |

### Vercel (Frontend)
| Variable                   | Value                                              |
|----------------------------|----------------------------------------------------|
| `REACT_APP_BACKEND_URL`   | Your Render URL (e.g., `https://nist-ai-rmf-api.onrender.com`) |

---

## Troubleshooting

| Problem                                  | Fix                                                                |
|------------------------------------------|--------------------------------------------------------------------|
| Render build fails on `emergentintegrations` | Remove it from `requirements.txt` (Emergent-only package)       |
| Vercel build fails on `craco`            | Ensure root directory is set to `frontend`                        |
| CORS errors in browser console           | Check `CORS_ORIGINS` on Render matches your Vercel domain exactly |
| "Application Error" on Render            | Check Render logs → likely `MONGO_URL` is wrong or Atlas IP not whitelisted |
| Frontend loads but no data               | Verify `REACT_APP_BACKEND_URL` on Vercel is correct (no trailing `/`) |
| Render cold start is slow (~30s)         | Normal for free tier. Consider paid tier ($7/mo) for always-on    |
| Atlas connection timeout                 | Ensure "Allow Access from Anywhere" (0.0.0.0/0) is set in Atlas Network Access |
| React Router 404 on refresh              | Ensure `vercel.json` with rewrites exists in `frontend/`          |
| Build fails with path alias `@/`         | `craco.config.js` handles this — make sure it's included in repo  |

---

## Free Tier Limits

| Service        | Limit                                          |
|----------------|------------------------------------------------|
| **Vercel**     | 100 GB bandwidth/mo, unlimited deploys         |
| **Render**     | 750 hours/mo, spins down after 15 min idle     |
| **Atlas M0**   | 512 MB storage, shared RAM, no backups         |

These limits are more than enough for sharing and demo purposes. For production use with heavy traffic, consider upgrading Render to the Starter plan ($7/mo) to avoid cold starts.

---

## Quick Checklist

- [ ] MongoDB Atlas: Free cluster created, user created, 0.0.0.0/0 whitelisted, connection string saved
- [ ] GitHub: Code pushed to repo with clean `requirements.txt` and `vercel.json`
- [ ] Render: Web service created, env vars set, deploy successful, `/api/` responds
- [ ] Vercel: Project imported, `REACT_APP_BACKEND_URL` set, deploy successful, app loads
- [ ] CORS: Updated on Render to your Vercel domain
- [ ] Full flow: Industry selection → Assessment → Submit → Results with radar chart works
