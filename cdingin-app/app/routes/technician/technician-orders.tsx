import TechnicianOrderList from "~/technician/order/order-list";
import type { Route } from "./+types/technician-orders";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Daftar pesanan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

export default function TechnicianOrders() {
    return (
        <div>
            <TechnicianOrderList />
        </div>
    );
}
