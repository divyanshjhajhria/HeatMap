#!/bin/bash

# Run all database migrations in order

set -e

MIGRATION_DIR="src/db/migrations"
DB_NAME="heatguide"

echo "🗄️  Running database migrations for $DB_NAME"
echo ""

# Try with default user first, fallback to postgres user
run_migration() {
    local file=$1
    if psql -d "$DB_NAME" -f "$file" 2>/dev/null; then
        return 0
    elif psql -U postgres -d "$DB_NAME" -f "$file" 2>/dev/null; then
        return 0
    else
        echo "Failed to run $file"
        return 1
    fi
}

for migration in $(ls -1 $MIGRATION_DIR/*.sql | sort); do
    filename=$(basename "$migration")
    echo "Running $filename..."
    if run_migration "$migration"; then
        echo "✅ $filename completed"
    else
        echo "❌ $filename failed"
        exit 1
    fi
done

echo ""
echo "✅ All migrations completed successfully!"

