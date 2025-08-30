# Jury Page Setup Guide

## Overview
The Jury Page allows users with the Award Badge to rate video submissions from 1-10.

## Award Badge ID
```
fc005104-5c29-44bc-b05f-1f5e5ef817a1
```

## Setup Instructions

### 1. Database Migration
Run the Supabase migration to create the necessary tables:

```bash
# Apply the migration
supabase migration up
```

Or manually execute the SQL from:
```
supabase/migrations/20250829_jury_ratings.sql
```

### 2. Assign Award Badge to Jury Members
In Supabase Dashboard:
1. Go to the `user_badges` table
2. Add entries for each jury member:
   - `user_id`: The user's ID
   - `badge_id`: `fc005104-5c29-44bc-b05f-1f5e5ef817a1`

### 3. Access the Jury Page
Jury members can access the page at:
```
https://yoursite.com/jury
```

## Features

### For Jury Members:
- ✅ View all award submissions
- ✅ Rate videos from 1-10
- ✅ Add optional comments
- ✅ Filter by category (DJing, Producing, Performance)
- ✅ Track rating progress
- ✅ View statistics and analytics
- ✅ Real-time updates when other jurors rate
- ✅ Keyboard shortcuts (1-9, 0 for 10)

### Security Features:
- Badge-based access control
- Rate limiting on API endpoints
- Row-level security in Supabase
- Duplicate rating prevention
- Audit logging

### Real-time Features:
- Live rating updates
- Live statistics updates
- Progress tracking
- Leaderboard updates

## API Endpoints

### `GET /api/jury/submissions`
Fetch all submissions with user's ratings

### `POST /api/jury/submissions`
Submit or update a rating
```json
{
  "submissionId": "sanity-doc-id",
  "rating": 8,
  "comments": "Great performance!",
  "category": "performance"
}
```

### `GET /api/jury/statistics`
Get jury statistics and analytics

## Database Schema

### Tables:
- `jury_ratings`: Stores individual ratings
- `jury_progress`: View for progress tracking
- `submission_stats`: View for submission statistics

### Key Fields:
- `submission_id`: References Sanity awardUpload document
- `juror_id`: References Supabase user
- `rating`: Integer 1-10
- `comments`: Optional text feedback
- `category`: djing, producing, or performance

## Troubleshooting

### User can't access jury page:
1. Check if user has the award badge in `user_badges` table
2. Verify badge_id is exactly: `fc005104-5c29-44bc-b05f-1f5e5ef817a1`
3. Check browser console for errors

### Ratings not saving:
1. Check network tab for API errors
2. Verify RLS policies are enabled
3. Check Supabase logs for errors

### Real-time updates not working:
1. Verify Supabase Realtime is enabled
2. Check browser console for WebSocket errors
3. Ensure RLS policies allow SELECT for jury members

## Development

### Local Testing:
1. Use local Supabase instance
2. Create test users with award badge
3. Upload test submissions in Sanity

### Monitoring:
- Check Supabase Dashboard for real-time connections
- Monitor API endpoint performance
- Track rating completion rates

## Future Enhancements
- Export ratings to CSV/PDF
- Advanced analytics dashboard
- Bulk rating operations
- Comments thread system
- Weighted voting system
- Anonymous voting option