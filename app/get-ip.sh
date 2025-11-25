#!/bin/bash

# Quick script to find your computer's local IP address
# Use this to update LOCAL_IP in app/src/config/api.ts

echo "🔍 Finding your local IP address..."
echo ""

# Try different methods
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

if [ -z "$IP" ]; then
    IP=$(ipconfig getifaddr en0 2>/dev/null)
fi

if [ -z "$IP" ]; then
    IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi

if [ -n "$IP" ]; then
    echo "✅ Your local IP address is: $IP"
    echo ""
    echo "Update this in: app/src/config/api.ts"
    echo "  export const LOCAL_IP = '$IP';"
else
    echo "❌ Could not find IP address automatically"
    echo "Please check your network settings manually"
fi

