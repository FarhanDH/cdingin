import {
    type RouteConfig,
    index,
    layout,
    route,
} from "@react-router/dev/routes";

export default [
    // Public Routes
    route("", "components/public-route.tsx", [
        index("routes/home.tsx"),
        route("/auth", "routes/authentication.tsx"),
    ]),

    // Customer Routes
    route("", "components/customer-route.tsx", [
        layout("routes/customer/layout.tsx", [
            route("/orders", "routes/customer/customer-orders.tsx"),
            route("/notifications", "routes/customer/notification.tsx"),
            route("/profile", "routes/customer/profile.tsx"),
        ]),

        route("/order/new", "routes/customer/new-order.tsx"),
        route("/order/:orderId", "routes/customer/customer-order-detail.tsx"),
    ]),

    // Technician Routes
    route("", "components/technician-route.tsx", [
        layout("routes/technician/layout.tsx", [
            route(
                "/technician/orders",
                "routes/technician/technician-orders.tsx"
            ),
            route(
                "/technician/notifications",
                "routes/technician/notification.tsx"
            ),
        ]),

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
