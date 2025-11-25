# Database Migrations

This directory contains SQL migration files for setting up the HeatGuide database schema.

## Migration Order

Run migrations in the following order:

1. `001_create_cities_table.sql` - Creates cities table
2. `002_create_places_table.sql` - Creates places table (depends on cities)
3. `003_create_visits_table.sql` - Creates visits table (depends on places)
4. `004_create_achievements_table.sql` - Creates achievements and user_achievements tables
5. `005_create_photos_table.sql` - Creates photos table (depends on places)
6. `006_enable_postgis.sql` - Enables PostGIS extension for spatial queries

## Running Migrations

You can run migrations manually using psql:

```bash
psql -d heatguide -f src/db/migrations/001_create_cities_table.sql
psql -d heatguide -f src/db/migrations/002_create_places_table.sql
# ... and so on
```

Or use a migration tool like `node-pg-migrate` if configured.

