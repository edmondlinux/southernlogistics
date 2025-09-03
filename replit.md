# Reptile Global - Worldwide Reptile Shipping Platform

## Overview

Reptile Global is a comprehensive e-commerce and logistics platform designed specifically for worldwide reptile shipping and transportation. The application provides secure tracking services, user authentication, KYC verification, contact management, and payment processing through Stripe. It features a modern web interface with mobile responsiveness and internationalization support for multiple languages.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with Vite build system for fast development and optimized production builds
- **State Management**: Zustand for lightweight, scalable state management across components
- **Routing**: React Router v6 for client-side navigation and protected routes
- **Styling**: TailwindCSS for utility-first styling with responsive design patterns
- **UI Components**: Custom components built with Lucide React icons and Framer Motion animations
- **Maps Integration**: Mapbox GL for interactive mapping features and location services

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using ES modules
- **Database**: MongoDB with Mongoose ODM for flexible document-based data storage
- **Authentication**: Cookie-based session management with bcrypt password hashing
- **File Storage**: Cloudinary for image upload and management, particularly for KYC document processing
- **Email Service**: Nodemailer with SMTP configuration for transactional emails
- **PDF Generation**: Puppeteer for server-side PDF generation of tracking reports

### Data Storage Solutions
- **Primary Database**: MongoDB for user accounts, shipments, KYC submissions, and tracking data
- **Caching Layer**: Redis (ioredis) for session management and performance optimization
- **File Storage**: Cloudinary cloud storage for user-uploaded documents and images
- **Browser Storage**: LocalStorage for user preferences and client-side state persistence

### Authentication and Authorization
- **Session Management**: HTTP-only cookies for secure session handling
- **Role-Based Access**: Two-tier system with 'customer' and 'admin' roles
- **Route Protection**: Middleware-based authentication for protected endpoints
- **Password Security**: bcryptjs for secure password hashing and verification

## External Dependencies

### Core Infrastructure
- **Cloud Storage**: Cloudinary for image and document management with signed upload URLs
- **Email Service**: SMTP-based email delivery through Nodemailer for notifications and communications
- **Maps Service**: Mapbox GL for location services and interactive mapping features
- **Payment Processing**: Stripe integration for secure payment handling and transaction management

### Development and Build Tools
- **Build System**: Vite for frontend bundling with hot module replacement
- **Development Server**: Nodemon for backend development with automatic reloading
- **Linting**: ESLint with React-specific rules for code quality enforcement
- **PDF Generation**: Puppeteer for headless browser-based PDF creation

### Third-Party Libraries
- **UI Libraries**: React Hot Toast for notifications, React Confetti for celebrations, Recharts for data visualization
- **Internationalization**: i18next with browser language detection for multi-language support (English, Chinese, Malay, Korean, French, Spanish, German, Dutch)
- **HTTP Client**: Axios for API communications with request/response interceptors
- **Animation**: Framer Motion for smooth UI animations and transitions

### Optional Integrations
- **Redis**: Optional caching layer that gracefully degrades if not available
- **PWA Features**: Service worker implementation for offline capabilities and app-like experience
- **Google Maps**: React Google Maps API as alternative mapping solution