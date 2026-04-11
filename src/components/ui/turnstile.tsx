"use client";

interface EmailValidatorProps {
  onValid: () => void;
  onInvalid: (reason: string) => void;
}

export function EmailValidator({ onValid, onInvalid }: EmailValidatorProps) {
  return null;
}
