# Expo Go Setup Guide - Connecting to Local Backend

This guide will help you configure HeatGuide to work with Expo Go on your physical device and connect to your local backend server.

## The Problem

When running Expo Go on a physical device, `localhost` refers to the device itself, not your computer. Your device needs to connect to your computer's IP address on your local network.

## Step-by-Step Setup

### Step 1: Find Your Computer's IP Address

**On macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Look for an IP address like:
- `192.168.1.100`
- `10.130.233.14`
- `172.20.10.2`

**Alternative method:**
```bash
ipconfig getifaddr en0
```

Or check System Preferences → Network → Wi-Fi → Advanced → TCP/IP

**On Windows:**
```bash
ipconfig
```

Look for "IPv4 Address" under your active network adapter.

**On Linux:**
```bash
hostname -I
```

### Step 2: Update API Configuration

1. Open `app/src/config/api.ts`
2. Find the line: `export const LOCAL_IP = '10.130.233.14';`
3. Replace `'10.130.233.14'` with your computer's IP address from Step 1

Example:
```typescript
export const LOCAL_IP = '192.168.1.100'; // Your computer's IP
```

### Step 3: Ensure Backend is Accessible

The backend server is already configured to listen on all network interfaces (`0.0.0.0`), so it should be accessible from your device.

**Verify backend is running:**
```bash
cd /Users/divyanshjhajhria/Desktop/HeatMap/server
bun run dev
```

You should see:
```
🚀 HeatGuide server running on port 3000
📍 Health check: http://localhost:3000/health
🌐 Server accessible from network devices
```

### Step 4: Test Connection from Your Device

**Option 1: Test with curl (if you have terminal access on device)**
```bash
curl http://YOUR_COMPUTER_IP:3000/health
```

**Option 2: Test in browser on your phone**
Open your phone's browser and navigate to:
```
http://YOUR_COMPUTER_IP:3000/health
```

You should see: `{"status":"ok","timestamp":"..."}`

### Step 5: Start Expo and Connect

1. **Start the backend server:**
   ```bash
   cd /Users/divyanshjhajhria/Desktop/HeatMap/server
   bun run dev
   ```

2. **Start Expo (in a new terminal):**
   ```bash
   cd /Users/divyanshjhajhria/Desktop/HeatMap/app
   bun start
   ```

3. **Connect with Expo Go:**
   - Open Expo Go app on your phone
   - Make sure your phone and computer are on the **same WiFi network**
   - Scan the QR code from the terminal
   - The app should load and connect to your backend

## Troubleshooting

### ❌ "Network request failed" or "Connection refused"

**Possible causes:**
1. **Wrong IP address** - Double-check your computer's IP and update `app/src/config/api.ts`
2. **Different WiFi networks** - Phone and computer must be on the same network
3. **Firewall blocking** - Your computer's firewall may be blocking port 3000

**Solutions:**
- Verify IP: Run `ifconfig` again to confirm your IP
- Check WiFi: Ensure both devices are on the same network
- Check firewall: Allow incoming connections on port 3000

**macOS Firewall:**
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Ensure "Block all incoming connections" is NOT checked
4. Or add an exception for Node/Bun

### ❌ "Cannot connect to backend"

**Test backend accessibility:**
```bash
# From your computer, test if backend is accessible
curl http://YOUR_COMPUTER_IP:3000/health

# If this fails, the backend might not be listening on 0.0.0.0
# Check server/src/index.ts - should have: app.listen(PORT, '0.0.0.0', ...)
```

### ❌ IP Address Changes

If your IP address changes (common with DHCP), you'll need to:
1. Find your new IP address
2. Update `app/src/config/api.ts`
3. Restart Expo (`bun start`)

**Tip:** Consider using a static IP address or a tool to automatically detect your IP.

### ✅ Quick IP Check Script

Create a helper script to quickly find your IP:

```bash
# Save this as get-ip.sh
#!/bin/bash
echo "Your local IP address:"
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
```

## Alternative: Using ngrok (For Testing)

If you can't get local network access working, you can use ngrok to create a tunnel:

1. **Install ngrok:**
   ```bash
   brew install ngrok
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Update API config:**
   Use the ngrok URL (e.g., `https://abc123.ngrok.io`) in your API config

**Note:** ngrok free tier has limitations. Local network is preferred for development.

## Configuration Files

- **API Config:** `app/src/config/api.ts` - Update `LOCAL_IP` here
- **Server Config:** `server/src/index.ts` - Already configured for network access

## Quick Reference

```typescript
// app/src/config/api.ts
export const LOCAL_IP = 'YOUR_COMPUTER_IP_HERE'; // ← Update this!
export const API_PORT = 3000;
```

**Find your IP:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Test connection:**
```bash
curl http://YOUR_COMPUTER_IP:3000/health
```

## Success Checklist

- [ ] Found your computer's IP address
- [ ] Updated `LOCAL_IP` in `app/src/config/api.ts`
- [ ] Backend server is running (`bun run dev`)
- [ ] Backend is accessible from network (tested with curl/browser)
- [ ] Phone and computer are on same WiFi network
- [ ] Expo Go app can connect and load the app
- [ ] API calls work (map loads, data appears)

Once all checked, you're good to go! 🎉

