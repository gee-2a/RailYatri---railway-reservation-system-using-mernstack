

# RailYatri Reservation System
A full-stack MERN (MongoDB, Express, React, Node.js) railway reservation system with secure authentication, ticket booking, PDF generation, and admin management.
---

## Features
- User authentication (JWT)  
- Train search and booking  
- Seat availability and allocation  
- PDF ticket with QR code  
- Email notifications  
- Admin dashboard (train & booking management, analytics)  
---

## Tech Stack
Frontend:
- React (Vite)
- Axios
- Tailwind CSS  
Backend:
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT, Bcrypt  
---

## Project Structure

railyatri-reservation-system/
├── backend/
├── frontend/
└── README.md

---

## Installation & Setup
### 1. Clone Repository

git clone 
cd railyatri-reservation-system

---

### 2. Backend Setup

cd backend
npm install

Create a `.env` file in backend:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:5173

Run backend:

npm start

---

### 3. Frontend Setup

cd frontend
npm install
npm run dev

Frontend: http://localhost:5173  
Backend: http://localhost:5000  
---

## Usage
### User
1. Register or login  
2. Search trains  
3. Select train and class  
4. Book ticket  
5. Download ticket (PDF + QR)  
6. View bookings in dashboard
   
### Admin
1. Login as admin  
2. Add / update / delete trains  
3. Monitor bookings  
4. View analytics  
---

## API Endpoints
### Authentication

POST /api/auth/register
POST /api/auth/login

### Trains

GET /api/trains
POST /api/trains
PUT /api/trains/:id
DELETE /api/trains/:id

### Bookings

POST /api/bookings
GET /api/bookings/user
GET /api/bookings/all

---

## Environment Variables
- PORT: Backend port  
- MONGO_URI: MongoDB connection string  
- JWT_SECRET: Authentication key  
- EMAIL_USER: Email for sending tickets  
- EMAIL_PASS: Email password/app password  
- CLIENT_URL: Frontend URL  
---


## Future Improvements
- Dynamic pricing  
- AI-based recommendations  
- Real-time tracking  
- Payment gateway integration

## project overview and code demonstration

project overview    -   https://drive.google.com/file/d/1jTlk-B1ay-k3cn_-J-fLFhvMvlLZtZ9_/view?usp=drive_link

code demonstration  -   https://drive.google.com/file/d/17kYmub4ROq3u8yUfp8KyirqyU2VVr3nl/view?usp=drive_link
