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

### Black Box Testing Scenarios

## Test Cases - Increment 3: Service location coordinate, Technician position, and Open Street Maps integration

| No  | Page / Component   | Scenario                                                                                                                                | Expected Result                                                                                                                                                                                     |
| --- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Order List Page    | Customer or technician has not enabled GPS service.                                                                                     | Display a drawer requesting permission to enable GPS service.                                                                                                                                       |
| 2   | Location Form      | Customer sets the service location by pinning coordinates on the map.                                                                   | The coordinates are saved and the process continues to the next step.                                                                                                                               |
| 3   | Location Form      | Customer sets the service location outside the Samarinda area.                                                                          | Display an error message: “Service is not yet available in this area.”                                                                                                                              |
| 4   | Order Summary Page | Technician clicks one of the orders.                                                                                                    | Navigate to the order summary page with an interactive map.                                                                                                                                         |
| 5   | Order Summary Page | Technician clicks one of the orders.                                                                                                    | Navigate to the order summary page with an interactive map that shows both the service location and the technician’s current location.                                                              |
| 6   | Order Summary Page | Technician clicks the “Get Directions” button.                                                                                          | Open Google Maps navigation for the technician to reach the service location.                                                                                                                       |
| 7   | Order Summary Page | The technician slides the "I have met the customer" button, but the technician's location is still far from the service location point. | Displays the error message “Still about (distance) from the location. Try moving forward again.”                                                                                                    |
| 8   | Order Detail Page  | Technician or customer clicks one of the orders.                                                                                        | The system displays order details including customer name, phone number, issue, location details, AC type and unit count, building type, and service date. Also includes a button to update status. |

---

_This branch was created from `increment-2-technician-order-management`. The next increment, `increment-4-notifications`, will be branched off from here._
