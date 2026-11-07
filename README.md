# LearnHub – LMS Course Marketplace

A modern Learning Management System (LMS) frontend built with React and Vite. LearnHub provides a platform where students can explore courses, manage their learning activities, and access a personalized dashboard.

## 🚀 Features

### Authentication
- User registration and login
- User authentication using access tokens
- Protected routes
- Role-based access for students and administrators
- User profile management

### Course Marketplace
- Browse available courses
- View course details
- Explore course content and curriculum
- Search and filter courses
- Add and remove courses from wishlist

### Student Dashboard
- Personalized student dashboard
- My Learning section
- Learning progress overview
- Profile management
- Password management
- Certificates section
- Security settings

### Admin Dashboard
- Admin dashboard
- User management
- Course management
- Order and enrollment management
- Instructor management
- Category management
- Coupon management
- Notifications management

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI development |
| Vite | Development server and build tool |
| JavaScript | Application logic |
| React Router | Client-side routing |
| Axios | API communication |
| CSS | Styling and responsive layouts |
| React Hot Toast | Notifications |
| Lucide React | Icons |

## 📁 Project Structure

```text
learnhub-lms/
│
├── public/
│
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   └── ...
│   ├── context/
│   ├── layouts/
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── courses/
│   │   └── student/
│   ├── routes/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/manoj1916/learnhub-lms.git
```

### 2. Navigate to the project directory

```bash
cd learnhub-lms
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory.

```env
VITE_API_BASE_URL=https://mockapi-mauve.vercel.app
```

Use the appropriate API base URL for your environment. Never commit private credentials or secret keys.

### 5. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## 🏗️ Build for Production

To generate the production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🔗 API Integration

The frontend communicates with the LMS API using Axios.

API communication is organized through service modules to keep API requests separate from UI components.

The application integrates authentication, course marketplace, wishlist, and student dashboard functionality through API endpoints.


## 🔮 Future Improvements

- Responsive UI improvements
- Enhanced course filtering and search
- Improved learning analytics
- Additional accessibility improvements
- Production deployment and testing

## 👨‍💻 Author

**Manoj Kumar**

B.Tech – Computer Science and Engineering

GitHub: [@manoj1916](https://github.com/manoj1916)

---

⭐ If you find this project useful, consider giving it a star!