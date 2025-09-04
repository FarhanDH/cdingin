# Increment 4: Communication Enhancement - Push Notification Integration

## Increment Goal

To provide proactive updates to customers by integrating a web push notification system. This feature aims to improve communication and customer experience by keeping them informed about their service order status.

---

### Core Features Implemented

- **Customer Opt-In:** A mechanism for customers to grant permission to receive notifications.
- **Automated Notifications:** The system automatically sends push notifications to the customer's device when a technician updates the order status (e.g., "Confirmed", "On The Way", "Completed").
- **Notification history:** Save and show the history of notifications sent to customers.
- **Backend Triggering Logic:** The backend is responsible for triggering notifications at the appropriate moments in the service workflow.

### Key Development Tasks

#### Backend (NestJS)

- [x] Integrate a push notification service (web-push).
- [x] Create a `NotificationsModule` to handle the logic for sending notifications.
- [x] Implement an endpoint for customers to subscribe to notifications, saving user subscription details (e.g., FCM token) linked to their user ID.
- [x] Modify the `OrdersService` (specifically the status update logic) to call the `NotificationsService` after a status is successfully changed.
- [x] Define notification content (title and body) for different status updates.

## 📝 API Endpoints Overview

The backend API is extended to support notification functionality.

| Method  | Endpoint                        | Role       | Description                                                               |
| :------ | :------------------------------ | :--------- | :------------------------------------------------------------------------ |
| `POST`  | `/push-subscriptions`           | Customer   | Subscribes the customer to receive push notifications.                    |
| `POST`  | `/orders/:id`                   | Customer   | Subscribes the customer's device to receive push notifications.           |
| `PATCH` | `/orders/:id/status` (Modified) | Technician | Updates the order status **and** triggers a notification to the customer. |

---

### Frontend (ReactJS)

- [x] Implement a `service-worker.js` to handle incoming push notifications in the background.
- [x] Create a notification utility or hook (`useNotifications`) to manage user permission, subscription, and display of notifications.
- [x] Implement a UI prompt asking the user for permission to send notifications upon their first relevant action (e.g., after placing an order).
- [x] Send the subscription token to the backend via the `POST /notifications/subscribe` endpoint.
- [x] Ensure the PWA can receive and display notifications even when the browser tab is not active.
- [x] Create notification page
- [x] Create notification card with mark if notification read or not

---

### Black Box Testing Scenarios

## Test Cases - Increment 4: Notification Integration

| Num. | Page                          | Scenario                                              | Expectation                                                                  |
| ---- | ----------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1    | Order List Page               | Customers Click the "+" button to create a new order  | The system displays a pop up to ask for a notification permission            |
| 2    | Order List Page               | Technician accesses the order list page               | The system displays a pop up to ask for a notification permission            |
| 3    | Order Creation Summary Page   | Customers create a new order                          | Technician receives a notification of a new order                            |
| 4    | Technician Order Summary Page | Technician updates the order status                   | Customer receives a notification of the order status                         |
| 5    | Bottom Navigation             | Technician and customer click the notification button | The system displays the notification history page                            |
| 6    | Notification Page             | Technician and customer click on a notification       | The system displays the order details according to the selected notification |

---

_This branch was created from `increment-3-maps-integration`. The next increment, `increment-5-invoice-and-payment`, will be branched off from here._
