import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  // Public Routes
  route('', 'components/public-route.tsx', [
    index('routes/home.tsx'),
    route('/auth', 'routes/authentication.tsx'),
  ]),

  // Protected Routes
  route('', 'components/protected-route.tsx', [
    route('/orders', 'routes/customer-orders.tsx'),
    route('/order/new', 'routes/new-order.tsx'),
  ]),
] satisfies RouteConfig;
