# 🎨 Customization Guide

Make the app truly yours with these easy customizations!

## 1. 📸 Change Baby Photo

### Option A: Use an Online Image URL

1. Upload Gefen's photo to:
   - [Imgur](https://imgur.com) (easy, no account needed)
   - Supabase Storage (recommended if using Supabase)
   - Any other image host
   
2. Get the direct image URL

3. Open `src/components/Header.jsx`

4. Find this line (around line 40):
   ```jsx
   <img
     src="https://via.placeholder.com/120/0ea5e9/ffffff?text=גפן"
     alt="גפן"
     className="w-28 h-28 rounded-full object-cover border-4 border-primary-200 shadow-md"
   />
   ```

5. Replace the `src` with your image URL:
   ```jsx
   <img
     src="YOUR_IMAGE_URL_HERE"
     alt="גפן"
     className="w-28 h-28 rounded-full object-cover border-4 border-primary-200 shadow-md"
   />
   ```

### Option B: Use a Local Image

1. Save Gefen's photo as `gefen.jpg` or `gefen.png`

2. Put it in the `public` folder

3. In `src/components/Header.jsx`, change the src to:
   ```jsx
   src="/gefen.jpg"
   ```

### Using Supabase Storage (Recommended)

1. Go to your Supabase Dashboard
2. Click "Storage" in sidebar
3. Create a new bucket called "photos"
4. Make it public
5. Upload Gefen's photo
6. Copy the public URL
7. Use that URL in the component

## 2. 🎂 Change Birthdate

1. Open `src/utils/dateUtils.js`

2. Find this line:
   ```javascript
   export const BIRTHDATE = new Date('2026-09-09T13:35:00')
   ```

3. Change it to the correct date/time:
   ```javascript
   export const BIRTHDATE = new Date('YYYY-MM-DDTHH:MM:SS')
   ```
   
   Example: For September 9, 2026 at 1:35 PM:
   ```javascript
   export const BIRTHDATE = new Date('2026-09-09T13:35:00')
   ```

4. The age will automatically update everywhere!

## 3. 🎨 Change Colors

### Option A: Change Theme Colors

Open `tailwind.config.js` and modify the colors in the `extend` section:

```javascript
colors: {
  primary: {
    500: '#0ea5e9', // Main blue - change this!
    600: '#0284c7',
    // ...
  },
  breastfeed: {
    DEFAULT: '#f472b6', // Change pink
  },
  diaper: {
    DEFAULT: '#fbbf24', // Change yellow
  },
  sleep: {
    DEFAULT: '#a78bfa', // Change purple
  },
  tummy: {
    DEFAULT: '#34d399', // Change green
  },
  medication: {
    DEFAULT: '#f87171', // Change red
  },
  other: {
    DEFAULT: '#818cf8', // Change indigo
  }
}
```

### Option B: Quick Color Picker

Visit [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors) to choose colors!

## 4. 👶 Change Baby Name

If your baby isn't named Gefen:

### 4.1 Update the Header
`src/components/Header.jsx` - around line 36:
```jsx
<h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
  YOUR_BABY_NAME
</h1>
```

### 4.2 Update the PWA Name
`public/manifest.json`:
```json
{
  "name": "YOUR_BABY_NAME - מעקב תינוק",
  "short_name": "YOUR_BABY_NAME",
  ...
}
```

### 4.3 Update HTML Title
`index.html`:
```html
<title>YOUR_BABY_NAME - מעקב תינוק</title>
<meta name="apple-mobile-web-app-title" content="YOUR_BABY_NAME" />
```

### 4.4 Update Footer Text
`src/components/Header.jsx` - around line 61:
```jsx
<div className="text-center mt-4 text-xs text-gray-500">
  נולד ב-09.09.2026 בשעה 13:35
</div>
```

## 5. 💊 Customize Medications

Open `src/components/QuickActions.jsx` and find the medications section (around line 44):

```javascript
{
  id: 'medication',
  icon: Pill,
  label: 'תרופות',
  color: 'medication',
  options: [
    { label: 'קלקסן (מיכל)', value: 'clexane_michal' },
    { label: 'ויטמין די (גפן)', value: 'vitamin_d_gefen' }
    // Add more medications here!
  ]
}
```

Add or remove medications as needed:
```javascript
options: [
  { label: 'קלקסן (מיכל)', value: 'clexane_michal' },
  { label: 'ויטמין די (גפן)', value: 'vitamin_d_gefen' },
  { label: 'YOUR_MEDICATION', value: 'your_medication_id' }
]
```

## 6. 🔘 Add/Remove Quick Actions

Want to add more buttons or remove some?

Open `src/components/QuickActions.jsx` and modify the `actions` array.

### Example: Add a "Feeding" button

```javascript
{
  id: 'feeding',
  icon: Utensils, // Import from lucide-react
  label: 'האכלה',
  color: 'tummy', // Reuse a color or add new one
  options: [
    { label: 'חלב', value: 'milk' },
    { label: 'מוצקים', value: 'solids' }
  ]
}
```

### Example: Remove Tummy Time

Just delete or comment out the tummy time object from the actions array!

## 7. 🌍 Change Default Weight

Open `src/App.jsx` and find (around line 10):

```javascript
const [weight, setWeight] = useState(3.5) // Change 3.5 to your default
```

## 8. 📱 Change App Theme Color

The color of the browser bar and status bar:

`index.html`:
```html
<meta name="theme-color" content="#0ea5e9" />
```

`public/manifest.json`:
```json
{
  "theme_color": "#0ea5e9",
  "background_color": "#ffffff"
}
```

## 9. 🔔 Customize Toast Messages

Open any component and change the toast messages:

```javascript
showToast('האירוע נשמר בהצלחה', 'success')
// Change to:
showToast('YOUR_CUSTOM_MESSAGE', 'success')
```

## 10. ⏱️ Change Time Display Format

### 24h vs Recent Events Window

Open `src/utils/dateUtils.js`:

```javascript
export const isWithinLast24Hours = (date) => {
  const now = new Date()
  const twentyFourHoursAgo = subHours(now, 24) // Change 24 to any number
  // ...
}
```

Want to see events from the last 48 hours? Change 24 to 48!

### Date Format

In `src/utils/dateUtils.js`:

```javascript
export const formatFullDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm')
  // Change format string:
  // 'dd/MM/yyyy HH:mm' -> Day/Month/Year Hour:Minute
  // 'MM/dd/yyyy hh:mm a' -> Month/Day/Year 12-hour with AM/PM
  // 'yyyy-MM-dd HH:mm' -> Year-Month-Day Hour:Minute
}
```

## 11. 🎯 Add More Event Details

Want to track duration or notes?

Update the event structure in your modal:

`src/components/ActionModal.jsx` - add input fields for extra data, then pass them in the `onSubmit` call.

## Tips for Customization

### Finding What to Change
1. Use your IDE's search function (Ctrl+F)
2. Search for the text you see on screen
3. Edit it in the source file
4. Save and refresh!

### Testing Changes
1. Save your file
2. The dev server auto-refreshes
3. Check the browser
4. If something breaks, undo your change!

### Color Picker Tools
- [Coolors.co](https://coolors.co) - Generate color palettes
- [Color Hunt](https://colorhunt.co) - Find color combinations
- [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors) - Official palette

### Don't Be Afraid!
- You can always undo changes (Ctrl+Z)
- Git tracks all changes if you init a repo
- The app is yours to customize!

---

**Have fun making it your own!** 🎨✨
