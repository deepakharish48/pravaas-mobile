How is it implemented?
What services exist?
What APIs exist?
What database entities exist?

Audience:
Developers
Architects

Technical Specification (TSD)

Current Architecture
Monorepo
│
├── apps
│   ├── mobile
│   ├── api
│   └── hotel
│
├── packages
│   ├── api-client
│   ├── ui
│   └── types

Technology Stack
Mobile
React Native
Expo
TypeScript
React Query
Zustand
React Navigation
Backend
NestJS
TypeScript
Prisma
PostgreSQL
JWT Authentication
Shared Packages
UI Components
Types
API Client

Current APIs
Authentication
POST /auth/signup
POST /auth/login
GET  /auth/me
Bookings
GET    /bookings
GET    /bookings/:id
POST   /bookings/upload
GET    /bookings/:id/qr
Booking Processing Pipeline

Current:
Mobile Upload
      ↓
API Upload Endpoint
      ↓
Store Screenshot
      ↓
OpenAI Extraction
      ↓
Create Booking Record
      ↓
Generate QR

Current Status:
Upload        ✅
Storage       ✅
QR            ✅
OpenAI OCR    ❌ API Key Missing

Database Entities

User
id
name
email
passwordHash
createdAt

Booking
id
userId
hotelName
checkIn
checkOut
status
imagePath
createdAt

Hotel
id
name
address
licenseNumber

CheckIn
id
bookingId
hotelId
status
checkInTime


