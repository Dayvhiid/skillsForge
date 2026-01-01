# SkillForge Free Academy Portal

A high-traffic onboarding system for the SkillForge Free Academy with PDF handbook reader, student management, and admin dashboard.

## 🚀 Features

### Student Portal
- **Registration & Authentication**: Secure JWT-based authentication with track selection
- **Handbook Reader**: PDF.js-powered reader with anti-piracy protections
- **Progress Tracking**: Automatic bookmark saving and reading progress
- **Track-Based Content**: Students only see handbooks for their selected track
- **Ad Placement Slots**: Reserved spaces for Google AdSense integration

### Admin Dashboard
- **Analytics**: Real-time statistics on students, handbooks, and engagement
- **Student Management**: View, filter, suspend, and delete students
- **Handbook Upload**: Easy PDF upload with metadata management
- **Track Filtering**: Filter students and handbooks by track

### Security Features
- **Anti-Download Protection**: Disabled right-click, Ctrl+S, Ctrl+P
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for all passwords
- **Rate Limiting**: Protection against brute-force attacks
- **Input Validation**: Server-side validation with express-validator

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🛠️ Installation

### 1. Clone or Navigate to Project
```bash
cd c:\laragon\www\skillForge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

The `.env` file has been created for you. Update these values:

<!-- ```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/skillforge

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=skillforge_secret_key_2026_change_in_production

# Admin Default Credentials
ADMIN_EMAIL=admin@skillforge.com
ADMIN_PASSWORD=SkillForge2026! -->
```

**⚠️ IMPORTANT**: Change the `JWT_SECRET` and `ADMIN_PASSWORD` in production!

### 4. Start MongoDB

Make sure MongoDB is running on your system:

**Windows (Laragon):**
- MongoDB should auto-start with Laragon
- Or manually start via Laragon control panel

**Manual Start:**
```bash
mongod
```

### 5. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 🎯 Usage

### First-Time Setup

1. **Start the server** - The default admin account will be created automatically
<!-- 2. **Login as admin**:
   - Go to: `http://localhost:5000/public/admin-login.html`
   - Email: `admin@skillforge.com`
   - Password: `SkillForge2026!`
   - **⚠️ Change this password immediately!** -->

3. **Upload handbooks**:
   - Navigate to the "Handbooks" tab
   - Upload PDF files for each track
   - Fill in title, description, track, and total pages

4. **Test student registration**:
   - Go to: `http://localhost:5000/public/register.html`
   - Register with any of the three tracks
   - Login and access handbooks

### Available Tracks

- **Financial Markets**
- **Web Development**
- **Photography**

## 📁 Project Structure

```
skillForge/
├── models/              # MongoDB schemas
│   ├── User.js         # Student model
│   ├── Admin.js        # Admin model
│   ├── Handbook.js     # Handbook model
│   └── ReadingProgress.js
├── routes/              # API routes
│   ├── auth.js         # Student authentication
│   ├── student.js      # Student portal
│   └── admin.js        # Admin panel
├── middleware/          # Express middleware
│   ├── auth.js         # JWT verification
│   └── upload.js       # File upload (Multer)
├── utils/               # Utility functions
│   ├── seedAdmin.js    # Admin account seeder
│   └── emailService.js # Email service (optional)
├── public/              # Frontend files
│   ├── css/
│   │   └── portal.css  # Shared styles
│   ├── register.html
│   ├── login.html
│   ├── student-dashboard.html
│   ├── handbook-reader.html
│   ├── admin-login.html
│   └── admin-dashboard.html
├── uploads/             # Uploaded handbooks
├── index.html           # Landing page
├── server.js            # Express server
├── package.json
└── .env                 # Environment variables
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login
- `GET /api/auth/me` - Get current student

### Student Portal
- `GET /api/student/dashboard` - Dashboard data
- `GET /api/student/handbooks` - Get handbooks for track
- `GET /api/student/handbook/:id` - Get specific handbook
- `POST /api/student/progress` - Update reading progress
- `GET /api/student/progress/:handbookId` - Get progress

### Admin Panel
- `POST /api/admin/login` - Admin login
- `GET /api/admin/students` - List students (with filters)
- `PUT /api/admin/students/:id` - Update student status
- `DELETE /api/admin/students/:id` - Delete student
- `POST /api/admin/handbooks` - Upload handbook
- `GET /api/admin/handbooks` - List handbooks
- `DELETE /api/admin/handbooks/:id` - Delete handbook
- `GET /api/admin/analytics` - Get analytics

## 🎨 Branding

- **Primary Color**: Deep Navy (#050B18)
- **Accent Color**: SkillForge Gold (#D4AF37)
- **Electric Blue**: #1E90FF
- **Cyan Glow**: #00E5FF

## 🚀 Deployment to Render

### 1. Prepare for Deployment

Update `.env` for production:
```env
NODE_ENV=production
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-strong-random-string>
```

### 2. Create Render Account
- Sign up at [render.com](https://render.com)

### 3. Deploy Steps

1. **Create New Web Service**
2. **Connect GitHub Repository** (or deploy from local)
3. **Configure Build Settings**:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add Environment Variables** (from your `.env`)
5. **Deploy**

### 4. File Storage Consideration

⚠️ Render's filesystem is ephemeral. For production:
- Use **Cloudinary** for PDF storage
- Or use **AWS S3**
- Update file upload logic accordingly

## 📧 Email Configuration (Optional)

To enable welcome emails:

1. Update `.env`:
```env
EMAIL_ENABLED=true
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

2. Generate Gmail App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"

## 🔧 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
# Windows: Start via Laragon or Services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=3000
```

### PDF Not Loading
- Check file path in database
- Ensure `uploads/` directory exists
- Verify file permissions

## 📝 Default Credentials

**Admin Account:**
- Email: `admin@skillforge.com`
- Password: `SkillForge2026!`

**⚠️ CHANGE THESE IMMEDIATELY AFTER FIRST LOGIN!**

## 🎯 Next Steps

1. **Upload Handbooks**: Add PDF handbooks for all three tracks
2. **Customize Branding**: Update colors and logos as needed
3. **Add Google AdSense**: Replace ad slot placeholders with real ads
4. **Email Integration**: Configure Gmail SMTP for welcome emails
5. **Production Deployment**: Deploy to Render with MongoDB Atlas

## 📄 License

Copyright © 2026 SkillForge Organization. All rights reserved.

## 🆘 Support

For issues or questions:
- Email: hello@skillforge.live
- Check server logs for errors
- Review MongoDB connection status

---

**Built with ❤️ for SkillForge Free Academy**
