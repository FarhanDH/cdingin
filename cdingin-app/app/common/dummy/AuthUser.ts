import type { AuthUser } from '../AuthUser.type';

export const authUserDummy: AuthUser = {
  isNewUser: true,
  user: {
    id: 'dummy-id',
    email: 'dummy-email',
    fullName: 'dummy-fullName',
    avatarUrl: 'dummy-avatarUrl',
    phoneNumber: 'dummy-phoneNumber',
    role: 'dummy-role',
    createdAt: 'dummy-createdAt',
    updatedAt: 'dummy-updatedAt',
  },
  tokens: {
    accessToken: 'dummy-accessToken',
    refreshToken: 'dummy-refreshToken',
  },
};
