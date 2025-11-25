# Quick Start - Backend Setup

## Automated Setup (Easiest)

Just run the setup script:

```bash
cd /Users/divyanshjhajhria/Desktop/HeatMap/server
./setup.sh
```

This script will:
- ✅ Check if Bun and PostgreSQL are installed
- ✅ Create the database
- ✅ Install dependencies
- ✅ Create .env file
- ✅ Run all migrations
- ✅ Seed the database

## Manual Setup

If the automated script doesn't work, follow these steps:

### 1. Install Dependencies
```bash
bun install
```

### 2. Create Database
```bash
./create-db.sh
# or manually: createdb heatguide
```

### 3. Create .env File
Copy `env.example` to `.env`:
```bash
cp env.example .env
```

Edit `.env` and add your database password if needed.

### 4. Run Migrations
```bash
./run-migrations.sh
# or manually run each migration file
```

### 5. Seed Database
```bash
bun run seed
```

### 6. Start Server
```bash
bun run dev
```

The server will run on `http://localhost:3000`

## Verify Setup

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

You should see: `{"status":"ok","timestamp":"..."}`

## Troubleshooting

**Database connection errors:**
- Make sure PostgreSQL is running: `brew services list`
- Check your `.env` file has correct credentials
- Try: `psql -U postgres -d heatguide` to test connection

**Permission errors:**
- Try running migrations with: `psql -U postgres -d heatguide -f src/db/migrations/001_create_cities_table.sql`

