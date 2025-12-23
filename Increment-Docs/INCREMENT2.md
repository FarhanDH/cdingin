# Increment 2: Technician-Side Functionality - Order Management

## Increment Goal

To build the core functionality for the Technician role. This includes a page to view and manage orders.

---

### Core Features Implemented

- Technician page to view all incoming orders.
- Ability for technicians to view the details of a specific order.
- Ability for technicians to change the status of an order (e.g., from 'Pending' to 'Confirmed' or 'Cancelled').

### Key Development Tasks

#### Backend (NestJS)

## 📝 API Endpoints Overview

The backend provides a RESTful API to support the application's functionality. Key endpoints include:

| Method  | Endpoint                                                            | Role       | Description                                          |
| :------ | :------------------------------------------------------------------ | :--------- | :--------------------------------------------------- |
| `GET`   | `/schedules/availability?start-date=YYYY-MM-DD&end-date=YYYY-MM-DD` | Customer   | Gets daily booking capacity for the calendar.        |
| `GET`   | `/orders/technician?service-date=today, tomorrow, upcoming`         | Technician | Gets a list technician's schedule for a specific day |
| `GET`   | `/orders/technician`                                                | Technician | Gets a list of orders for the technician.            |
| `GET`   | `/technician/orders/:id`                                            | Technician | Gets the details of any specific order.              |
| `PATCH` | `/technician/orders/:id/cancel`                                     | Technician | Cancels an order with a specific reason.             |
| `PATCH` | `/orders/:id/status`                                                | Technician | Updates the status of an order.                      |

---

#### Frontend (ReactJS)

- [x] Create `TechnicianDashboardPage` to display a list of all service orders.
- [x] Create a `OrderDetailPage` for technicians.
- [x] Implement UI elements (buttons, dropdowns) for changing an order's status.
- [x] Integrate a calendar component to display the technician's schedule.

---

### Black Box Testing Scenarios

## Test Cases - Increment 2: Technician Order Management

| No  | Page/Component        | Scenario                                                                                        | Expected Result                                                                                                                                                        |
| --- | --------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Technician Login      | Technician logs in using their credentials (e.g., email/OTP).                                   | System authenticates the technician and redirects to the Technician Dashboard.                                                                                         |
| 2   | Technician Dashboard  | Technician views the order list after login.                                                    | System displays a list of all assigned orders, possibly filtered by "Today" by default.                                                                                |
| 3   | Technician Dashboard  | Technician filters orders by schedule (`today`, `tomorrow`, `upcoming`).                        | The order list updates to show only orders scheduled for the selected period, based on the API response.                                                               |
| 4   | Order Detail Page     | Technician clicks on an order from the dashboard.                                               | System navigates to the Order Detail Page, showing comprehensive information for that specific order.                                                                  |
| 5   | Order Status Update   | On the Order Detail Page, technician updates the status (e.g., to "Confirmed", "On The Way").   | The order status is successfully updated via `PATCH /orders/:id/status`. The UI reflects the new status.                                                               |
| 6   | Order Cancellation    | Technician cancels an order from the detail page and provides a reason.                         | The order status is changed to "Cancelled" via `PATCH /orders/technician/:id/cancel`. The customer is notified.                                                        |
| 7   | Access Control        | A logged-in customer attempts to access a technician-specific URL (e.g., `/technician/orders`). | System returns a `404 Not Found` error or redirects the customer to their own dashboard.                                                                               |
| 8   | Schedule Availability | A customer views the booking calendar after a technician has confirmed several orders.          | The calendar correctly shows dates as fully booked or with reduced capacity based on total AC units per day (Maximum 10 units per day), based on technician schedules. |

---

_This branch was created from `increment-1-auth-and-basic-orders`. The next increment, `increment-3-google-maps-integration`, will be branched off from here._
