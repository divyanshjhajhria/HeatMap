# Complete Setup Guide for HeatGuide

This guide will walk you through setting up HeatGuide from scratch, step by step.

## 🚀 Quick Setup (Automated)

**Want to skip the manual steps?** We have an automated setup script!

```bash
cd /Users/divyanshjhajhria/Desktop/HeatMap/server
./setup.sh
```

This will automatically:
- Check prerequisites
- Create the database
- Install dependencies
- Set up .env file
- Run all migrations
- Seed the database

Then just start the server: `bun run dev`

**If the automated script doesn't work, follow the manual steps below.**

## Step 1: Install Prerequisites

### 1.1 Install Bun

Bun is a fast JavaScript runtime. Install it:

**On macOS:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Or using Homebrew:**
```bash
brew install bun
```

**Verify installation:**
```bash
bun --version
```
You should see a version number like `1.3.2` or higher.

### 1.2 Install PostgreSQL

PostgreSQL is the database we'll use. Install it:

**On macOS using Homebrew:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Or download from:** https://www.postgresql.org/download/macosx/

**Verify installation:**
```bash
psql --version
```

**Create a PostgreSQL user (if needed):**
```bash
createuser -s postgres
```

**Set a password for the postgres user (optional but recommended):**
```bash
psql postgres
```
Then in the PostgreSQL prompt:
```sql
ALTER USER postgres WITH PASSWORD 'your_password_here';
\q
```

### 1.3 Install Expo CLI (for mobile development)

```bash
bun add -g expo-cli
```

Or if that doesn't work:
```bash
npm install -g expo-cli
```

---

## Step 2: Set Up the Database

### 2.1 Create the Database

Open Terminal and run:
```bash
createdb heatguide
```

If you get a permission error, try:
```bash
createdb -U postgres heatguide
```

### 2.2 Verify Database Creation

```bash
psql heatguide
```

You should see a prompt like `heatguide=#`. Type `\q` to exit.

---

## Step 3: Set Up the Backend

### 3.1 Navigate to Server Directory

Open Terminal and navigate to the server folder:
```bash
cd /Users/divyanshjhajhria/Desktop/HeatMap/server
```

### 3.2 Install Backend Dependencies

```bash
bun install
```

This will install all the required packages. Wait for it to complete.

### 3.3 Create Environment File

Create a file named `.env` in the `server` directory:

```bash
touch .env
```

Open the `.env` file in a text editor and add:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/heatguide
DB_HOST=localhost
DB_PORT=5432
DB_NAME=heatguide
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
NODE_ENV=development
```

**Important:** Replace `your_password` with the actual password you set for the postgres user (or leave it empty if you didn't set one).

### 3.4 Run Database Migrations

Migrations create the database tables. Run them in order:

```bash
# Make sure you're in the server directory
cd /Users/divyanshjhajhria/Desktop/HeatMap/server

# Run each migration file
psql -d heatguide -f src/db/migrations/001_create_cities_table.sql
psql -d heatguide -f src/db/migrations/002_create_places_table.sql
psql -d heatguide -f src/db/migrations/003_create_visits_table.sql
psql -d heatguide -f src/db/migrations/004_create_achievements_table.sql
psql -d heatguide -f src/db/migrations/005_create_photos_table.sql
psql -d heatguide -f src/db/migrations/006_enable_postgis.sql
```

**If you get permission errors**, add `-U postgres`:
```bash
psql -U postgres -d heatguide -f src/db/migrations/001_create_cities_table.sql
# ... and so on for each file
```

### 3.5 Seed the Database (Add Paris POIs)

This adds sample places in Paris to the database:

```bash
bun run seed
```

You should see: `✅ Seeded 20 Paris POIs successfully!`

### 3.6 Verify Database Setup

Check that everything was created correctly:

```bash
psql heatguide
```

Then in the PostgreSQL prompt, run:
```sql
-- Check cities
SELECT * FROM cities;

-- Check places
SELECT COUNT(*) FROM places;

-- Check achievements
SELECT * FROM achievements;

-- Exit
\q
```

You should see:
- 1 city (Paris)
- 20 places
- 4 achievements

---

## Step 4: Start the Backend Server

### 4.1 Start the Server

Make sure you're in the server directory:
```bash
cd /Users/divyanshjhajhria/Desktop/HeatMap/server
```

Start the development server:
```bash
bun run dev
```

You should see:
```
🚀 HeatGuide server running on port 3000
📍 Health check: http://localhost:3000/health
```

**Keep this terminal window open!** The server needs to keep running.

### 4.2 Test the Backend

Open a new terminal window (keep the server running) and test:

```bash
curl http://localhost:3000/health
```

You should get: `{"status":"ok","timestamp":"..."}`

Test the heatmap endpoint:
```bash
curl http://localhost:3000/api/cities/1/heatmap
```

You should see JSON data with heatmap cells.

---

## Step 5: Set Up the Frontend

### 5.1 Open a New Terminal Window

**Important:** Keep the backend server running in the first terminal. Open a **new terminal window/tab** for the frontend.

### 5.2 Navigate to App Directory

```bash
cd /Users/divyanshjhajhria/Desktop/HeatMap/app
```

### 5.3 Install Frontend Dependencies

```bash
bun install
```

Wait for it to complete. This may take a few minutes.

### 5.4 Update API URL (if needed)

The frontend is already configured to connect to `http://localhost:3000/api` in development mode. If your backend is running on a different port or host, edit:

```bash
# Open the file in a text editor
open src/services/api.ts
```

Look for this line and update if needed:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';
```

### 5.5 Start the Expo Development Server

```bash
bun start
```

You should see a QR code and options like:
```
› Metro waiting on exp://...
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
```

---

## Step 6: Run the App

You have three options to run the app:

### Option 1: iOS Simulator (Mac only)

1. Make sure you have Xcode installed (from App Store)
2. In the Expo terminal, press `i`
3. Wait for the iOS simulator to open and load the app

### Option 2: Android Emulator

1. Install Android Studio and set up an emulator
2. In the Expo terminal, press `a`
3. Wait for the Android emulator to open

### Option 3: Physical Device (Easiest for testing)

**For iOS:**
1. Install "Expo Go" app from the App Store on your iPhone
2. Make sure your phone and computer are on the same WiFi network
3. Open the Camera app on your iPhone
4. Scan the QR code shown in the terminal
5. The app will open in Expo Go

**For Android:**
1. Install "Expo Go" app from Google Play Store on your Android phone
2. Make sure your phone and computer are on the same WiFi network
3. Open the Expo Go app
4. Tap "Scan QR code" and scan the QR code from the terminal
5. The app will load

---

## Step 7: Verify Everything Works

### 7.1 Check the Home Screen

- You should see a map centered on Paris
- The map should show colored markers (red/orange/green) representing the heatmap
- You should see a blue dot for your location (if location permissions are granted)

### 7.2 Test Navigation

- Tap the "Achievements" button at the bottom
- You should see the Achievements screen (may be empty if you haven't checked in yet)

### 7.3 Test API Connection

If the map loads with heatmap data, the API connection is working!

---

## Troubleshooting

### Backend won't start

**Error: "Cannot connect to database"**
- Check that PostgreSQL is running: `brew services list`
- Verify your `.env` file has correct database credentials
- Test connection: `psql -U postgres -d heatguide`

**Error: "Port 3000 already in use"**
- Change the PORT in `.env` to something else (e.g., 3001)
- Or kill the process using port 3000: `lsof -ti:3000 | xargs kill`

### Frontend won't start

**Error: "Cannot find module"**
- Delete `node_modules` and `bun.lockb`: `rm -rf node_modules bun.lockb`
- Reinstall: `bun install`

**App can't connect to backend**
- Make sure backend is running on port 3000
- Check that both are on the same network
- For physical device: Make sure your computer's firewall allows connections

### Database errors

**"relation does not exist"**
- Run the migrations again (Step 3.4)
- Check that you ran them in order

**"extension postgis does not exist"**
- Install PostGIS: `brew install postgis`
- Or run: `psql -d heatguide -c "CREATE EXTENSION IF NOT EXISTS postgis;"`

---

## Quick Reference: Running the App

**Every time you want to start the app:**

1. **Terminal 1 - Backend:**
   ```bash
   cd /Users/divyanshjhajhria/Desktop/HeatMap/server
   bun run dev
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd /Users/divyanshjhajhria/Desktop/HeatMap/app
   bun start
   ```

3. **Then:**
   - Press `i` for iOS simulator, or
   - Press `a` for Android emulator, or
   - Scan QR code with Expo Go on your phone

---

## Next Steps

Once everything is running:

1. **Explore the map** - See the heatmap overlay on Paris
2. **Check in at places** - Navigate to a place detail screen and tap "Check In"
3. **Earn achievements** - Visit 5 different places to unlock "Hotspot Explorer"
4. **View achievements** - Tap the Achievements button to see your progress

---

## Need Help?

If you encounter any issues:
1. Check the error messages carefully
2. Verify all prerequisites are installed
3. Make sure the database is set up correctly
4. Ensure both servers are running
5. Check that your `.env` file has correct credentials

Good luck! 🚀

