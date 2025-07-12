# Increment 1: Core Foundation - Authentication & Basic Orders

## Increment Goal

To establish the foundational structure of the application, enabling Customers to register and log in, also as a Technician to log in. Customers will be able to create a basic service order, which will be stored in the database.

---

### Core Features Implemented

- User Registration for Customer role.
- User Login for Technician and Customer roles.
- User Login with role differentiation.
- JWT-based authentication for securing endpoints.
- Basic order creation form for customers (includes service description and desired date).
- A page for customers to view their own submitted orders.

### Technology Stack & Key Packages

- **Backend:** NestJS, PostgreSQL, TypeORM
- **Frontend:** ReactJS, TailwindCSS, Shadcn UI

---

### Key Development Tasks

#### Backend (NestJS)

- [x] Initialize NestJS project structure.
- [x] Configure database connection to PostgreSQL using TypeORM.
- [x] Create `User` and `Order` entities (database tables).
- [x] Implement `AuthModule` with `register` and `login` services.
- [x] Implement JWT strategy for authentication and create a guard to protect routes.
- [x] Implement `OrdersModule` with a `createOrder` service and a `findMyOrders` service.

#### Frontend (ReactJS)

- [x] Initialize ReactJS project.
- [x] Create pages: `LoginPage`, `RegisterPage`, `CreateOrderPage`, `MyOrdersPage`.
- [x] Create reusable components for forms and inputs.
- [x] Develop an API service layer to communicate with the backend.

---

### Black Box Testing Scenarios

1. **Registration:** A new user can successfully register as a Customer.
2. **Login:** A registered user can log in. An incorrect password attempt fails.
3. **Order Creation:** A logged-in customer can fill out the order form and submit it.
4. **Data Persistence:** The submitted order is correctly saved in the database.
5. **Order Viewing:** The customer can see a list of their submitted orders on the "My Orders" page.

---
