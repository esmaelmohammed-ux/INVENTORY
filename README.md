# 🏢 Smart Inventory Management System

A modern, full-stack inventory management solution designed for organizations that need efficient tracking, management, and reporting of their inventory resources. Built with cutting-edge technologies and designed for scalability, security, and ease of use.

![Smart Inventory](./frontend/public/inv.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Smart Inventory Management System is a comprehensive solution that helps organizations manage their inventory efficiently. It features role-based access control, real-time tracking, automated reporting, and a modern responsive interface.

### Key Benefits
- **Real-time Inventory Tracking**: Monitor stock levels, movements, and status in real-time
- **Role-based Access Control**: Secure access with different permission levels
- **Automated Reporting**: Generate comprehensive reports in multiple formats
- **Requisition Management**: Streamlined request and approval workflows
- **Audit Trail**: Complete tracking of all system activities
- **Mobile Responsive**: Access from any device, anywhere

## Features

### 📊 Inventory Management
- **Item Tracking**: Add, edit, and monitor inventory items
- **Categories**: Organize items by categories for better management
- **Stock Levels**: Set minimum stock thresholds with automated alerts
- **Barcode Support**: Scan and track items using barcodes
- **Bulk Operations**: Perform batch updates and imports

### 📝 Requisition System
- **Request Creation**: Users can create requisition requests
- **Approval Workflow**: Multi-level approval system
- **Fulfillment Tracking**: Track request fulfillment status
- **Department Management**: Organize requests by departments

### 📈 Reporting & Analytics
- **Inventory Reports**: Stock levels, low stock alerts, category analysis
- **Transaction Reports**: Track all inventory movements
- **Requisition Reports**: Approval rates, fulfillment times
- **Audit Reports**: Complete system activity logs
- **Export Options**: PDF, CSV, and Excel formats

### 👥 User Management
- **Role-based Access**: Admin, Storekeeper, Procurement Officer, Department Head, Auditor
- **User Profiles**: Manage user information and preferences
- **Authentication**: Secure login with JWT tokens
- **Permission Control**: Granular permissions for different actions

### 🔐 Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Access control based on user roles
- **Audit Logging**: Track all system activities
- **Data Validation**: Server-side and client-side validation
- **HTTPS Support**: Secure data transmission

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Fast, minimalist web framework
- **Prisma**: Modern database toolkit and ORM
- **PostgreSQL**: Advanced open-source relational database
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing library
- **Express Validator**: Input validation and sanitization

### Frontend
- **React**: Modern JavaScript library for building user interfaces
- **Material-UI (MUI)**: React component library with Material Design
- **React Router**: Declarative routing for React applications
- **React Query**: Data fetching and state management
- **Axios**: Promise-based HTTP client
- **React Hook Form**: Performant forms with easy validation

### Development Tools
- **Vite**: Fast build tool and development server
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Nodemon**: Automatic server restart during development

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - Version control system

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 1GB free space
- **Network**: Internet connection for package installation

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-inventory-system.git
cd smart-inventory-system
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
cp .env.example .env
```

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
cp .env.example .env
```

##  Configuration

### Backend Configuration (`.env`)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/inventory_db"
DIRECT_URL="postgresql://username:password@localhost:5432/inventory_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend Configuration (`.env`)
```env
# API URL
VITE_API_URL=http://localhost:5000/api

# App Information
VITE_APP_NAME="Smart Inventory System"
VITE_APP_VERSION="1.0.0"
```

### Database Setup

1. **Create PostgreSQL Database**:
```sql
CREATE DATABASE inventory_db;
CREATE USER inventory_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO inventory_user;
```

2. **Run Migrations**:
```bash
cd backend
npx prisma migrate dev --name init
```

3. **Seed Database** (optional):
```bash
npx prisma db seed
```

## Usage

### Development Mode

1. **Start Backend Server**:
```bash
cd backend
npm run dev
```
Server will run on `http://localhost:5000`

2. **Start Frontend Development Server**:
```bash
cd frontend
npm run dev
```
Application will open on `http://localhost:3000`

### Production Build

1. **Build Frontend**:
```bash
cd frontend
npm run build
```

2. **Start Backend in Production**:
```bash
cd backend
npm start
```

### First-Time Setup

1. **Access the Application**: Navigate to `http://localhost:3000`
2. **Create Admin User**: Use the registration API endpoint or seed data
3. **Login**: Use your admin credentials
4. **Setup System**: Create departments, categories, and initial inventory

## API Documentation

### Authentication Endpoints
```http
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/profile
```

### Inventory Endpoints
```http
GET    /api/items
POST   /api/items
GET    /api/items/:id
PUT    /api/items/:id
DELETE /api/items/:id
```

### Requisition Endpoints
```http
GET    /api/requisitions
POST   /api/requisitions
GET    /api/requisitions/:id
PUT    /api/requisitions/:id
PATCH  /api/requisitions/:id/status
DELETE /api/requisitions/:id
POST   /api/requisitions/:id/fulfill
```

### Report Endpoints
```http
GET /api/reports/inventory
GET /api/reports/transactions
GET /api/reports/requisitions
GET /api/reports/audit
GET /api/reports/financial
```

### User Management Endpoints
```http
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

For detailed API documentation, visit `/api/docs` when the server is running.

## User Roles & Permissions

### 🔧 Admin
- Full system access
- User management
- System configuration
- All reports access
- Audit log access

### 📦 Storekeeper
- Inventory management
- Stock adjustments
- Requisition fulfillment
- Inventory reports
- Transaction logging

### 💼 Procurement Officer
- Requisition approval
- Vendor management
- Purchase orders
- Financial reports
- Audit reports

### 👨‍💼 Department Head
- Create requisitions
- View department inventory
- Department reports
- Team management

### 🔍 Auditor
- Read-only access to all data
- Audit reports
- System monitoring
- Compliance checking

## Project Structure

```
smart-inventory-system/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── lib/
│   │   └── index.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   ├── inv.svg
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── package.json
│   └── .env
├── docs/
├── README.md
└── package.json
```

##  Development

### Code Style
- **ESLint**: Enforces code quality and consistency
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Structured commit messages

### Development Commands

**Backend**:
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

**Frontend**:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
```

### Environment Setup
1. Install dependencies: `npm install`
2. Set up environment variables
3. Run database migrations
4. Start development servers

##  Testing

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Testing
```bash
cd frontend
npm test                   # Run tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user workflow testing

## Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

1. **Database Setup**: Set up PostgreSQL on your server
2. **Environment Variables**: Configure production environment
3. **Build Frontend**: `npm run build`
4. **Start Backend**: `npm start`
5. **Reverse Proxy**: Configure Nginx or Apache

### Cloud Deployment Options
- **Heroku**: Easy deployment with PostgreSQL addon
- **AWS**: EC2 + RDS deployment
- **DigitalOcean**: Droplet + Managed Database
- **Vercel/Netlify**: Frontend deployment with serverless backend

## Contributing

### Development Process
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Commit your changes: `git commit -m 'feat: add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Standards
- Follow existing code style
- Write meaningful commit messages
- Include tests for new features
- Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for detail.

### Troubleshooting

**Common Issues**:

1. **Database Connection Error**:
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Port Already in Use**:
   - Change PORT in .env file
   - Kill existing processes: `killall node`

3. **Frontend Build Errors**:
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

## Roadmap

### Version 2.0
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Automated reordering
- [ ] Supplier integration
- [ ] Multi-location support

### Version 2.1
- [ ] Barcode scanning
- [ ] IoT sensor integration
- [ ] Machine learning predictions
- [ ] Advanced workflows
- [ ] API marketplace

---

**Built with ❤️ for efficient inventory management**

