import type {Entity, ListResponse} from './common';
import type { Prisma } from '@prisma/client';

export interface User extends Entity {
  name: string;
  password_hash: string;
  roles: Prisma.JsonValue
}

export interface UserCreateInput {
  id: number;
  name: string;
  password: string;
}

export interface UserUpdateInput extends Pick<UserCreateInput, 'name'>{}

export interface RegisterUserRequest extends UserCreateInput{}
export interface UpdateUserRequest extends UserUpdateInput{}

export interface GetAllUsersResponse extends ListResponse<PublicUser>{}
export interface GetUserByIdResponse extends PublicUser {}
export interface CreateUserResponse extends GetUserByIdResponse {}
export interface UpdateUserResponse extends GetUserByIdResponse {}

export interface PublicUser extends Pick<User, 'id' | 'name'> {}

export interface LoginRequest {
  name: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface GetUserRequest {
  id: number | 'me';
}