# Online Exam System

A full-stack Online Exam System built using the MERN stack. This application allows teachers to create exams and manage questions, while students can register, log in, take exams, and view their results.

## 🚀 Features

### Authentication
- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Role-based Access (Teacher & Student)

### Teacher Module
- Create Exams
- Add Questions
- View Student Results
- Dashboard

### Student Module
- Register & Login
- View Available Exams
- Take Exams
- View Exam Results
- Result Details

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- CORS
- dotenv

## 📁 Project Structure

```
online-exam-system/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/online-exam-system.git
```

### 2. Navigate to Project

```bash
cd online-exam-system
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend server:

```bash
npm start
```

or

```bash
node server.js
```

---

## Frontend Setup

Open a new terminal.

```bash
cd frontend
npm install
npm start
```

The frontend runs on:

```
http://localhost:3000
```

The backend runs on:

```
http://localhost:5000
```

---

## API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Exams

```
GET    /api/exams
POST   /api/exams
PUT    /api/exams/:id
DELETE /api/exams/:id
```

### Results

```
POST /api/results
GET  /api/results
GET  /api/results/:id
```

---

## Security Features

- JWT Authentication
- Password Hashing using bcryptjs
- Protected Routes
- Role-based Authorization
- Environment Variables using dotenv

---

## Future Enhancements

- Timer for Exams
- Random Question Generation
- Negative Marking
- Leaderboard
- Admin Panel
- Email Notifications
- Certificate Generation
- Dark Mode
- Exam Analytics

---

## Author

**Ansalna KS**

MERN Stack Developer | MERN Stack Trainer

---

## License

This project is licensed under the MIT License.