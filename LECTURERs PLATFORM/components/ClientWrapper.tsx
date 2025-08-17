"use client";

import { ReactNode } from 'react';
import AuthGuardWrapper from './AuthGuardWrapper';

interface ClientWrapperProps {
  children: ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <AuthGuardWrapper>
      {children}
    </AuthGuardWrapper>
  );
} 