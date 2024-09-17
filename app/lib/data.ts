'use server';

import bcrypt from 'bcrypt';
import { z } from 'zod';
import {
  createUser,
  DBUniqueConstraintError,
  getUser,
  getUserByUsername,
} from './db';
import { User } from '@prisma/client';
import { Logger } from './utils';

export async function addNewUser(userInfo: Record<string, unknown>) {
  const parsedInfo = z
    .object({
      username: z.string().min(1).max(63),
      nickname: z.string().min(1).max(63),
      password: z.string().min(6),
    })
    .safeParse(userInfo);

  if (parsedInfo.success) {
    const { username, nickname, password } = parsedInfo.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await createUser({
        username: username,
        nickname: nickname,
        password: hashedPassword,
        bio: '',
      });
      return;
    } catch (error) {
      if (error instanceof DBUniqueConstraintError) {
        return 'This username has already existed';
      }
      return 'Database Error: Failed to Create User';
    }
  }

  Logger.log('addNewUser: Invalid user info', parsedInfo.error);
  return 'Invalid user info.';
}

export async function getUserFrom(uid: string | undefined, username: string | undefined) {
  let user: User | null = null;
  if (uid !== undefined) {
    user = await getUser(uid);
  } else if (username !== undefined) {
    user = await getUserByUsername(username);
  }
  return user;
}
