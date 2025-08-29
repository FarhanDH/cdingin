# Increment 4: Communication Enhancement - Push Notification Integration

## Increment Goal

To provide proactive updates to customers by integrating a web push notification system. This feature aims to improve communication and customer experience by keeping them informed about their service order status.

---

### Core Features Implemented

- **Customer Opt-In:** A mechanism for customers to grant permission to receive notifications.
- **Automated Notifications:** The system automatically sends push notifications to the customer's device when a technician updates the order status (e.g., "Confirmed", "On The Way", "Completed").
- **Backend Triggering Logic:** The backend is responsible for triggering notifications at the appropriate moments in the service workflow.

### Key Development Tasks

#### Backend (NestJS)

- [x] Integrate a push notification service (web-push).
- [x] Create a `NotificationsModule` to handle the logic for sending notifications.
- [x] Implement an endpoint for customers to subscribe to notifications, saving their subscription details (e.g., FCM token) linked to their user ID.
- [x] Modify the `OrdersService` (specifically the status update logic) to call the `NotificationsService` after a status is successfully changed.
- [x] Define notification content (title and body) for different status updates.

## 📝 API Endpoints Overview

The backend API is extended to support notification functionality.

| Method  | Endpoint                        | Role       | Description                                                               |
| :------ | :------------------------------ | :--------- | :------------------------------------------------------------------------ |
| `POST`  | `/notifications/subscribe`      | Customer   | Subscribes the customer's device to receive push notifications.           |
| `PATCH` | `/orders/:id/status` (Modified) | Technician | Updates the order status **and** triggers a notification to the customer. |

---

### Frontend (ReactJS)

- [x] Implement a `service-worker.js` to handle incoming push notifications in the background.
- [x] Create a notification utility or hook (`useNotifications`) to manage user permission, subscription, and display of notifications.
- [x] Implement a UI prompt asking the user for permission to send notifications upon their first relevant action (e.g., after placing an order).
- [x] Send the subscription token to the backend via the `POST /notifications/subscribe` endpoint.
- [x] Ensure the PWA can receive and display notifications even when the browser tab is not active.

---

### Black Box Testing Scenarios

## Test Cases - Increment 4: Notification Integration

| No  | Page/Component       | Scenario                                                                                                                                | Expected Result                                                                                                                |
| --- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Customer App (Any)   | A first-time customer who has placed an order is prompted to allow notifications.                                                       | A browser permission dialog appears. If the customer clicks "Allow", their subscription is sent to the backend.                |
| 2   | Technician Dashboard | A technician changes an order's status from "Pending" to "Confirmed".                                                                   | The customer who owns the order receives a push notification with a message like "Your service order #123 has been confirmed." |
| 3   | Technician Dashboard | A technician changes an order's status to "On The Way".                                                                                 | The customer receives a push notification with a message like "Our technician is on the way to your location!"                 |
| 4   | Technician Dashboard | A technician changes an order's status to "Completed".                                                                                  | The customer receives a push notification with a message like "Service for order #123 is complete. Please check your invoice." |
| 5   | Customer App (BG)    | The customer's browser or PWA is in the background (not the active tab/window) when a technician updates the order status.              | The notification is still successfully received and displayed by the device's operating system.                                |
| 6   | Customer App         | A customer has previously denied notification permissions and the system tries to send one.                                             | No notification is sent, and the system handles the absence of a subscription token gracefully without errors.                 |
| 7   | Multi-Device Test    | A customer is logged in on two devices (e.g., laptop and phone) and has enabled notifications on both. A technician updates the status. | Both devices receive the push notification.                                                                                    |

---

_This branch was created from `increment-3-maps-integration`. The next increment, `increment-5-invoice-and-payment`, will be branched off from here._
