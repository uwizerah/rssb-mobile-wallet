# Mobile Wallet API

This project is a backend API for a mobile wallet application, where users can create accounts, perform transactions, and receive notifications for their transactions. The system also generates account statements in PDF format.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
  - [Account Management](#account-management)
  - [Transactions](#transactions)
  - [Notifications](#notifications)
  - [Account Statement Generation](#account-statement-generation)
- [Installation](#installation)
  - [Local Setup](#local-setup)
  - [Docker Setup](#docker-setup)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)

## Technologies Used

- **NestJS** for building the backend API.
- **TypeORM** for database interaction.
- **PostgreSQL** as the database.
- **BullMQ** for background job processing (email notifications).
- **SendGrid** for sending email notifications.
- **pdf-lib** for PDF generation.
- **JWT** for authentication.
- **Docker** for containerized deployment.

## Features

### Account Management
- **User Registration**: Users can register with an email and password to create accounts.
- **Account Creation**: Users can create multiple accounts after registering.
- **Authentication**: Login and authentication using JWT.

### OAuth 2.0 Login
- **Google OAuth**: Users can log in using Google OAuth authentication. The OAuth flow is managed using the provided client ID, secret, and callback URL from the `.env` file.

### Transactions
- **Deposit Money**: Users can deposit money into their accounts.
- **Withdraw Money**: Users can withdraw money from their accounts.
- **Transfer Money**: Users can transfer money to another account using the recipient's email.
- **Transaction History**: Users can view their transaction history with filtering options.

### Notifications
- **Email Notifications**: Users receive email notifications for successful deposits, withdrawals, and transfers using SendGrid and BullMQ for job processing.

### Account Statement Generation
- **Generate PDF Statements**: Users can generate an account statement in PDF format, listing all transactions in their account.
- **PDF-Lib**: This library is used to generate the PDF for account statements.

## Installation

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd mobile-wallet-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Create a `.env` file at the root of the project with the following variables:
     ```
     JWT_SECRET=your_jwt_secret_key_here
     OAUTH_CLIENT_ID=your_google_oauth_client_id_here
     OAUTH_CLIENT_SECRET=your_google_oauth_client_secret_here
     OAUTH_CALLBACK_URL=http://localhost:3000/auth/callback  # Or your deployed URL
     DATABASE_HOST=localhost  # If you're using a local database, otherwise use your database host
     DATABASE_PORT=5432  # Default PostgreSQL port
     DATABASE_USERNAME=your_postgresql_username
     DATABASE_PASSWORD=your_postgresql_password
     DATABASE_NAME=your_db_name
     SENDGRID_API_KEY=your_sendgrid_api_key_here
     SENDGRID_FROM_EMAIL=your_verified_sendgrid_email_here
     REDIS_HOST=localhost
     REDIS_PORT=6379  # Default Redis port
     ```

4. **Run the development server**:
   ```bash
   npm run start:dev
   ```

### Docker Setup

1. **Build and run the Docker containers**:
   ```bash
   docker-compose up --build
   ```

2. The API should be available at `http://localhost:3000`.

## API Endpoints

### Authentication
- **POST** `/auth/signup`: Register a new user.
- **POST** `/auth/login`: Log in to get a JWT.
- **GET** `/auth/google`: Initiate OAuth login with Google.
- **GET** `/auth/callback`: OAuth callback URL to handle login success/failure.

### Account Management
- **POST** `/accounts/create`: Create a new account for the logged-in user.
- **GET** `/accounts/:id/balance`: Get accounts balance

### Transactions
- **PATCH** `/accounts/:id/deposit`: Deposit money into an account.
- **PATCH** `/accounts/:id/withdraw`: Withdraw money from an account.
- **PATCH** `/accounts/:id/transfer`: Transfer money to another account using recipient's email.
- **GET** `/transactions/:id/history`: Get transaction history with filters (e.g., date range, transaction type, etc.).

### Account Statement
- **GET** `/accounts/statement/:id`: Generate and download a PDF account statement.


## Running Tests

1. **Run all tests**:
   ```bash
   npm run test
   ```

2. **Run tests with coverage**:
   ```bash
   npm run test:cov
   ```
