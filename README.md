# Mentor-Mentee Platform

A comprehensive web application that connects students with faculty mentors at Manipal University. The platform facilitates project mentorship requests, allowing students to find the right mentor for their academic projects and enabling faculty to manage their mentorship capacity.

## Features

### For Students
- **User Authentication** - Secure signup/signin with OTP-based email verification (Manipal University email required)
- **Profile Management** - Create and update profiles with academic details, skills, interests, and social links
- **Mentor Discovery** - Browse available faculty mentors filtered by skills and interests
- **Project Requests** - Submit detailed project proposals to mentors with methodology, tech stack, and timeline
- **Request Tracking** - View status of submitted requests (pending, approved, rejected, changes requested)
- **Notifications** - Real-time notifications for request status updates

### For Faculty/Teachers
- **Profile Management** - Set availability capacity (available, limited slots, full), skills, and interests
- **Request Management** - View, approve, reject, or request changes on student project proposals
- **Filtered Views** - Filter incoming requests by status or other criteria
- **Feedback System** - Provide feedback to students on their project proposals

### General Features
- **Dark/Light Theme** - Toggle between dark and light modes with system preference detection
-  **Responsive Design** - Mobile-friendly interface using Tailwind CSS
- **Secure Authentication** - JWT-based authentication with bcrypt password hashing
-  **Email Notifications** - OTP verification via Gmail SMTP

---
## Live Deployment

Check out the live version of the project here:  
🔗 https://tanishi.online/

---

##  Running the Project Locally

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **MongoDB** - Either:
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) (local installation)
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud-based, free tier available)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Fazetanish/Mentor-Mentee.git
cd Mentor-Mentee
```

### Step 2: Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   
   Create a `.env` file in the `backend` directory (you can copy from `env.example` in the root):
   ```bash
   cp ../env.example .env
   ```

4. **Configure environment variables:**
   
   Open the `.env` file and fill in your values:
   ```env
   # MongoDB Connection
   Mongo_URL=mongodb://localhost:27017/mentor-mentee
   # Or for MongoDB Atlas:
   # Mongo_URL=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/mentor-mentee

   # JWT Secret (use a strong, random string)
   JWT_Secret_User=your-super-secret-jwt-key-here

   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ```

   **📝 Setting up Gmail App Password:**
   1. Go to your [Google Account Security Settings](https://myaccount.google.com/security)
   2. Enable 2-Factor Authentication if not already enabled
   3. Go to "App passwords" (search in settings)
   4. Generate a new app password for "Mail"
   5. Use this 16-character password as `EMAIL_PASS`

5. **Start the backend server:**
   ```bash
   node index.js
   ```
   
   The backend server will start on `http://localhost:3000`
   
   You should see:
   ```
   Server running on port 3000
   Email configured for: your-email@gmail.com
   Email server is ready to send messages
   ```

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

### Step 4: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173/Mentor-Mentee
- **Backend API**: http://localhost:3000

---

##  Project Structure

```
Mentor-Mentee/
├── backend/
│   ├── DB/                     # MongoDB Schema Models
│   │   ├── user.js             # User model (students & teachers)
│   │   ├── student_profiles.js # Student profile details
│   │   ├── faculty_profiles.js # Faculty profile details
│   │   ├── project_requests.js # Project request model
│   │   └── notifications.js    # Notification model
│   ├── Routes/                 # Express Route Handlers
│   │   ├── User.js             # Auth & user profile routes
│   │   ├── Teacher.js          # Teacher-specific routes
│   │   ├── Projects.js         # Project request routes
│   │   └── Notifications.js    # Notification routes
│   ├── Middlewares/            # Express Middlewares
│   │   └── authJWT.js          # JWT authentication middleware
│   ├── index.js                # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── Components/         # React Components
│   │   │   ├── Dashboard.jsx   # Landing page
│   │   │   ├── Signin.jsx      # Sign in page
│   │   │   ├── Signup.jsx      # Sign up page
│   │   │   ├── Student_*.jsx   # Student-specific components
│   │   │   ├── Teacher_*.jsx   # Teacher-specific components
│   │   │   └── ...
│   │   ├── context/            # React Context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── App.jsx             # Main App component with routes
│   │   └── main.jsx            # React entry point
│   ├── index.html
│   ├── vite.config.js          # Vite configuration
│   └── package.json
│
├── env.example                 # Example environment variables
└── README.md
```

---

##  Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Zod | Input validation |
| Nodemailer | Email sending |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| Vite | Build tool & dev server |
| React Router | Client-side routing |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| Lucide React | Icons |
| Zod | Form validation |

---

##  API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user/send-otp` | Send OTP to email |
| POST | `/user/signup` | Register new user |
| POST | `/user/signin` | Login user |

### Student Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user/profile` | Create student profile |
| GET | `/user/profile` | Get own profile |
| PATCH | `/user/profile` | Update profile |

### Teacher Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/teacher/profile` | Create teacher profile |
| GET | `/teacher/profile` | Get own profile |
| PATCH | `/teacher/profile` | Update profile |
| GET | `/teacher/all` | Get all teachers |

### Project Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/project/request` | Submit project request |
| GET | `/project/requests` | Get own requests |
| PATCH | `/project/request/:id` | Update request status |

### Notification Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get all notifications |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/mark-all-read` | Mark all as read |

---

Made with ❤️ for Manipal University students and faculty
