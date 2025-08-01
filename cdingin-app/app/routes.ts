import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('/auth', 'routes/authentication.tsx'),
  route('/orders', 'routes/customer-orders.tsx'),
  route('/order/new', 'routes/new-order.tsx'),
] satisfies RouteConfig;
