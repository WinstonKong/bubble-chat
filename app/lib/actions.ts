'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { addNewUser } from './data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Logger } from './utils';

export async function authenticateGuest() {
  try {
    await signIn('credentials', {
      redirectTo: '/bubble/chats',
      username: process.env.GUEST_NAME,
      password: process.env.GUEST_PASSWORD,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Invalid credentials.';
      }
    }
    throw error;
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', {
      redirectTo: '/bubble/chats',
      ...Object.fromEntries(formData),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Invalid credentials.';
      }
    }
    throw error;
  }
}

export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}

export async function signup(
  prevState: string | undefined,
  formData: FormData,
) {
  const data = Object.fromEntries(formData);
  try {
    const message = await addNewUser(data);
    if (message) {
      return message;
    }
  } catch (error) {
    Logger.error('signup error', error);
    return 'Something went wrong. Please try again.';
  }

  await signIn('credentials', {
    redirectTo: '/bubble/chats',
    ...Object.fromEntries(formData),
  });
}

export async function revalidateRoute(path: string) {
  revalidatePath(path);
}

export async function redirectTo(url: string) {
  redirect(url);
}

export async function logOut() {
  await signOut();
}
