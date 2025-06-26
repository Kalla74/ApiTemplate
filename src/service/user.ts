import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import type { User, UserUpdateInput, PublicUser, RegisterUserRequest } from '../types/user';
import handleDBError from './_handleDBError';
import { hashPassword, verifyPassword } from '../core/password';
import { generateJWT,verifyJWT } from '../core/jwt';
import Role from '../core/roles';
import jwt from 'jsonwebtoken';
import { getLogger } from '../core/logging'; 
import type { SessionInfo } from '../types/auth';

const makeExposedUser = ({id,name} : User) : PublicUser => ({
  id,
  name,
});

export const checkAndParseSession = async (
  authHeader?: string,
): Promise<SessionInfo> => {
  if (!authHeader) {
    throw ServiceError.unauthorized('You need to be signed in');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw ServiceError.unauthorized('Invalid authentication token');
  }

  const authToken = authHeader.substring(7);

  try {
    const { roles, sub } = await verifyJWT(authToken); 

    return {
      userId: Number(sub),
      roles,
    };
  } catch (error: any) {
    getLogger().error(error.message, { error });
    if (error instanceof jwt.TokenExpiredError) {
      throw ServiceError.unauthorized('The token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw ServiceError.unauthorized(
        `Invalid authentication token: ${error.message}`,
      );
    } else {
      throw ServiceError.unauthorized(error.message);
    }
  }
};

export const checkRole = (role: string, roles: string[]): void => {
  const hasPermission = roles.includes(role);

  if(hasPermission) {
    throw ServiceError.forbidden('You are not allowd to view this part of the application');
  }
};

export const login = async (
  name: string,
  password: string,
): Promise<string> => {
  const user = await prisma.user.findUnique({ 
    where: {
      name: name,
    },
  },
  );

  if(!user){
    throw ServiceError.unauthorized('the give name and password do not match');
  }

  const passwoordValid = await verifyPassword(password, user.password_hash);

  if(!passwoordValid){
    throw ServiceError.unauthorized('the given name and password do not match');
  }

  return await generateJWT(user);
};

export const getAll = async (): Promise<PublicUser[]> => {
  const users =  prisma.user.findMany();
  const transformedUsers = (await users).map(makeExposedUser);
  return transformedUsers;
};

export const getById = async (id: number): Promise<PublicUser>  => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  if(!user){
    throw ServiceError.notFound('No user with this id exists');
  }
  return makeExposedUser(user);
};

export const register = async ( {name, password} : RegisterUserRequest): Promise<string> => {
  try{
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        password_hash: passwordHash,
        roles: [Role.USER],
      },
    });

    if(!user){
      throw ServiceError.internalServerError('An unexpected error occured when creating the user');
    }
    return await generateJWT(user);
  }catch(error: any){
    throw handleDBError(error);
  }
};

export const updateById = async (id: number, user : UserUpdateInput) : Promise<PublicUser> => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });
    
  if(!existingUser){
    throw ServiceError.notFound('No user with this id exists');
  }

  return makeExposedUser(await prisma.user.update({
    where: {
      id,
    },
    data: user,
  }));
};

export const deleteById = async (id: number) => {
  await prisma.user.delete({
    where: {
      id,
    },
  });
};

