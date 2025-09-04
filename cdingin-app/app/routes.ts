import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    // Public Routes
    route("", "components/public-route.tsx", [
        index("routes/home.tsx"),
        route("/auth", "routes/authentication.tsx"),
    ]),

    // Customer Routes
    route("", "components/customer-route.tsx", [
        route("/orders", "routes/customer/customer-orders.tsx"),
        route("/order/new", "routes/customer/new-order.tsx"),
        route("/order/:orderId", "routes/customer/customer-order-detail.tsx"),
        route("/notifications", "routes/notification.tsx"),
    ]),

    // Technician Routes
    route("", "components/technician-route.tsx", [
        route("/technician/orders", "routes/technician/technician-orders.tsx"),
        route(
            "/technician/order/:orderId",
            "routes/technician/technician-order-summary.tsx"
        ),
        route(
            "/technician/order/detail/:orderId",
            "routes/technician/technician-order-detail.tsx"
        ),
    ]),
] satisfies RouteConfig;
