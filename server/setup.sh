#!/bin/bash

# HeatGuide Backend Setup Script
# This script automates the backend setup process

set -e  # Exit on error

echo "🚀 HeatGuide Backend Setup"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Bun is not installed${NC}"
    echo "Install it with: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi
echo -e "${GREEN}✅ Bun is installed${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Install it with: brew install postgresql@14"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL is installed${NC}"

# Check if database exists, create if not
echo ""
echo -e "${YELLOW}📦 Setting up database...${NC}"
if psql -lqt | cut -d \| -f 1 | grep -qw heatguide; then
    echo -e "${GREEN}✅ Database 'heatguide' already exists${NC}"
else
    echo "Creating database 'heatguide'..."
    createdb heatguide || {
        echo -e "${YELLOW}⚠️  Could not create database. Trying with postgres user...${NC}"
        createdb -U postgres heatguide || {
            echo -e "${RED}❌ Failed to create database. Please create it manually:${NC}"
            echo "   createdb heatguide"
            exit 1
        }
    }
    echo -e "${GREEN}✅ Database created${NC}"
fi

# Install dependencies
echo ""
echo -e "${YELLOW}📥 Installing dependencies...${NC}"
bun install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Check for .env file
echo ""
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:@localhost:5432/heatguide
DB_HOST=localhost
DB_PORT=5432
DB_NAME=heatguide
DB_USER=postgres
DB_PASSWORD=
PORT=3000
NODE_ENV=development

# AWS S3 (for photo uploads - optional for MVP)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=heatguide-photos
AWS_REGION=us-east-1
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your database password if needed${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Run migrations
echo ""
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
MIGRATION_DIR="src/db/migrations"

# Try with default user first, then with postgres user
run_migration() {
    local file=$1
    if psql -d heatguide -f "$file" 2>/dev/null; then
        return 0
    elif psql -U postgres -d heatguide -f "$file" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

for migration in $(ls -1 $MIGRATION_DIR/*.sql | sort); do
    filename=$(basename "$migration")
    echo "  Running $filename..."
    if run_migration "$migration"; then
        echo -e "  ${GREEN}✅ $filename${NC}"
    else
        echo -e "  ${RED}❌ Failed to run $filename${NC}"
        echo "  Try running manually: psql -d heatguide -f $migration"
    fi
done

# Seed database
echo ""
echo -e "${YELLOW}🌱 Seeding database with Paris POIs...${NC}"
if bun run seed; then
    echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Seeding failed, but you can run it manually later: bun run seed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Backend setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit .env file if you need to add database password"
echo "  2. Start the server with: bun run dev"
echo ""

