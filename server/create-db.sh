#!/bin/bash

# Create the heatguide database

DB_NAME="heatguide"

echo "Creating database '$DB_NAME'..."

if createdb "$DB_NAME" 2>/dev/null; then
    echo "✅ Database '$DB_NAME' created successfully"
elif createdb -U postgres "$DB_NAME" 2>/dev/null; then
    echo "✅ Database '$DB_NAME' created successfully (as postgres user)"
else
    echo "❌ Failed to create database"
    echo ""
    echo "Try manually:"
    echo "  createdb $DB_NAME"
    echo "  or"
    echo "  createdb -U postgres $DB_NAME"
    exit 1
fi

