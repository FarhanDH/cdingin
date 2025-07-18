# Increment 1: Core Foundation - Authentication & Basic Orders

## Increment Goal

To establish the foundational structure of the application, enabling Customers to register and log in using otp authentication. Customers will be able to create a basic service order, which will be stored in the database.

---

### Core Features Implemented

- User Authentication for Customer role.
- JWT-based authentication for securing endpoints.
- Basic order creation form for customers (includes ac problem, plain location, ac type & number of units, building type, and date service).
- A page for customers to view their own submitted orders.

### Technology Stack & Key Packages

- **Backend:** NestJS, PostgreSQL, TypeORM
- **Frontend:** ReactJS, TailwindCSS, Shadcn UI

---

### Key Development Tasks

#### Backend (NestJS)

- [x] Initialize NestJS project structure.
- [x] Configure database connection to PostgreSQL using TypeORM.
- [] Create `User` and `Order` entities (database tables).
- [] Implement JWT for authentication and create a guard to protect routes.
- [] Implement `OrdersModule`.

#### Frontend (ReactJS)

- [x] Initialize ReactJS project.
- [] Create pages: `Multi Step Authentication`, `CreateOrderPage`, `MyOrdersPage`.
- [] Develop an API service layer to communicate with the backend.

---

### Black Box Testing Scenarios

## Test Cases - Increment 1: Customer Authentication, Order Creation, and Order List

| No  | Form               | Scenario                                                      | Expected Result                                                                |
| --- | ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | Email Page         | User inputs email                                             | System sends OTP code to the provided email                                    |
| 2   | OTP Form           | User inputs valid OTP within time limit                       | System verifies OTP and redirects to order page or profile form if new user    |
| 3   | OTP Form           | User inputs wrong or expired OTP                              | System shows error message: "OTP is invalid or expired"                        |
| 4   | Profile Form       | New customer fills in name and phone number after OTP success | System saves profile and redirects to order page                               |
| 5   | Complaint Form     | Customer writes the service complaint (e.g., "AC leaking")    | Complaint is saved and proceeds to next step                                   |
| 6   | Location Form      | Customer fills in service location                            | Location is saved and proceeds to next step                                    |
| 7   | AC Type Form       | Customer selects AC type and number of units                  | AC data is saved and proceeds to next step                                     |
| 8   | Building Type Form | Customer selects building type and floor location             | Building info is saved and proceeds to next step                               |
| 9   | Service Date Form  | Customer selects service date                                 | Date is saved and proceeds to next step                                        |
| 10  | Order Summary      | Customer clicks "Create Order" button                         | System saves the order data to the database                                    |
| 11  | Order List Page    | Customer accesses order list page                             | System displays all previous orders made by the customer                       |
| 12  | Order Detail Page  | Customer clicks on an order item                              | System shows detailed order info: complaint, location, AC type, building, date |

---
