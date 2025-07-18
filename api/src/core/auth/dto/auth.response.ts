import { PartialType } from '@nestjs/mapped-types';
import { RoleEnum } from '~/common/enums/role.enum';
import { UserResponse } from '~/core/user/dto/user.response';

export class JwtPayload {
  sub: string;
  fullName: string;
  iss: string;
  role: RoleEnum;
}

export class VerifyOtpResponse extends PartialType(UserResponse) {
  isNewUser: boolean;
}
