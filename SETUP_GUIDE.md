# 🚀 Quick Setup Guide for Gefen Baby Tracker

Follow these steps to get your baby tracking app up and running!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Gefen Baby Tracker
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to you
5. Wait for the project to be created (~2 minutes)

### 2.2 Set Up the Database

1. In your Supabase Dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the `supabase-setup.sql` file from this project
4. Copy all the SQL code and paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see a success message!

### 2.3 Enable Real-Time Updates

1. In your Supabase Dashboard, go to **Database** → **Replication**
2. Look for **"supabase_realtime"** in the Publications section
3. Find the **"events"** table in the list
4. **Toggle it ON** (it should turn green)
5. Click **"Save"** if needed

### 2.4 Get Your API Keys

1. Go to **Settings** → **API** in your Supabase Dashboard
2. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)
3. Copy these values - you'll need them next!

## Step 3: Configure Environment Variables

1. In the project folder, find the file `.env.example`
2. Create a new file called `.env` (remove the `.example`)
3. Paste your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the values with your actual credentials from Step 2.4!

## Step 4: Run the App

```bash
npm run dev
```

The app should now be running at [http://localhost:5180](http://localhost:5180)!

## Step 5: Install on Your iPhone

### 5.1 Access from Your Phone

1. Find your computer's local IP address:
   - **Windows**: Open Command Prompt and type `ipconfig`, look for "IPv4 Address"
   - **Mac/Linux**: Open Terminal and type `ifconfig` or `hostname -I`
   
2. On your iPhone, open Safari and go to:
   ```
   http://YOUR_IP_ADDRESS:5180
   ```
   For example: `http://192.168.1.100:5180`

### 5.2 Install as PWA

1. Once the app loads in Safari, tap the **Share** button (square with arrow)
2. Scroll down and tap **"Add to Home Screen"**
3. You can rename it if you want (suggested: "גפן")
4. Tap **"Add"**
5. The app icon will appear on your home screen!

### 5.3 Install on Your Partner's Phone

Repeat the same steps on your partner's phone. Both devices will stay in sync automatically! 🎉

## Step 6: Customize (Optional)

### Change Baby's Photo

1. Open `src/components/Header.jsx`
2. Find line with `<img src=...`
3. Replace the `src` URL with your baby's photo
   - You can use Supabase Storage, Imgur, or any image URL

### Adjust Birth Date/Time

1. Open `src/utils/dateUtils.js`
2. Change this line:
   ```javascript
   export const BIRTHDATE = new Date('2026-09-09T13:35:00')
   ```

### Change Colors

Edit `tailwind.config.js` to customize the color scheme!

## 🎉 You're Done!

Your baby tracking app is ready to use. Start logging activities and they'll sync instantly between devices!

## Need Help?

- **Supabase Issues**: Check [Supabase Documentation](https://supabase.com/docs)
- **General Issues**: Review the main README.md file
- **Connection Issues**: Make sure both devices are on the same WiFi network

## 🔐 Production Tips

When you're ready to deploy:

1. **Deploy to Vercel/Netlify** (see README.md)
2. Your phones will connect via the internet URL (not local IP)
3. Consider adding authentication if you want user accounts
4. Enable Row Level Security in Supabase for better security

---

Happy tracking! 👶💙
