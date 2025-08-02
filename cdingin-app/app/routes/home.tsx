import { Welcome } from '../welcome/welcome';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'cdingin' },
    { name: 'description', content: 'Welcome to cdingin!' },
  ];
}

export default function Home() {
  return <Welcome />;
}
