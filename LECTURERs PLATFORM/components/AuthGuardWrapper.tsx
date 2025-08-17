"use client";
import { ReactNode } from 'react';
import { AuthProvider } from './auth-context';

interface AuthGuardWrapperProps {
  children: ReactNode;
}

export default function AuthGuardWrapper({ children }: AuthGuardWrapperProps) {
  return <AuthProvider>{children}</AuthProvider>;
} 