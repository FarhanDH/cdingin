# cdingin ❄️ Servis AC jadi gampang, tinggal ngeklik doang!

**cdingin** is a modern, full-stack application designed to streamline the process of booking air conditioner (AC) servicing. Built with a robust backend and a reactive frontend, it connects customers needing AC maintenance with skilled technicians.

This project features a dual-role system (Customer and Technician), each with a tailored user experience, from multi-step authentication to order management and payment processing.

---

## ✨ Key Features

### For Customers

- **Multi-Step OTP Authentication:** Secure and seamless login/registration flow using email OTP. New users are guided to complete their profile, while existing users are taken directly to their dashboard.
- **Order Dashboard:** Easily track orders with a tabbed view for "In Progress," "Completed," and "Cancelled" statuses.
- **Detailed Order View:** Access comprehensive details for each service order.
- **Smart Multi-Step Booking Form:** An intuitive, step-by-step process to create a new service order:
  1. Select AC Problems/Services.
  2. Set Service Location.
  3. Specify AC Type, Capacity (PK), Brand, and Number of Units.
  4. Detail Property Type and Floor Location.
  5. Review a final Summary with a availability calendar.
- **Flexible Payments:** After service completion, customers can pay with cash or through the integrated Midtrans payment gateway.
- **Order Cancellation:** Ability to cancel an order with a specific reason.

### For Technicians

- **Secure OTP Authentication:** A simple and secure login process for technician.
- **Scheduled Order Dashboard:** View a list of jobs based on schedule: "Today," "Tomorrow," and "Upcoming."
- **Dynamic Status Updates:** Technicians can update the order status (e.g., `Confirmed`, `On The Way`, `On Working`, `Waiting for Payment`, `Completed`) using interactive swipe buttons.
- **In-App Invoicing:** Generate and submit a digital invoice/bill directly from the application after the work is done.
- **Order Cancellation:** Ability to cancel an order with a specific reason, which notifies the customer.

---

## 💻 Tech Stack

A modern and scalable stack chosen for performance and developer experience.

| Area         | Technology                                                           |
| :----------- | :------------------------------------------------------------------- |
| **Frontend** | React.js, React Router, Vite, Tailwind CSS, ShadCN/UI, Framer Motion |
| **Backend**  | NestJS, PostgreSQL, TypeORM                                          |
| **Payments** | Midtrans (Integration)                                               |

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed on your machine:

- Node.js (v18 or later recommended)
- pnpm (or npm/yarn)
- PostgreSQL (or Docker to run a Postgres container)

### Installation & Setup

The project is structured as a monorepo with `frontend` and `backend` directories.

**1. Clone the Repository**

```bash
git clone https://your-repository-url/cdingin.git
cd cdingin
```

**2. Backend Setup**

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
pnpm install

# Create a .env file from the example
cp .env.example .env
```

Now, open the `.env` file and fill in your environment variables:

```env
# .env for backend
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
JWT_ACCESS_SECRET="your-strong-jwt-access-secret"
JWT_REFRESH_SECRET="your-strong-jwt-refresh-secret"
# Add other variables for email service, SMS gateway, etc.
```

**3. Frontend Setup**

```bash
# Navigate to the frontend directory from the root
cd frontend

# Install dependencies
pnpm install

# Create a .env file from the example
cp .env.example .env
```

Now, open the `.env` file and set the backend API URL:

```env
# .env for frontend
VITE_API_URL="http://localhost:3000/api" # Adjust if your backend runs on a different port
```

### Running the Application

You will need two separate terminal windows to run both the frontend and backend servers.

**1. Run the Backend Server:**

```bash
# In the /backend directory
# Run database migrations
pnpm typeorm:migration:run

# Seed the database with initial data (e.g., the first technician)
pnpm seed

# Start the development server
pnpm start:dev
```

The backend should now be running, typically on `http://localhost:3000`.

**2. Run the Frontend Server:**

```bash
# In the /frontend directory
# Start the development server
pnpm dev
```

The frontend should now be running, typically on `http://localhost:5173`.

You can now open your browser and navigate to the frontend URL to use the application.

---

## 📝 API Endpoints Overview

The backend provides a RESTful API to support the application's functionality. Key endpoints include:

| Method  | Endpoint                          | Role       | Description                                      |
| :------ | :-------------------------------- | :--------- | :----------------------------------------------- |
| `POST`  | `/email/send-otp`                 | Public     | Sends an OTP to the user's email/phone.          |
| `POST`  | `/auth/verify-otp`                | Public     | Verifies OTP and logs in or starts registration. |
| `POST`  | `/auth/register-customer-profile` | Public     | Completes the profile for a new customer.        |
| `POST`  | `/orders`                         | Customer   | Creates a new service order.                     |
| `GET`   | `/orders`                         | Customer   | Gets a list of the customer's own orders.        |
| `GET`   | `/orders/:id`                     | Customer   | Gets the details of a specific customer order.   |
| `POST`  | `/orders/:id/cancel`              | Customer   | Cancels an order with a specific reason.         |
| `GET`   | `/technician/orders`              | Technician | Gets a list of orders for the technician.        |
| `GET`   | `/technician/orders/:id`          | Technician | Gets the details of any specific order.          |
| `POST`  | `/technician/orders/:id/cancel`   | Technician | Cancels an order with a specific reason.         |
| `PATCH` | `/orders/:id/status`              | Technician | Updates the status of an order.                  |
| `GET`   | `/schedules/availability`         | Customer   | Gets daily booking capacity for the calendar.    |

---

## 🗺️ Roadmap (Future Features)

`cdingin` is an evolving project. Here are some features planned for the future:

- [ ] Push notifications for order status updates.
- [ ] Real-time technician location tracking on a map.
- [ ] In-app chat between customer and technician.
- [ ] Customer reviews and technician ratings.
- [ ] Switch to WhatsApp OTP for phone number verification.
- [ ] Admin dashboard for analytics and management.

---
