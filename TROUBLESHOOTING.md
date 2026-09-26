# 🔧 Troubleshooting Guide

Common issues and how to fix them!

## 🚫 App Won't Start

### Error: "Cannot find module"
**Problem**: Dependencies not installed

**Solution**:
```bash
npm install
```

### Error: "Port 3000 already in use"
**Problem**: Another app is using port 3000

**Solution 1** - Kill the process:
```bash
# Windows
netstat -ano | findstr :5180
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:5180 | xargs kill -9
```

**Solution 2** - Use different port:
Edit `vite.config.js`:
```javascript
server: {
  host: true,
  port: 3001  // Changed from 3000
}
```

### Error: "VITE_... is not defined"
**Problem**: Environment variables not loaded

**Solution**:
1. Make sure `.env` file exists
2. Check that variables start with `VITE_`
3. Restart the dev server
4. Clear browser cache

---

## 📱 Can't Access on Phone

### Can't connect to http://192.168.1.241:5180
**Solutions**:

1. **Check WiFi**: Make sure phone and computer are on same network

2. **Find correct IP**:
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address"
   
   # Mac
   ifconfig
   # Look for "inet" under your WiFi adapter
   ```

3. **Check Firewall**:
   - Windows: Allow Vite through firewall
   - Mac: System Preferences → Security → Firewall → Allow Vite

4. **Use localhost alternative**:
   Try accessing with computer name:
   ```
   http://YOUR_COMPUTER_NAME.local:5180
   ```

### "Add to Home Screen" not showing
**Problem**: Only works in Safari

**Solution**:
- Must use Safari browser (not Chrome/Firefox)
- Must be served over HTTPS (or localhost)
- Make sure manifest.json is valid

---

## 🔄 Real-Time Sync Not Working

### Events not syncing between devices

**Check 1**: Is Supabase configured?
```javascript
// .env file should have:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Check 2**: Is real-time enabled?
1. Supabase Dashboard → Database → Replication
2. Find "events" table
3. Make sure it's toggled ON

**Check 3**: Check browser console
- Press F12 in browser
- Look for errors
- Common: "Failed to connect to realtime"

**Check 4**: Internet connection
- Both devices need internet
- Check Supabase dashboard is accessible

### Getting "Invalid API key" error

**Solutions**:
1. Double-check your `.env` file
2. Make sure you copied the **anon/public** key (not service_role)
3. No extra spaces in the key
4. Restart dev server after changing .env

---

## 💾 Data Issues

### Events disappearing
**If using localStorage** (no Supabase):
- Check browser console for errors
- Try different browser
- Check browser storage: DevTools → Application → Local Storage

**If using Supabase**:
- Check Supabase Dashboard → Table Editor
- Make sure RLS policies allow viewing
- Check for deletion errors in console

### Can't save events
**Check 1**: Console errors
- F12 → Console tab
- Look for red errors

**Check 2**: Supabase connection
```javascript
// Test in browser console:
import { supabase } from './src/lib/supabase.js'
const { data, error } = await supabase.from('events').select('*')
console.log(data, error)
```

**Check 3**: Database setup
- Make sure you ran `supabase-setup.sql`
- Check table exists in Supabase Dashboard

### Age calculator showing wrong age
**Problem**: Birthdate is incorrect

**Solution**:
Edit `src/utils/dateUtils.js`:
```javascript
export const BIRTHDATE = new Date('2026-09-09T13:35:00')
// Make sure format is: YYYY-MM-DDTHH:MM:SS
```

---

## 🎨 Display Issues

### Hebrew text showing backwards or weird
**Solution**: Make sure RTL is set

Check `index.html`:
```html
<html lang="he" dir="rtl">
```

### Colors not showing correctly
**Check 1**: Tailwind not compiled
```bash
# Restart dev server
npm run dev
```

**Check 2**: Check `tailwind.config.js` is valid
- No syntax errors
- Colors properly defined

### Icons not showing
**Problem**: Lucide React not installed

**Solution**:
```bash
npm install lucide-react
```

### Layout broken on iPhone
**Check 1**: Safe area insets
Make sure `index.html` has:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
```

**Check 2**: Clear browser cache
- Safari → Settings → Clear History and Website Data

---

## 🏗️ Build Issues

### Build fails with errors

**Error: "Cannot resolve module"**
```bash
npm install
npm run build
```

**Error: "Out of memory"**
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Error: Tailwind classes not working in build**
Make sure all classes are in content paths in `tailwind.config.js`:
```javascript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
```

---

## 🔐 Supabase Issues

### "Failed to fetch" errors
**Solutions**:
1. Check internet connection
2. Verify Supabase project is not paused
3. Check API URL is correct
4. Try accessing Supabase dashboard directly

### CORS errors
**Solution**:
1. Supabase Dashboard → Settings → API
2. Add your deployment URL to allowed origins
3. For local development, http://localhost:5180 should work by default

### RLS (Row Level Security) blocking queries
**Quick fix** (development only):
```sql
-- In Supabase SQL Editor
DROP POLICY IF EXISTS "Allow all operations" ON events;
CREATE POLICY "Allow all operations" ON events
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

**Proper fix**: Set up authentication and proper RLS policies

---

## 🖼️ PWA Issues

### PWA not installing
**Requirements**:
- Must be HTTPS (or localhost)
- Must have valid manifest.json
- Must have valid service worker (optional but recommended)
- Must use Safari on iOS

**Check manifest.json**:
- Valid JSON syntax
- All required fields present
- Icons exist at specified paths

### PWA installs but icon is wrong
**Solution**:
1. Create proper icon files (see ICONS_GUIDE.md)
2. Save as `public/icon-192.png` and `public/icon-512.png`
3. Clear cache and reinstall PWA

### App doesn't work offline
**Current limitation**: App requires connection for Supabase

**To add offline support**:
- Implement service worker
- Use IndexedDB for local caching
- Sync when back online

---

## 🐛 Common JavaScript Errors

### "Cannot read property 'map' of undefined"
**Problem**: Data not loaded yet

**Check**: Add loading states:
```javascript
{events.length === 0 ? (
  <p>Loading...</p>
) : (
  events.map(event => ...)
)}
```

### "Hydration failed" or similar React errors
**Solutions**:
1. Check for duplicate IDs
2. Make sure HTML is valid
3. Clear browser cache
4. Check React DevTools for more info

### "Maximum update depth exceeded"
**Problem**: Infinite loop in useEffect

**Solution**: Check useEffect dependencies:
```javascript
useEffect(() => {
  // Your code
}, []) // Empty array = run once
```

---

## 📊 Performance Issues

### App is slow
**Solutions**:

1. **Check browser DevTools**:
   - F12 → Performance tab
   - Record and analyze

2. **Optimize images**:
   - Compress baby photo
   - Use WebP format
   - Resize to needed dimensions

3. **Limit event history**:
   - Add pagination
   - Lazy load older events

4. **Check Supabase queries**:
   - Add indexes
   - Optimize filters
   - Limit results

### High battery drain
**Possible causes**:
- Real-time subscriptions constantly running
- Too frequent age updates
- Large event history

**Solutions**:
- Update age every minute instead of every second
- Limit event queries
- Unsubscribe when app not visible

---

## 🆘 Still Stuck?

### Debugging Steps:
1. Check browser console (F12)
2. Check network tab for failed requests
3. Check React DevTools for component issues
4. Read error messages carefully
5. Google the exact error message

### Reset Everything:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Clear npm cache
npm cache clean --force

# Delete and recreate .env
# (make sure to backup values first!)
```

### Fresh Start:
```bash
# Stop dev server
# Delete node_modules
rm -rf node_modules

# Delete package-lock.json
rm package-lock.json

# Reinstall
npm install

# Start fresh
npm run dev
```

### Check Versions:
```bash
node --version   # Should be 20.x or higher
npm --version    # Should be 9.x or higher
```

---

## 📞 Where to Get Help

### Documentation:
- **This project**: Read all the guide files
- **Supabase**: https://supabase.com/docs
- **Vite**: https://vitejs.dev/guide/
- **React**: https://react.dev
- **Tailwind**: https://tailwindcss.com/docs

### Communities:
- Supabase Discord
- React Community Discord
- Stack Overflow

### Search:
- Google the exact error message
- Include "React" or "Supabase" in search
- Check GitHub issues for similar problems

---

## ✅ Prevention Tips

### To avoid issues:

1. **Version Control**:
   ```bash
   git init
   git add .
   git commit -m "Working state"
   # Commit often!
   ```

2. **Backup .env**:
   - Keep backup of Supabase credentials
   - Don't lose the keys!

3. **Test Before Deploying**:
   ```bash
   npm run build
   npm run preview
   # Test production build locally
   ```

4. **Regular Updates**:
   ```bash
   npm update
   # But test after updating!
   ```

5. **Monitor Supabase**:
   - Check dashboard regularly
   - Watch for errors in Logs section
   - Monitor usage in dashboard

---

**Most issues are simple to fix - don't panic!** 🌟

Check the error message, follow the solutions above, and you'll be back on track! 🚀
