import RoleBasedRoute from './role-based-route';

/**
 * This Component is layout wrapper specifically only allowing user with 'customer' role to access routes in it
 */
export default function CustomerRoute() {
  return <RoleBasedRoute allowedRoles={['customer']} />;
}
