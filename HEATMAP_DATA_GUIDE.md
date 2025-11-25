# Heatmap Data Guide

## Overview

The HeatGuide heatmap now uses **real visit data** to show footfall and popularity zones. Red spots indicate high footfall areas, while green/yellow areas show lower activity.

## How It Works

### Data Source
- The heatmap aggregates actual check-ins (visits) from users
- Each visit is mapped to an H3 hexagonal grid cell
- Popularity scores (0-100) are calculated based on visit density
- Scores are normalized across all cells for consistent visualization

### Color Coding
- **Red (70-100)**: High footfall - Popular tourist spots, busy areas
- **Orange (40-69)**: Medium footfall - Moderate activity
- **Green (0-39)**: Low footfall - Less visited areas

### Date Filtering
- View footfall for a specific day using the date filter
- Default shows all-time aggregated data
- Use `?date=YYYY-MM-DD` query parameter to filter by date

## Setting Up Sample Data

### 1. Seed Places (if not done)
```bash
cd server
bun run seed
```

### 2. Generate Sample Visits
```bash
cd server
bun run seed:visits
```

This creates realistic visit data:
- **Popular places** (Eiffel Tower, Louvre, etc.): 20-50 visits per day
- **Regular places**: 5-15 visits per day
- **Last 7 days** of data
- Visits distributed throughout the day (9 AM - 9 PM)

### 3. View the Heatmap
- Start the backend: `bun run dev`
- Start the app: `bun start`
- The heatmap will show red zones around popular places

## API Endpoints

### Get Heatmap
```
GET /api/cities/:cityId/heatmap
GET /api/cities/:cityId/heatmap?date=2024-01-15
GET /api/cities/:cityId/heatmap?useMock=true
```

**Response:**
```json
{
  "cityId": 1,
  "cells": [
    {
      "h3Index": "891f0a123456789",
      "score": 85,
      "lat": 48.8584,
      "lng": 2.2945,
      "visitCount": 42
    }
  ],
  "count": 150,
  "dateFilter": "2024-01-15",
  "dataSource": "real",
  "totalVisits": 1250
}
```

## How Scores Are Calculated

1. **Visit Aggregation**: All visits are grouped by H3 cell
2. **Count Calculation**: Each cell gets a visit count
3. **Normalization**: Scores are normalized (0-100) based on max visits
4. **Logarithmic Scaling**: Uses logarithmic scale for better distribution

## Real-Time Updates

As users check in at places:
- New visits are immediately recorded
- Heatmap reflects current footfall
- Popular areas become redder as more people visit
- Less visited areas remain green/yellow

## Testing

### Test with Mock Data
```bash
GET /api/cities/1/heatmap?useMock=true
```

### Test with Real Data
```bash
# After seeding visits
GET /api/cities/1/heatmap

# Filter by today
GET /api/cities/1/heatmap?date=2024-01-15
```

## Frontend Features

- **Date Toggle**: Switch between "all time" and "today" views
- **Visit Count Display**: Shows total visits in the selected period
- **Color Legend**: Explains what each color means
- **Real-time Updates**: Reload to see latest footfall data

## Future Enhancements

- Real-time WebSocket updates
- Time-based filtering (hourly, weekly patterns)
- Historical trends
- Predictive heatmap based on time of day/day of week
- Integration with external footfall data sources

