import { createAuthClient } from "better-auth/react";
import type { LoginCredentials, RegisterCredentials, ResetPasswordCredentials, NewPasswordCredentials } from "../types";

export const authClient = createAuthClient();

export async function login(credentials: LoginCredentials) {
  const { error } = await authClient.signIn.email({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    throw new Error(error.message ?? "Invalid email or password");
  }
}

export async function register(credentials: RegisterCredentials) {
  const { error } = await authClient.signUp.email({
    email: credentials.email,
    password: credentials.password,
    name: credentials.email.split("@")[0],
  });

  if (error) {
    throw new Error(error.message ?? "Registration failed");
  }
}

export async function requestPasswordReset(credentials: ResetPasswordCredentials) {
  const { error } = await authClient.requestPasswordReset({
    email: credentials.email,
    redirectTo: `${window.location.origin}/new-password`,
  });

  if (error) {
    throw new Error(error.message ?? "Failed to send reset email");
  }
}

export async function updatePassword(credentials: NewPasswordCredentials, token?: string) {
  if (!token) {
    throw new Error("Missing reset token");
  }

  const { error } = await authClient.resetPassword({
    newPassword: credentials.password,
    token,
  });

  if (error) {
    throw new Error(error.message ?? "Failed to update password");
  }
}

export async function signOut() {
  await authClient.signOut();
}
