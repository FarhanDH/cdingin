# Increment 3: Location Accuracy - Maps Integration

## Increment Goal

To enhance the order creation and management process by integrating Maps for precise location pinning and route visualization.

---

### Core Features Implemented

- Interactive map in the customer's order form to pin the exact service location.
- Storage of latitude and longitude coordinates for each order.
- Display of the pinned location on a map in the technician's order detail view.
- A link for the technician to open the location in Maps for navigation.

### Technology Stack & Key Packages

- **Frontend:**
  - **Key Additions:** Maps API for JavaScript.

---

### Key Development Tasks

#### Backend (NestJS)

- [x] Modify the `Order` entity to include `latitude` and `longitude` fields.
- [x] Update the `createOrder` DTO and service to accept and store coordinates.
- [x] Ensure the `GET /orders/:id` endpoint returns the coordinate data.

#### Frontend (ReactJS)

- [x] Integrate the Maps API into the React application.
- [x] Develop an interactive map component where customers can place a marker.
- [x] Update the order form to include this map component.
- [x] Develop a static map component to display the location on the technician's order detail page.
- [x] Add a "Get Directions" button that links to `https://maps.google.com/?q=lat,lng`.

---

---

| No  | Page/Component               | Scenario                                                                    | Expected Result                                                                                                                                                   |
| --- | ---------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Order Creation Form          | Customer interacts with the map component to place a pin.                   | The map displays, and the customer can successfully place a marker at their desired service location.                                                             |
| 12  | Order Creation Form          | Customer submits an order after pinning a location.                         | The order is successfully created, and the `latitude` and `longitude` coordinates corresponding to the pinned location are stored in the database for that order. |
| 13  | Technician Order Detail Page | Technician views an order that has location coordinates.                    | The order detail page displays a static map showing the exact location pinned by the customer.                                                                    |
| 14  | Technician Order Detail Page | Technician clicks the "Get Directions" button on an order with coordinates. | A new browser tab or window opens, redirecting to Google Maps (or similar map service) with the `latitude` and `longitude` pre-filled for navigation.             |

---

_This branch was created from `increment-2-technician-dashboard`. The next increment, `increment-4-notifications`, will be branched off from here._
