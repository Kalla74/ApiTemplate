import Router from '@koa/router';
import * as UserService from '../service/user';
import type { TemplateAppContext, TemplateAppState } from '../types/koa';
import type { KoaContext, KoaRouter } from '../types/koa';
import type {
  RegisterUserRequest,
  GetAllUsersResponse,
  GetUserByIdResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  LoginResponse,
  GetUserRequest,
} from '../types/user';
import type { IdParams } from '../types/common';
import Joi from 'joi';
import validate from '../core/validation';
import { authDelay, makeRequireRole, requireAuthentication } from '../core/auth';
import Role from '../core/roles';
import type { Next } from 'koa';

const getAllUsers = async (ctx: KoaContext<GetAllUsersResponse>) => {
  ctx.body = {
    items: await UserService.getAll(),
  };
};

getAllUsers.validationScheme = null;

const getUserById = async (
  ctx: KoaContext<GetUserByIdResponse, GetUserRequest>,
) => {
  const user = await UserService.getById(
    ctx.params.id === 'me'? ctx.state.session.userId : ctx.params.id,
  );
  ctx.status = 200;
  ctx.body = user;

};

getUserById.validationScheme = {
  params: {
    id: Joi.alternatives().try(
      Joi.number().integer().positive(),
      Joi.string().valid('me'),
    ),
  },
};

const RegisterUser = async (
  ctx: KoaContext<LoginResponse, void, RegisterUserRequest>,
) => {
  const token = await UserService.register(ctx.request.body);
  ctx.status = 200;
  ctx.body = { token };
};

RegisterUser.validationScheme = {
  body: {
    name: Joi.string(),
    password: Joi.string().min(12).max(128),
  },
};

const updateUser = async (
  ctx: KoaContext<UpdateUserResponse, IdParams, UpdateUserRequest>,
) => {
  ctx.body = await UserService.updateById(Number(ctx.params.id),{
    ...ctx.request.body,
  });
};

updateUser.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
  body: {
    name: Joi.string(),
  },
};

const deleteUser = async (ctx: KoaContext<void, IdParams>) => {
  UserService.deleteById(Number(ctx.params.id));
  ctx.status = 204;
};

deleteUser.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

deleteUser.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

const checkUserId = (ctx: KoaContext<unknown, GetUserRequest>, next: Next) => {
  const { userId, roles} = ctx.state.session;
  const { id } = ctx.params;

  if (id !== 'me' && id !== userId && !roles.includes(Role.ADMIN)){
    return ctx.throw(
      403,
      'You are not allowed to view this user\'s information',
      { code: 'FORBIDDEN'},
    );
  }
  return next();
};

export default (parent: KoaRouter) => {
  const router = new Router<TemplateAppState, TemplateAppContext>({
    prefix: '/users',
  });

  const requireAdmin = makeRequireRole(Role.ADMIN);

  router.get('/', requireAuthentication, validate(getAllUsers.validationScheme),checkUserId, getAllUsers);
  router.post('/',authDelay, validate(RegisterUser.validationScheme),RegisterUser);
  router.get('/:id', requireAuthentication, validate(getUserById.validationScheme), getUserById);
  router.put('/:id', requireAdmin, validate(updateUser.validationScheme),checkUserId,updateUser);
  router.delete('/:id',requireAdmin, validate(deleteUser.validationScheme),checkUserId, deleteUser);

  parent.use(router.routes()).use(router.allowedMethods());
};