# 🎓 Misun Academy - Frontend

> Modern, feature-rich Learning Management System (LMS) built with React, TypeScript, and Redux

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Redux](https://img.shields.io/badge/Redux-Toolkit-purple.svg)](https://redux-toolkit.js.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-yellow.svg)](https://vitejs.dev/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [User Roles](#-user-roles)
- [Key Features by Role](#-key-features-by-role)
- [Contributing](#-contributing)

## ✨ Features

### 🎯 Core Functionality

- **Multi-role Authentication** - Student, Instructor, Teacher, Admin, Moderator
- **Course Management** - Browse, enroll, and learn from comprehensive courses
- **Interactive Quizzes** - Real-time quiz taking with instant scoring
- **Assignment Submission** - Text answers or Google Drive link submissions
- **Live Chat Support** - Real-time communication with instructors/admins
- **Progress Tracking** - Monitor learning progress and course completion
- **Analytics Dashboard** - Comprehensive insights for administrators

### 🚀 Advanced Features

- **Module-based Learning** - Organized course content with lessons
- **Toast Notifications** - User-friendly feedback system
- **Responsive Design** - Works seamlessly on all devices
- **Dark Mode Support** - Eye-friendly interface
- **Real-time Updates** - Socket.IO integration for live features

## 🛠 Tech Stack

| Technology           | Purpose                 |
| -------------------- | ----------------------- |
| **React 18**         | UI Framework            |
| **TypeScript**       | Type Safety             |
| **Redux Toolkit**    | State Management        |
| **React Router**     | Navigation              |
| **Axios**            | HTTP Client             |
| **Socket.IO Client** | Real-time Communication |
| **React Toastify**   | Notifications           |
| **React Icons**      | Icon Library            |
| **Recharts**         | Data Visualization      |
| **Vite**             | Build Tool              |

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 16.x
npm >= 8.x
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/wahid1099/CourseMaster-frontend.git
cd CourseMaster-frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
# Create .env file in root directory
cp .env.example .env
```

4. **Start development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── auth/       # Authentication components
│   │   ├── ChatWidget.tsx
│   │   ├── Footer.tsx
│   │   └── Header.tsx
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin-specific pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Assignments.tsx
│   │   │   ├── CourseForm.tsx
│   │   │   ├── Courses.tsx
│   │   │   ├── QuizForm.tsx
│   │   │   ├── SupportDashboard.tsx
│   │   │   └── UserManagement.tsx
│   │   ├── CourseDetailsPage.tsx
│   │   ├── CourseLearning.tsx
│   │   ├── HomePage.tsx
│   │   ├── QuizTaking.tsx
│   │   └── StudentDashboard.tsx
│   ├── store/          # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── courseSlice.ts
│   │   │   └── userManagementSlice.ts
│   │   └── store.ts
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── vite-env.d.ts   # Vite type definitions
├── .env                # Environment variables
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json       # TypeScript config
└── vite.config.ts      # Vite config
```

## 📜 Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_URL=https://course-master-backend-chi.vercel.app/api

# Or for local development
# VITE_API_URL=http://localhost:5000/api
```

## 👥 User Roles

| Role           | Access Level | Description                                         |
| -------------- | ------------ | --------------------------------------------------- |
| **Student**    | Basic        | Enroll in courses, take quizzes, submit assignments |
| **Instructor** | Elevated     | Create courses, manage content, view analytics      |
| **Teacher**    | Elevated     | Similar to instructor with teaching focus           |
| **Moderator**  | High         | Moderate content, manage users                      |
| **Admin**      | Full         | Complete system access and management               |

## 🎯 Key Features by Role

### 👨‍🎓 Student Features

- ✅ Browse and enroll in courses
- ✅ Access course modules and lessons
- ✅ Take interactive quizzes with instant results
- ✅ Submit assignments (text or Google Drive links)
- ✅ Track learning progress
- ✅ View quiz history and scores
- ✅ Live chat support with instructors
- ✅ Personal dashboard

### 👨‍🏫 Instructor/Teacher Features

- ✅ Create and manage courses
- ✅ Design course modules and lessons
- ✅ Create quizzes with multiple-choice questions
- ✅ Assign and review assignments
- ✅ Provide feedback to students
- ✅ View student progress
- ✅ Respond to support requests

### 👨‍💼 Admin Features

- ✅ Complete user management
- ✅ Course approval and moderation
- ✅ Analytics dashboard with insights
- ✅ User role management
- ✅ System-wide statistics
- ✅ Support ticket management
- ✅ Platform configuration

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Responsive Layout** - Mobile, tablet, and desktop support
- **Toast Notifications** - Non-intrusive user feedback
- **Loading States** - Smooth user experience
- **Error Handling** - Graceful error messages
- **Form Validation** - Client-side validation
- **Accessibility** - WCAG compliant

## 🔌 API Integration

The frontend communicates with the backend via RESTful APIs and WebSocket connections:

- **REST API** - Course data, user management, assignments, quizzes
- **WebSocket** - Real-time chat, notifications
- **Authentication** - JWT-based with HTTP-only cookies

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

### Deployment Options

- **Vercel** (Recommended)
- **Netlify**
- **AWS S3 + CloudFront**
- **GitHub Pages**

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages
- Add comments for complex logic

## 🐛 Known Issues

- None currently reported

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Wahid**

- GitHub: [@wahid1099](https://github.com/wahid1099)

## 🙏 Acknowledgments

- React Team for the amazing framework
- Redux Toolkit for state management
- Vite for blazing fast builds
- All contributors and users

---

**Made with ❤️ for education**
