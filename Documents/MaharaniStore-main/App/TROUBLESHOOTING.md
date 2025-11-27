# Troubleshooting Order Creation Error

## Error: "Network request failed"

### Possible Causes:

1. **Backend Server Not Running**
   - Make sure backend is running on port 5001
   - Check: `cd backend && npm run dev`
   - Verify: Open `http://localhost:5001` in browser

2. **Wrong API URL**
   - **Android Emulator**: Use `http://10.0.2.2:5001/api`
   - **Android Physical Device**: Use your computer's IP (e.g., `http://192.168.1.100:5001/api`)
   - **iOS Simulator**: Use `http://localhost:5001/api`
   - **iOS Physical Device**: Use your computer's IP

3. **Network Configuration**
   - Check if device/emulator can reach your computer
   - For physical devices, ensure phone and computer are on same WiFi
   - Disable VPN if active
   - Check firewall settings

4. **Authentication Token Missing**
   - User must be logged in
   - Token stored in AsyncStorage
   - Check: Login flow completes successfully

### Quick Fixes:

1. **Check Backend Status:**
   ```bash
   cd backend
   npm run dev
   # Should see: "Server is running on port 5001"
   ```

2. **Test API Connection:**
   ```bash
   # From terminal
   curl http://localhost:5001/api/products
   ```

3. **Update API URL for Physical Device:**
   - Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Update `App/app/services/api.js`:
   ```javascript
   const BASE_URL = 'http://YOUR_IP:5001/api';
   ```

4. **Check Android Network Security:**
   - Add to `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <application
       android:usesCleartextTraffic="true"
       ...>
   ```

5. **Enable Network Debugging:**
   - Check React Native debugger console
   - Look for API call logs
   - Verify request URL and headers

### Testing Steps:

1. ✅ Backend running on port 5001
2. ✅ MongoDB connected
3. ✅ User logged in (has auth token)
4. ✅ Cart has items
5. ✅ Address selected
6. ✅ Network connectivity active
7. ✅ API URL correct for your device type

### Common Solutions:

**For Android Emulator:**
- Use `10.0.2.2` instead of `localhost`
- Already configured in code

**For Physical Devices:**
- Use computer's local IP address
- Both devices on same WiFi network
- Check firewall allows port 5001

**For iOS:**
- Simulator: `localhost` works
- Physical device: Need IP address
- Check Info.plist for network permissions

