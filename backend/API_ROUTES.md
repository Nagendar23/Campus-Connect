# API Routes Configuration - Frontend/Backend Alignment

## ✅ Fixed Configuration

### Port Configuration
- **Backend Port**: `8001` (configured in `backend/.env`)
- **Frontend API Base URL**: `http://localhost:8001` (configured in `Campus-Connect/.env.local`)

### API Route Structure

All routes are prefixed with `/api`

#### Authentication Routes (`/api/auth`)
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

#### User Routes (`/api/users`)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `GET /api/users/me/registrations` - Get current user's registrations ✅ FIXED

#### Event Routes (`/api/events`)
- `GET /api/events` - List all events (with filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (organizer only)
- `PATCH /api/events/:id` - Update event (organizer only)
- `DELETE /api/events/:id` - Archive event (organizer only)
- `POST /api/events/:id/register` - Register for event ✅ FIXED
- `GET /api/events/:id/registrations` - Get event registrations (organizer) ✅ FIXED
- `POST /api/events/:id/feedback` - Submit feedback ✅ FIXED
- `GET /api/events/:id/feedback` - Get event feedback ✅ FIXED

#### Organizer Routes (`/api/organizers`) ✅ NEW
- `GET /api/organizers/:id/summary` - Get organizer summary stats
- `GET /api/organizers/:id/events` - Get organizer's events
- `GET /api/organizers/:id/feedback` - Get organizer's feedback
- `GET /api/organizers/:id/payments` - Get organizer's payments

#### Ticket Routes (`/api/tickets`)
- `GET /api/tickets/:id` - Get ticket details
- `GET /api/tickets/:id/qrcode` - Get QR code token

#### Check-in Routes (`/api/checkin`)
- `POST /api/checkin/scan` - Scan QR code
- `GET /api/checkin/history` - Get check-in history

#### Payment Routes (`/api/payments`)
- `POST /api/payments/intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

#### Analytics Routes (`/api/analytics`)
- `GET /api/analytics/organizer/:id/overview` - Organizer analytics
- `GET /api/analytics/events/:id` - Event analytics

## Changes Made

### 1. Port Alignment ✅
- Updated `Campus-Connect/.env.local` to use port `8001` instead of `4000`

### 2. Route Restructuring ✅
- **Created** `backend/src/routes/organizers.routes.ts` for organizer-specific endpoints
- **Updated** `backend/src/routes/events.routes.ts` to include nested registration and feedback routes
- **Updated** `backend/src/routes/users.routes.ts` to include user's registrations route
- **Updated** `backend/src/routes/index.ts` to include organizers routes

### 3. RESTful Route Organization
Routes now follow RESTful patterns:
- `/events/:id/register` - Actions on an event
- `/events/:id/feedback` - Feedback for an event
- `/organizers/:id/events` - Resources belonging to an organizer
- `/users/me/registrations` - Current user's resources

## Route Mounting Details

```typescript
// In app.ts
app.use("/api", routes);

// In routes/index.ts
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/events", eventsRoutes);
router.use("/tickets", ticketsRoutes);
router.use("/checkin", checkinRoutes);
router.use("/payments", paymentsRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/organizers", organizersRoutes); // NEW
```

## Testing the Routes

### Start Backend
```bash
cd backend
npm run dev
# Server should start on port 8001
```

### Test Health Check
```bash
curl http://localhost:8001/health
# Should return: {"ok":true,"timestamp":"..."}
```

### Test Auth Signup (from frontend)
```
POST http://localhost:8001/api/auth/signup
Body: { "name": "Test User", "email": "test@example.com", "password": "password123", "role": "student" }
```

## Frontend-Backend Alignment Checklist

✅ Port numbers match (both using 8001)
✅ All auth routes aligned
✅ Event registration routes fixed
✅ Feedback routes fixed
✅ Organizer routes created and aligned
✅ User registrations route fixed
✅ All controllers have required methods
✅ Routes properly exported and imported

## Next Steps

1. **Restart Frontend**: Frontend needs to be restarted to pick up new `.env.local` with port 8001
2. **Test Signup/Login**: Test authentication flow works
3. **Test Event Registration**: Test registering for events
4. **Test Organizer Dashboard**: Test organizer-specific endpoints

All API routes are now correctly aligned between frontend and backend! 🎉
