# 👶 גפן - Baby Care Tracker PWA

A modern, responsive Progressive Web App for tracking baby care activities. Built specifically for Hebrew-speaking parents with RTL support and optimized for iPhone screens.

## ✨ Features

- 📱 **Mobile-First Design** - Optimized for iPhone 17 Pro with safe area support
- 🔄 **Real-Time Sync** - Instantly syncs between multiple devices (you and your partner)
- 🇮🇱 **Full Hebrew Support** - RTL layout with Hebrew interface
- 🎨 **Beautiful UI** - Modern design with Tailwind CSS and smooth animations
- 📊 **Activity Tracking**:
  - 🤱 Breastfeeding (right, left, or both)
  - 🍼 Diaper changes (pee, poop, or both)
  - 😴 Sleep tracking (fell asleep / woke up)
  - 🤸 Tummy time
  - 💊 Medications (Clexane for mom, Vitamin D for baby)
  - ➕ Custom events
- 📅 **History & Filtering** - View and filter all historical events
- ⚡ **Quick Actions** - Log activities with just a few taps
- 💾 **Offline Support** - Works offline with PWA capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- A Supabase account (free tier works great!)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   
   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Run the SQL setup script:
      - Go to your Supabase Dashboard
      - Click on "SQL Editor"
      - Copy the contents of `supabase-setup.sql` and run it
   
   c. Enable real-time:
      - Go to Database → Replication
      - Find "supabase_realtime" source
      - Toggle ON for the "events" table
   
   d. Get your credentials:
      - Go to Settings → API
      - Copy your project URL and anon/public key

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:5180](http://localhost:5180) in your browser.

### 📱 Installing as PWA on iPhone

1. Open the app in Safari on your iPhone
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. The app will now appear on your home screen like a native app!

## 🎨 Customization

### Update Baby Photo

Replace the placeholder image URL in `src/components/Header.jsx`:

```jsx
<img
  src="YOUR_PHOTO_URL_HERE"
  alt="גפן"
  className="w-28 h-28 rounded-full object-cover border-4 border-primary-200 shadow-md"
/>
```

You can:
- Upload an image to your Supabase Storage
- Use any CDN or image hosting service
- Use a local image in the `public` folder

### Update Birthdate

The birthdate is configured in `src/utils/dateUtils.js`:

```javascript
export const BIRTHDATE = new Date('2026-09-09T13:35:00')
```

### Customize Colors

Edit `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  breastfeed: { ... },
  diaper: { ... },
  sleep: { ... },
  // etc.
}
```

## 🏗️ Project Structure

```
gefen-baby-tracker/
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Baby info header
│   │   ├── QuickActions.jsx   # Action button grid
│   │   ├── ActionModal.jsx    # Modal for sub-options
│   │   ├── RecentEvents.jsx   # Last 24h events
│   │   ├── EventItem.jsx      # Individual event card
│   │   ├── HistoryView.jsx    # Full history with filters
│   │   └── Toast.jsx          # Toast notifications
│   ├── lib/
│   │   └── supabase.js        # Supabase client
│   ├── utils/
│   │   └── dateUtils.js       # Date/age calculations
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
├── .env.example               # Example environment variables
├── supabase-setup.sql         # Database schema
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔧 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Date Handling**: date-fns
- **PWA**: Native Web APIs

## 📊 Database Schema

The app uses a single `events` table:

| Column      | Type      | Description                           |
|-------------|-----------|---------------------------------------|
| id          | UUID      | Primary key                           |
| created_at  | Timestamp | Auto-generated creation time          |
| event_type  | Text      | Type of event (breastfeed, diaper...) |
| details     | JSONB     | Event-specific details                |
| timestamp   | Timestamp | When the event occurred               |
| user_id     | Text      | Optional user identifier              |

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
5. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables
7. Deploy!

## 🤝 Multi-Device Usage

The app is designed for two people (e.g., you and your partner) to use simultaneously:

1. Both people install the PWA on their phones
2. Both use the same Supabase project
3. Any action logged by one person instantly appears on the other person's device
4. No login required (by default) - perfect for quick family usage

### Optional: Add Authentication

If you want separate user accounts, you can:
1. Enable Supabase Auth
2. Uncomment the RLS policies in `supabase-setup.sql`
3. Add login functionality to the app

## 📝 License

This project is created for personal use. Feel free to customize it for your needs!

## 💙 Made with Love

Built for baby Gafen 👶

---

**Need Help?** Check the [Supabase Documentation](https://supabase.com/docs) or [Vite Documentation](https://vitejs.dev/)
