import React, { useEffect, useState } from 'react';
import ModalSharedComponent from './ModalSharedComponent';
import InputSharedComponent from './InputSharedComponent';
import ButtonSharedComponent from './ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from './PrimaryActionButtonSharedComponent';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';

export interface AdminLoginModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLoginModalController({
  isOpen,
  onClose,
}: AdminLoginModalControllerProps): React.JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = TanstackQueryClientService.current.admin.useAdminLoginMutation({
    onSuccess: () => {
      setEmail('');
      setPassword('');
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleLogin = async (): Promise<void> => {
    if (!email.trim() || !password) return;

    setErrorMessage(null);
    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to log in.');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' && email.trim() && password) {
      event.preventDefault();
      void handleLogin();
    }
  };

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Login"
      subtitle="Enter your admin credentials to continue."
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <ButtonSharedComponent variant="outline" onClick={onClose} disabled={loginMutation.isPending}>
            Cancel
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            label="Log In"
            onClick={() => void handleLogin()}
            disabled={!email.trim() || !password}
            isLoading={loginMutation.isPending}
          />
        </div>
      }
    >
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        <InputSharedComponent
          label="Email"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <InputSharedComponent
          label="Password"
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {errorMessage && <p className="text-xs text-rose-500">{errorMessage}</p>}
      </div>
    </ModalSharedComponent>
  );
}
