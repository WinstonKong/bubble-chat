import { PrismaClient, UserType } from '@prisma/client';
import { type UserCreateInfo } from './types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Logger } from './utils';

const prisma = new PrismaClient();

const FailedCodeUniqueConstraint = 'P2002';
const UserUsernameKey = 'User_username_key';

export class DBUniqueConstraintError extends Error {}

function isFailedUniqueConstraint(error: any, key: string) {
  return (
    error instanceof PrismaClientKnownRequestError &&
    error.code === FailedCodeUniqueConstraint &&
    error.meta?.target === key
  );
}

export async function createUser(userInfo: UserCreateInfo) {
  try {
    const result = await prisma.user.create({
      data: { ...userInfo, userType: UserType.User },
    });
    return result;
  } catch (e) {
    if (isFailedUniqueConstraint(e, UserUsernameKey)) {
      throw new DBUniqueConstraintError('username');
    }
    Logger.log('createUser failed', e);
    throw e;
  }
}

export async function getUser(uid: string) {
  return await prisma.user.findUnique({
    where: {
      id: uid,
    },
  });
}

export async function getUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
}
