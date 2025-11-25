# HeatGuide

A city-tourism heatmap and travel diary mobile application built with React Native (Expo) and Node.js.

## Features

- **Heatmap System**: Visualize popular areas in cities using H3 hexagonal grid cells
- **Places Discovery**: Browse points of interest (POIs) in cities
- **Visit Tracking**: Check in when physically near a place
- **Achievements**: Unlock achievements by exploring and visiting places
- **Path Finding**: Get most-taken paths between locations (mock implementation)
- **Location-Gated Feed**: View photos and posts from places you've visited

## Tech Stack

### Frontend
- React Native (Expo)
- TypeScript
- React Navigation
- React Native Maps
- Expo Location

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with PostGIS
- H3-js for geospatial indexing

## Project Structure

```
HeatMap/
├── app/                    # React Native frontend
│   ├── src/
│   │   ├── screens/       # App screens
│   │   ├── services/       # API services
│   │   └── types/         # TypeScript types
│   ├── App.tsx            # Main app entry
│   └── package.json
│
└── server/                 # Node.js backend
    ├── src/
    │   ├── routes/        # API routes
    │   ├── db/            # Database files
    │   │   ├── migrations/ # SQL migrations
    │   │   └── seed.ts    # Seed data
    │   ├── utils/         # Utility functions
    │   ├── types/         # TypeScript interfaces
    │   └── index.ts       # Server entry
    └── package.json
```

## Setup Instructions

### Prerequisites

- Bun (v1.0 or higher)
- PostgreSQL (v12 or higher) with PostGIS extension
- Expo CLI (for mobile development)

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/heatguide
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=heatguide
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3000
   NODE_ENV=development
   ```

4. **Create PostgreSQL database:**
   ```bash
   createdb heatguide
   ```

5. **Enable PostGIS extension:**
   ```bash
   psql -d heatguide -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   ```

6. **Run database migrations:**
   ```bash
   # Run migrations manually or use a migration tool
   psql -d heatguide -f src/db/migrations/001_create_cities_table.sql
   psql -d heatguide -f src/db/migrations/002_create_places_table.sql
   psql -d heatguide -f src/db/migrations/003_create_visits_table.sql
   psql -d heatguide -f src/db/migrations/004_create_achievements_table.sql
   psql -d heatguide -f src/db/migrations/005_create_photos_table.sql
   psql -d heatguide -f src/db/migrations/006_enable_postgis.sql
   ```

7. **Seed the database with Paris POIs:**
   ```bash
   bun run seed
   ```

8. **Start the development server:**
   ```bash
   bun run dev
   ```

   The server will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to app directory:**
   ```bash
   cd app
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Update API URL (if needed):**
   Edit `app/src/services/api.ts` and update the `API_BASE_URL` if your backend is running on a different host/port.

4. **Start Expo development server:**
   ```bash
   bun start
   ```

5. **Run on device/emulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

## API Endpoints

### Heatmap
- `GET /api/cities/:cityId/heatmap` - Get heatmap data for a city

### Places
- `GET /api/places/:id` - Get place details
- `GET /api/places/:id/path?fromLat=&fromLng=` - Get path to place
- `GET /api/places/:id/feed` - Get feed for a place

### Visits
- `POST /api/visits` - Check in at a place
  ```json
  {
    "userId": 1,
    "placeId": 1,
    "userLat": 48.8566,
    "userLng": 2.3522
  }
  ```

### Achievements
- `GET /api/users/:id/achievements` - Get user achievements

### Photos
- `POST /api/photos` - Upload a photo
  ```json
  {
    "userId": 1,
    "placeId": 1,
    "s3Path": "s3://bucket/path/to/photo.jpg"
  }
  ```

## Database Schema

### Tables
- `cities` - City information
- `places` - Points of interest
- `visits` - User check-ins
- `achievements` - Available achievements
- `user_achievements` - User achievement unlocks
- `photos` - User-uploaded photos

## Development Notes

- The heatmap uses H3 hexagonal grid cells for efficient geospatial indexing
- Check-ins require users to be within 100 meters of a place
- Achievements are automatically unlocked when conditions are met
- Path finding is currently mocked - in production, integrate with a routing service like Mapbox Directions API
- Photo uploads are mocked - in production, implement S3 upload handling

## Future Enhancements

- Real-time heatmap updates based on actual visit data
- Integration with Mapbox Directions API for real routing
- S3 photo upload implementation
- User authentication and profiles
- Social features (follow users, share visits)
- Offline map caching
- Push notifications for nearby places

## License

ISC

# HeatMap
