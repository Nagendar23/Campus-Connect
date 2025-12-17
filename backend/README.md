# Campus Connect Backend

Express.js + MongoDB backend for Campus Connect event management platform.

## Features

- **Authentication**: JWT-based auth with access/refresh tokens
- **Events Management**: CRUD operations for events with organizer ownership
- **Registration & Tickets**: Free and paid event registration with QR code generation
- **Check-in System**: QR code scanning with idempotent check-in logic
- **Feedback System**: Post-event ratings and comments
- **Payments**: Mock payment system (Stripe-ready)
- **Analytics**: Organizer dashboards with event metrics

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, rate limiting

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your values
```

### Environment Variables

```env
PORT=8000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect

CORS_ORIGIN=http://localhost:3000

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

QR_SECRET=your_qr_secret
```

### Development

```bash
# Start MongoDB (if running locally)
# mongod

# Run development server
npm run dev

# Server runs on http://localhost:8000
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - List events (public)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (organizer)
- `PATCH /api/events/:id` - Update event (organizer)
- `DELETE /api/events/:id` - Archive event (organizer)

### Registrations
- `POST /api/registrations/events/:id/register` - Register for event
- `GET /api/registrations/me` - Get my registrations
- `GET /api/registrations/events/:id` - Get event registrations (organizer)

### Tickets
- `GET /api/tickets/:id` - Get ticket details
- `GET /api/tickets/:id/qrcode` - Get ticket QR code

### Check-in
- `POST /api/checkin/scan` - Scan QR code (organizer)
- `GET /api/checkin/history?eventId=...` - Get check-in history (organizer)

### Feedback
- `POST /api/feedback/events/:id/feedback` - Submit feedback
- `GET /api/feedback/events/:id` - Get event feedback
- `GET /api/feedback/organizers/:id` - Get organizer feedback (organizer)

### Payments
- `POST /api/payments/intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/organizers/:id` - Get organizer payments (organizer)

### Analytics
- `GET /api/analytics/organizer/:id/overview` - Get organizer overview (organizer)
- `GET /api/analytics/events/:id` - Get event analytics (organizer)

### Users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `GET /api/users/organizers/:id/summary` - Get organizer summary

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration (env, db)
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Auth, validation, error handling
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utilities (JWT, QR, crypto)
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server bootstrap
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

## QR Code System

Tickets use signed JWT-like tokens:

```
Format: base64url(payload).base64url(hmac_signature)

Payload: {
  t: ticketId,
  e: eventId,
  exp: expiryTimestamp
}
```

Tokens are validated on check-in with:
- Signature verification
- Expiry check
- Event matching
- Idempotent check-in (409 if already checked in)

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT access tokens (15m expiry)
- Refresh token rotation with revocation
- Rate limiting on auth and check-in endpoints
- Input validation with Zod
- CORS protection
- Helmet security headers

## Error Handling

All errors follow consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Development Tips

1. **Seeding Data**: Run seed script to populate development data
2. **Testing Auth**: Use `/api/auth/signup` to create test users
3. **Role Testing**: Create users with `role: "organizer"` for organizer features
4. **QR Testing**: Get QR token from `/api/tickets/:id/qrcode` endpoint

## License

Private - Campus Connect 2025
