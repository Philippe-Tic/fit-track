# FitTrack - Personal Fitness Tracker

A modern, responsive web application for tracking your daily fitness journey. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **User Authentication**: Email/password and Google OAuth authentication
- **Daily Tracking**: Log meals, workouts, and weight for each day
- **Visual Calendar**: Interactive calendar with activity indicators
- **Progress Charts**: Weight tracking with beautiful charts
- **Image Upload**: Add photos to your meals and workouts
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Data**: Powered by Supabase for instant updates

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Chart.js + React Chart.js 2
- **Backend**: Supabase (Database, Auth, Storage)
- **Date Handling**: date-fns
- **Routing**: React Router DOM

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (version 16 or higher)
- npm or yarn package manager
- A Supabase account
- A Google Cloud Console account (for OAuth)

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd fittrack

# Install dependencies
npm install
```

### 2. Supabase Setup

#### Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to Settings > API to get your project credentials

#### Database Setup

The project includes migration files that will set up your database schema automatically:

1. In your Supabase dashboard, go to the SQL Editor
2. Run the migration files in order:
   - `supabase/migrations/20250604143332_wandering_snowflake.sql`
   - `supabase/migrations/20250604144144_scarlet_flower.sql`

Or use the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

#### Storage Setup

The migrations automatically create storage buckets for images:
- `meal_images`: For meal photos
- `workout_images`: For workout photos

#### Authentication Setup

1. In Supabase dashboard, go to Authentication > Settings
2. Configure your site URL: `http://localhost:5173` (for development)
3. Add redirect URLs: `http://localhost:5173/auth/callback`

### 3. Google OAuth Setup (Optional)

#### Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback`

#### Supabase Google Provider

1. In Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google Client ID and Client Secret
4. Save changes

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase project settings.

## 🚀 Running the Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

## 📱 Usage Guide

### Getting Started

1. **Sign Up/Login**: Create an account using email/password or Google OAuth
2. **Profile Setup**: Complete your profile information
3. **Start Tracking**: Begin logging your daily activities

### Daily Tracking

#### Adding Daily Entries

1. **Select a Date**: Click on any date in the calendar
2. **Add Weight**: Enter your daily weight in kg
3. **Log Meals**:
   - Click "Ajouter un repas" to add a meal
   - Add a photo (optional) and description
   - Save your entry
4. **Log Workouts**:
   - Click "Ajouter une activité" to add a workout
   - Add a photo (optional) and description
   - Save your entry

#### Calendar Features

- **Activity Indicators**: Days with logged data show activity icons
- **Navigation**: Use arrow buttons to navigate between months
- **Today Highlight**: Current day is highlighted in teal
- **Selection**: Selected day is shown with a teal background

### Statistics

- **Weight Chart**: View your weight progression over time
- **Time Periods**: Switch between 1 month, 3 months, 6 months, and 1 year views
- **Interactive Charts**: Hover over data points for detailed information

## 🎨 Customization

### Tailwind CSS

The project uses Tailwind CSS for styling. Key design tokens:

- **Primary Color**: Teal (teal-500, teal-600, etc.)
- **Gray Scale**: For text and backgrounds
- **Responsive**: Mobile-first approach with sm:, md:, lg: breakpoints

### Icons

Using Lucide React for consistent iconography:

```jsx
import { Calendar, User, Activity } from 'lucide-react';
```

Common icons used:
- `Calendar`: Calendar and date-related features
- `User`: Profile and user-related features
- `Activity`: Fitness and tracking features
- `Camera`: Image upload functionality
- `BarChart2`: Statistics and charts

### Color Scheme

```css
/* Primary Colors */
teal-50   /* Light backgrounds */
teal-100  /* Hover states */
teal-500  /* Primary actions */
teal-600  /* Primary buttons */
teal-700  /* Hover on primary buttons */

/* Neutral Colors */
gray-50   /* Page backgrounds */
gray-100  /* Card backgrounds */
gray-300  /* Borders */
gray-600  /* Secondary text */
gray-900  /* Primary text */
```

## 📊 Database Schema

### Tables

1. **profiles**: User profile information
   - `id` (UUID, FK to auth.users)
   - `email` (TEXT)
   - `full_name` (TEXT, optional)
   - `avatar_url` (TEXT, optional)
   - `created_at` (TIMESTAMPTZ)

2. **daily_entries**: Daily tracking entries
   - `id` (UUID, PK)
   - `user_id` (UUID, FK to profiles)
   - `date` (DATE)
   - `weight` (DECIMAL, optional)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

3. **meal_entries**: Meal tracking
   - `id` (UUID, PK)
   - `daily_entry_id` (UUID, FK to daily_entries)
   - `description` (TEXT)
   - `image_url` (TEXT, optional)
   - `created_at` (TIMESTAMPTZ)

4. **workout_entries**: Workout tracking
   - `id` (UUID, PK)
   - `daily_entry_id` (UUID, FK to daily_entries)
   - `description` (TEXT)
   - `image_url` (TEXT, optional)
   - `created_at` (TIMESTAMPTZ)

### Security

- **Row Level Security (RLS)**: Enabled on all tables
- **Policies**: Users can only access their own data
- **Storage Policies**: Users can only upload/access their own images

## 🔒 Security Features

- **Authentication**: Secure user authentication via Supabase Auth
- **Row Level Security**: Database-level security ensuring data isolation
- **Image Upload**: Secure file upload with user-specific folders
- **HTTPS**: All API calls are made over HTTPS
- **Input Validation**: Client-side and server-side validation

## 🚀 Deployment

### Netlify (Recommended)

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard
4. Update Supabase redirect URLs with your production domain

### Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Verify environment variables are correct
   - Check if Supabase project is active
   - Ensure RLS policies are properly set up

2. **Google OAuth Not Working**
   - Verify redirect URLs in Google Cloud Console
   - Check Google provider configuration in Supabase
   - Ensure OAuth consent screen is configured

3. **Image Upload Failing**
   - Check storage bucket policies
   - Verify file size limits
   - Ensure proper file types (images only)

4. **Calendar Not Loading Data**
   - Check browser console for errors
   - Verify database migrations ran successfully
   - Ensure user has proper permissions

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
VITE_DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) for the styling framework
- [Lucide](https://lucide.dev) for the beautiful icons
- [Chart.js](https://www.chartjs.org) for the charting library
- [React](https://reactjs.org) for the frontend framework

---

**Happy tracking! 🏃‍♀️💪**
