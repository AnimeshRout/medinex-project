# 🏥 MEDINEX — Doctor Appointment Booking System

A full-stack web application for booking doctor appointments online. Patients can browse doctors, book appointments, and manage their health. Doctors can manage their schedule and appointments. Admins have full control over the platform.

---

## 🌐 Live Demo

| App | URL |
|-----|-----|
| Patient Frontend | [medinex.vercel.app](https://medinex.vercel.app) |
| Admin & Doctor Panel | [medinex-admin.vercel.app](https://medinex-admin.vercel.app) |
| Backend API | [medinex-backend.onrender.com](https://medinex-backend.onrender.com) |

---

## ✨ Features

### 👤 Patient
- Browse and search doctors by speciality
- Book, cancel, and manage appointments
- View appointment history
- Secure login and registration

### 🩺 Doctor
- Dashboard with appointment overview
- Manage and update appointment status
- View patient details
- Update profile and availability

### 🔧 Admin
- Full control over doctors and patients
- Add, edit, or remove doctors
- Monitor all appointments
- Dashboard with platform statistics

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, Tailwind CSS |
| Admin & Doctor Panel | React.js, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| File Storage | Cloudinary |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## 📁 Project Structure

```
MEDINEX_PROJECT/
├── frontend/          # Patient-facing React app
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── context/
│   └── package.json
│
├── admin/             # Admin & Doctor panel React app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   └── Doctor/
│   │   ├── components/
│   │   └── context/
│   └── package.json
│
├── backend/           # Node.js Express REST API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── middleware/
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### 1. Clone the repository

```bash
git clone https://github.com/AnimeshRout/medinex-project.git
cd medinex-project
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=4000
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_BACKEND_URL=http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

### 4. Setup Admin Panel

```bash
cd ../admin
npm install
```

Create a `.env` file inside `admin/`:

```env
VITE_BACKEND_URL=http://localhost:4000
```

Start the admin panel:

```bash
npm run dev
```

---

## 🔐 Environment Variables Summary

| File | Variable | Description |
|------|----------|-------------|
| `backend/.env` | `MONGODB_URI` | MongoDB connection string |
| `backend/.env` | `JWT_SECRET` | Secret key for JWT tokens |
| `backend/.env` | `CLOUDINARY_*` | Cloudinary credentials |
| `backend/.env` | `PORT` | Server port (default 4000) |
| `frontend/.env` | `VITE_BACKEND_URL` | Backend API base URL |
| `admin/.env` | `VITE_BACKEND_URL` | Backend API base URL |

---

## 📦 Deployment

| Service | Platform | Guide |
|---------|----------|-------|
| Frontend | Vercel | Set root directory to `frontend/` |
| Admin Panel | Vercel | Set root directory to `admin/` |
| Backend | Render | Set root directory to `backend/` |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Animesh Rout**  
GitHub: [@AnimeshRout](https://github.com/AnimeshRout)
