import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

export default function Index() {
    return <Welcome />;
}
