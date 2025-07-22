import type { Route } from './+types/home';
import { Welcome } from '../welcome/welcome';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'cdingin' },
    { name: 'description', content: 'Welcome to cdingin!' },
  ];
}

export default function Home() {
  return <Welcome />;
}
