# Campus-Connect: University Event Management System

A full-stack event management platform for universities, built with Next.js, Express.js, and MongoDB.

# 🌐 Live URL's
Frontend URL : https://nagendar-campus-connect.vercel.app/                                          
Backend URL : https://campus-connect-htpy.onrender.com/

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- MongoDB (local or cloud)
- Git

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd Campus-Connect

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../Campus-Connect
npm install
```

### 2. Environment Setup

**Backend** (already configured in `backend/.env`):
- PORT: 8000
- MongoDB connection string
- JWT secrets
- CORS origin: http://localhost:3000

**Frontend** (already configured in `Campus-Connect/.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd Campus-Connect
npm run dev
```
Frontend runs on: http://localhost:3000

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This creates sample data:
- Test users (students and organizers)
- Sample events
- Registrations and tickets
- Feedback and payments

## 📁 Project Structure

```
Campus-Connect/
├── backend/                    # Express.js + MongoDB backend
│   ├── src/
│   │   ├── models/            # Mongoose models
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middlewares/       # Auth, validation, error handling
│   │   ├── utils/             # JWT, crypto, QR, pagination
│   │   └── config/            # Database and environment config
│   ├── package.json
│   └── .env
│
├── Campus-Connect/            # Next.js frontend
│   ├── app/                   # Next.js 13+ app directory
│   │   ├── auth/             # Login & signup pages
│   │   ├── dashboard/        # Student dashboard
│   │   ├── events/           # Event listing & details
│   │   ├── organizer/        # Organizer dashboard & tools
│   │   ├── feedback/         # Feedback pages
│   │   └── payments/         # Payment pages
│   ├── components/           # Reusable UI components
│   ├── lib/                  # API client & utilities
│   │   ├── api.ts           # Complete API client
│   │   └── auth-context.tsx # Authentication provider
│   └── .env.local
│
└── INTEGRATION_GUIDE.md      # Detailed integration docs
```

## 🔑 Key Features

### For Students
- Browse and search events
- Register for events (free or paid)
- View digital tickets with QR codes
- Check-in via QR code
- Submit feedback and ratings
- View payment history

### For Organizers
- Create and manage events
- Track registrations in real-time
- Scan QR codes for check-ins
- View analytics and reports
- Manage payments and revenue
- Collect and view feedback

### Technical Features
- JWT-based authentication with refresh tokens
- Role-based access control (student/organizer/admin)
- Secure QR code generation with HMAC signatures
- Idempotent check-in system
- Payment integration (mock with Stripe upgrade path)
- Real-time analytics aggregations
- Comprehensive error handling
- Rate limiting on sensitive endpoints

## 🔐 Authentication

### Flow
1. User signs up with name, email, password, and role
2. Backend returns access token (15m) and refresh token (7d)
3. Tokens stored in localStorage
4. Access token included in all API requests
5. Automatic refresh on 401 responses

### Endpoints
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and revoke tokens

## 📡 API Endpoints

### Events
```
GET    /api/events               # List all events (with filters)
GET    /api/events/:id           # Get event details
POST   /api/events               # Create event (organizer)
PATCH  /api/events/:id           # Update event (organizer)
DELETE /api/events/:id           # Archive event (organizer)
GET    /api/organizers/:id/events  # List organizer's events
```

### Registrations & Tickets
```
POST   /api/events/:id/register  # Register for event
GET    /api/users/me/registrations  # My registrations
GET    /api/events/:id/registrations  # Event registrations (organizer)
GET    /api/tickets/:id           # Get ticket
GET    /api/tickets/:id/qrcode    # Get QR token
```

### Check-in
```
POST   /api/checkin/scan         # Scan QR and check-in
GET    /api/checkin/history      # Check-in history
```

### Feedback
```
POST   /api/events/:id/feedback  # Submit feedback
GET    /api/events/:id/feedback  # Get feedback
GET    /api/organizers/:id/feedback  # Organizer feedback
```

### Payments
```
POST   /api/payments/intent      # Create payment
POST   /api/payments/confirm     # Confirm payment
GET    /api/payments/history     # Payment history
```

### Analytics
```
GET    /api/analytics/organizer/:id/overview  # Organizer analytics
GET    /api/analytics/events/:id              # Event analytics
```

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcrypt, helmet, cors, rate-limiter
- **Validation:** Zod
- **QR Codes:** crypto (HMAC-SHA256)

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Context API
- **HTTP Client:** Fetch API

## 🎯 Current Integration Status

### ✅ Completed
- [x] Backend API implementation
  - [x] All models with Mongoose
  - [x] All controllers and services
  - [x] Authentication & authorization
  - [x] QR code generation & validation
  - [x] Check-in system
  - [x] Payments (mock)
  - [x] Analytics aggregations
- [x] Frontend API client
  - [x] Complete API client in `/lib/api.ts`
  - [x] Authentication context provider
  - [x] Token management with auto-refresh
- [x] Auth pages
  - [x] Login page (with role-based tabs)
  - [x] Signup page (with validation)
  - [x] Auth guard component
- [x] Environment configuration

### 🚧 To Be Integrated
- [ ] Events listing page
- [ ] Event details page
- [ ] Registration modal
- [ ] Student dashboard
- [ ] My events page
- [ ] Organizer dashboard
- [ ] Create event form
- [ ] Event management page
- [ ] QR scanner component
- [ ] Analytics dashboard
- [ ] Payment pages
- [ ] Feedback pages

## 📝 Development Notes

### Adding New Features

1. **Backend:**
   ```bash
   # Add model
   backend/src/models/NewModel.ts
   
   # Add service
   backend/src/services/newModel.service.ts
   
   # Add controller
   backend/src/controllers/newModel.controller.ts
   
   # Add routes
   backend/src/routes/newModel.routes.ts
   ```

2. **Frontend:**
   ```typescript
   // Update types in lib/api.ts
   export type NewModel = { ... }
   
   // Add API methods
   export const api = {
     ...
     newModel: {
       list: () => request<NewModel[]>('/newmodels'),
       get: (id: string) => request<NewModel>(`/newmodels/${id}`),
     }
   }
   ```

### Testing

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd Campus-Connect
npm test
```

### Database

**Local MongoDB:**
```bash
# Start MongoDB
mongod

# Connect with mongo shell
mongosh
```

**Cloud MongoDB Atlas:**
- Already configured in backend/.env
- Connection string includes credentials

## 🐛 Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check `.env` configuration
- Verify port 8000 is available

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_BASE_URL` in frontend `.env.local`
- Check browser console for CORS errors

### Authentication issues
- Clear localStorage and cookies
- Try logging out and back in
- Check JWT secrets in backend `.env`

### TypeScript errors
- Run `npm install` in both directories
- Check types match between frontend and backend
- MongoDB `_id` is used (not `id`)

## 📚 Documentation

- [Integration Guide](./INTEGRATION_GUIDE.md) - Detailed integration documentation
- [Backend README](./backend/README.md) - Backend-specific documentation
- [API Documentation](./backend/README.md#api-endpoints) - Complete API reference

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👥 Team

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: Express.js + MongoDB + Mongoose
- Integration: RESTful API with JWT authentication

---

**Need help?** Check the [Integration Guide](./INTEGRATION_GUIDE.md) or open an issue.
