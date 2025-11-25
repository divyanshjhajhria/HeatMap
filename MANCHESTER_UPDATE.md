# University of Manchester Update Summary

## 🎓 Major Changes

### 1. **Authentication System**
- ✅ Login and Signup screens with Prime Video-inspired design
- ✅ Email validation for @student.manchester.ac.uk domain only
- ✅ JWT token-based authentication
- ✅ Secure password hashing with bcrypt
- ✅ User context for app-wide authentication state

### 2. **UI Redesign - Prime Video Style**
- ✅ Sophisticated, professional design (less childish)
- ✅ Dark theme support with system preference detection
- ✅ Prime Video blue (#00A8E1) as primary color
- ✅ Clean, modern card-based layouts
- ✅ Improved typography and spacing
- ✅ Subtle shadows and elevations

### 3. **Reel Feed**
- ✅ Instagram/TikTok style vertical scrolling feed
- ✅ Full-screen photo viewing
- ✅ Smooth pagination
- ✅ Caption and tag display
- ✅ Auto-play current reel

### 4. **Manchester Data**
- ✅ Replaced Paris with Manchester/University of Manchester
- ✅ 20 Manchester-specific locations:
  - University of Manchester Main Campus
  - Alan Gilbert Learning Commons
  - John Rylands Library
  - Manchester Museum
  - Whitworth Art Gallery
  - Students Union
  - And more...
- ✅ Updated coordinates to Manchester (53.4808, -2.2426)

### 5. **Branding**
- ✅ Changed app name to "UoM Guide"
- ✅ University of Manchester branding
- ✅ Student-focused messaging

## 📋 Setup Instructions

### 1. Run Database Migrations
```bash
cd server
psql -d heatguide -f src/db/migrations/009_create_users_table.sql
psql -d heatguide -f src/db/migrations/010_update_cities_manchester.sql
```

### 2. Install New Dependencies
```bash
# Backend
cd server
bun install

# Frontend
cd app
bun install
```

### 3. Update Environment Variables
Add to `server/.env`:
```
JWT_SECRET=your-secret-key-here-change-in-production
```

### 4. Start the App
```bash
# Terminal 1 - Backend
cd server
bun run dev

# Terminal 2 - Frontend
cd app
bun start
```

## 🎨 Theme System

The app now supports:
- **Light Theme**: Clean white background with dark text
- **Dark Theme**: Deep black (#0A0A0A) with white text
- **Auto-detection**: Follows system preference
- **Manual Toggle**: Can be added to settings

## 🔐 Authentication Flow

1. **First Launch**: Shows Login screen
2. **Signup**: Must use @student.manchester.ac.uk email
3. **Login**: Validates credentials and stores JWT token
4. **Protected Routes**: All main features require authentication
5. **Token Storage**: Uses AsyncStorage for persistence

## 📍 Manchester Locations

All locations are now Manchester-specific:
- University buildings and facilities
- Libraries (John Rylands, Central Library)
- Museums and galleries
- Popular neighborhoods (Northern Quarter, Gay Village, etc.)
- Student areas (Fallowfield, Owens Park)

## 🎬 Reel Feed Features

- Vertical scrolling (like Instagram Reels)
- Full-screen photo display
- Caption and tags overlay
- Smooth transitions between reels
- Auto-focus on current reel

## 🎯 Next Steps

1. Test authentication flow
2. Verify Manchester locations appear on map
3. Test dark theme toggle
4. Upload photos and test reel feed
5. Test proximity chat in Manchester locations

## 📝 Notes

- Email validation is strict: only @student.manchester.ac.uk allowed
- Dark theme automatically follows system preference
- All UI components now use theme colors
- Reel feed shows public photos from visited places
- Map now centers on University of Manchester campus

