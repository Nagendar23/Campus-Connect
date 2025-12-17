# Campus-Connect Frontend-Backend Integration Guide

## Overview
This document outlines the integration between the Campus-Connect Next.js frontend and Express.js + MongoDB backend.

## Backend API Base URL
- **Development:** `http://localhost:8000`
- **Configured via:** `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

## Authentication Flow

### Token Management
- Access tokens and refresh tokens are stored in `localStorage`
- Access tokens are automatically included in API requests via `Authorization: Bearer <token>` header
- Automatic token refresh on 401 responses
- Tokens are managed by `/lib/auth-context.tsx` (AuthProvider)

### Auth Endpoints
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and receive tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and revoke tokens
- `GET /api/auth/me` - Get current user

## Updated Components

### Core Files

1. **`/lib/api.ts`**
   - Complete API client matching backend structure
   - Token management (get, set, clear)
   - Automatic token refresh
   - Error handling with `ApiError` class
   - All endpoints organized by domain

2. **`/lib/auth-context.tsx`**
   - Global authentication state management
   - Provides `useAuth()` hook
   - Handles login, signup, logout, user refresh

3. **`/app/layout.tsx`**
   - Wraps app with `AuthProvider` and `ThemeProvider`

4. **`/.env.local`**
   - Environment configuration
   - Sets `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

### Updated Pages

1. **`/app/auth/login/page.tsx`**
   - Integrated with backend login API
   - Role-based login (student/organizer)
   - Error handling and validation
   - Auto-redirect based on role

2. **`/app/auth/signup/page.tsx`**
   - Integrated with backend signup API
   - Form validation
   - Password confirmation
   - Terms acceptance
   - Error handling

3. **`/components/auth/auth-guard.tsx`**
   - Uses `AuthProvider` context
   - Role-based route protection
   - Loading states

## API Endpoints Structure

### Events
- `GET /api/events` - List all events (with filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (organizer only)
- `PATCH /api/events/:id` - Update event (organizer only)
- `DELETE /api/events/:id` - Archive event (organizer only)
- `GET /api/organizers/:id/events` - List organizer's events

### Registrations
- `POST /api/events/:id/register` - Register for event
- `GET /api/users/me/registrations` - Get my registrations
- `GET /api/events/:id/registrations` - Get event registrations (organizer)

### Tickets
- `GET /api/tickets/:id` - Get ticket details
- `GET /api/tickets/:id/qrcode` - Get QR code token for ticket

### Check-in
- `POST /api/checkin/scan` - Scan QR code and check in
- `GET /api/checkin/history` - Get check-in history for event

### Feedback
- `POST /api/events/:id/feedback` - Submit feedback
- `GET /api/events/:id/feedback` - Get event feedback
- `GET /api/organizers/:id/feedback` - Get organizer's feedback

### Payments
- `POST /api/payments/intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history
- `GET /api/organizers/:id/payments` - Get organizer payments

### Analytics
- `GET /api/analytics/organizer/:id/overview` - Organizer analytics
- `GET /api/analytics/events/:id` - Event analytics

## Data Type Mappings

### MongoDB to Frontend
- `_id` (MongoDB ObjectId) → `_id` (string in frontend)
- Dates stored as ISO strings
- Nested objects can be populated or returned as IDs

### Key Types
```typescript
User {
  _id: string
  name: string
  email: string
  role: "student" | "organizer" | "admin"
  avatarUrl?: string
}

Event {
  _id: string
  title: string
  description: string
  location: string
  startTime: string (ISO date)
  endTime: string (ISO date)
  capacity: number
  isPaid: boolean
  price?: number
  status: "draft" | "published" | "archived"
  organizerId: string | User
}

Registration {
  _id: string
  userId: string | User
  eventId: string | Event
  status: "pending" | "confirmed" | "cancelled"
  ticketId?: string
}

Ticket {
  _id: string
  userId: string | User
  eventId: string | Event
  registrationId: string
  qrCode: string (signed token)
  checkedInAt?: string
  checkInMethod?: "qr" | "manual"
}
```

## Next Steps to Complete Integration

### Remaining Pages to Update:

1. **Events Pages**
   - `/app/events/page.tsx` - List events from API
   - `/app/events/[id]/page.tsx` - Show event details from API

2. **Dashboard Pages**
   - `/app/dashboard/page.tsx` - Student dashboard
   - `/app/my-events/page.tsx` - User's registered events

3. **Organizer Pages**
   - `/app/organizer/page.tsx` - Organizer dashboard
   - `/app/organizer/create/page.tsx` - Create event form
   - `/app/organizer/events/page.tsx` - Manage events
   - `/app/organizer/analytics/page.tsx` - View analytics
   - `/app/organizer/scanner/page.tsx` - QR scanner

4. **Payment Pages**
   - `/app/payment/[eventId]/page.tsx` - Payment flow
   - `/app/payments/page.tsx` - Payment history

5. **Feedback Pages**
   - `/app/feedback/page.tsx` - Submit feedback
   - `/app/organizer/feedback/page.tsx` - View feedback

6. **Components**
   - `/components/events/event-card.tsx` - Display event data
   - `/components/events/registration-modal.tsx` - Register for event
   - `/components/qr/qr-scanner.tsx` - Scan QR codes
   - `/components/qr/qr-code-display.tsx` - Display QR codes

## Testing the Integration

### Start Backend
```bash
cd backend
npm install
npm run dev
```

### Start Frontend
```bash
cd Campus-Connect
npm install
npm run dev
```

### Test Flow
1. Open `http://localhost:3000`
2. Navigate to `/auth/signup`
3. Create a student account
4. Login at `/auth/login`
5. Should redirect to `/dashboard`

### Create Test Data
Use the backend seed script:
```bash
cd backend
npm run seed
```

This creates:
- Test users (students and organizers)
- Sample events
- Registrations and tickets
- Feedback and payments

## Common Issues & Solutions

### CORS Errors
- Ensure backend CORS is configured for `http://localhost:3000`
- Check `backend/src/app.ts` for CORS settings

### 401 Unauthorized
- Token might be expired
- Try logging out and logging back in
- Check browser console for token refresh attempts

### Connection Refused
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Verify MongoDB is running

### Type Errors
- Frontend types use `_id` to match MongoDB
- Some fields are optional (check types in `/lib/api.ts`)
- Populated fields can be objects or IDs

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend (`.env`)
```
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect
CORS_ORIGIN=http://localhost:3000
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
QR_SECRET=your_qr_secret_here
```

## Development Workflow

1. **Make API changes in backend:**
   - Update models in `/backend/src/models`
   - Update services in `/backend/src/services`
   - Update controllers in `/backend/src/controllers`
   - Update routes in `/backend/src/routes`

2. **Update frontend types:**
   - Update types in `/lib/api.ts`
   - Update API functions in `/lib/api.ts`

3. **Update UI components:**
   - Use `useAuth()` hook for user data
   - Use `api.*` methods for API calls
   - Handle loading and error states

## API Response Format

All backend responses follow this envelope:
```json
{
  "data": { ... }
}
```

Errors follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

The API client automatically unwraps the `data` field, so components receive the actual data directly.
