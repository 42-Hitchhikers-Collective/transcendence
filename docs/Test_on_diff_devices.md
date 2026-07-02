## How to Access the Local Development Environment from Other Devices (Mobile, Tablet, other computers, etc..)

This document explains how to connect other devices to our local Docker/Nginx/Vite setup (https://localhost:8443).
## 🛠️ Step 1: Find Your Laptop's Local IP Address
Your phone and laptop must be on the same Wi-Fi network.
Open your terminal and run the command matching your operating system:
## 🍏 MacBook (macOS)
Run this command to get your local IP:
```
ipconfig getifaddr en0
```

(If it returns blank, your Wi-Fi interface might be different. Try: ``` networksetup -getinfo Wi-Fi | grep "IP address:")```

## 🐧 Linux (Ubuntu, Fedora, Debian, etc.)
Run this command to find your active local IP:
```
hostname -I | awk '{print $1}'
```

(Alternative if hostname is missing: ip route get 1.1.1.1 | awk '{print $7}')

## 📱 Step 2: Open the URL on Your Phone
Open Safari, Chrome, or any other browser and type the URL using your laptop's IP address and the :8443 port.

⚠️ Important: You must manually type the https:// prefix.
```
Example URL: https://192.168.1.45:8443
```

## 🔒 Step 3: Bypass the SSL / Security Warning
Because we use a self-signed certificate (dev.crt) for local development, your phone will show a scary "Your connection is not private" or "Insecure Connection" warning. This is expected.

* iOS (Safari): Tap Show Details at the bottom → Tap "visit this website" → Confirm with your FaceID, TouchID, or Passcode.
* Android (Chrome): Tap Advanced → Tap "Proceed to [Your IP Address] (unsafe)".

## ⚙️ Troubleshooting & Notes

* Page loads but APIs or WebSockets fail? Ensure your frontend code does not hardcode localhost for API requests. It should use relative paths (e.g., /api/ or /socket.io/) so requests route through your phone's connection.
* Connection Timed Out? Double-check that your phone didn't automatically switch off Wi-Fi to cellular data, and verify your laptop's firewall isn't blocking incoming traffic on port 8443.


