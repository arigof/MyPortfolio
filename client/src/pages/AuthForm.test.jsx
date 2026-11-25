import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthForm from './AuthForm';
import { api } from '../api';

vi.mock('../api', () => ({ api: vi.fn() }));
beforeEach(() => vi.resetAllMocks());

it('validates missing registration details without creating a session', () => {
  const onSession = vi.fn();
  const { container } = render(<MemoryRouter><AuthForm mode="signup" onSession={onSession} /></MemoryRouter>);
  fireEvent.submit(container.querySelector('form'));
  expect(screen.getByRole('alert')).toHaveTextContent('Enter the required details');
  expect(api).not.toHaveBeenCalled();
  expect(onSession).not.toHaveBeenCalled();
});

it('shows an invalid-sign-in response without accepting a session', async () => {
  api.mockRejectedValue(new Error('Invalid email or password.'));
  const onSession = vi.fn();
  const { container } = render(<MemoryRouter><AuthForm mode="signin" onSession={onSession} /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'demo@example.test' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-only-password' } });
  fireEvent.submit(container.querySelector('form'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
  expect(onSession).not.toHaveBeenCalled();
});
