import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from './Contact';
import { api } from '../api';

vi.mock('../api', () => ({ api: vi.fn() }));

async function fillForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('First Name'), ' Demo ');
  await user.type(screen.getByLabelText('Last Name'), ' Reviewer ');
  await user.type(screen.getByLabelText('Contact Number'), '555-0100');
  await user.type(screen.getByLabelText('Email Address'), 'demo@example.test');
  await user.type(screen.getByLabelText('Message'), ' Test portfolio message ');
  return user;
}

describe('Contact form', () => {
  beforeEach(() => vi.resetAllMocks());

  it('rejects whitespace-only input without calling the API', () => {
    const { container } = render(<Contact />);
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: '   ' } });
    fireEvent.submit(container.querySelector('form'));
    expect(screen.getByRole('alert')).toHaveTextContent('Fill in each field');
    expect(api).not.toHaveBeenCalled();
  });

  it('disables submission while sending, trims data, then displays the reference and clears fields', async () => {
    let complete;
    api.mockReturnValue(new Promise(resolve => { complete = resolve; }));
    render(<Contact />);
    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Send Message' }));
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    expect(api).toHaveBeenCalledExactlyOnceWith('contact-submissions', {
      method: 'POST', data: {
        firstName: 'Demo', lastName: 'Reviewer', phone: '555-0100',
        email: 'demo@example.test', message: 'Test portfolio message',
      },
    });
    complete({ submissionId: 'sample-reference' });
    expect(await screen.findByRole('status')).toHaveTextContent('sample-reference');
    expect(screen.getByLabelText('Message')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeEnabled();
  });

  it('shows an API error, preserves the message, and allows retry', async () => {
    api.mockRejectedValue(new Error('Service unavailable'));
    render(<Contact />);
    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Send Message' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable');
    expect(screen.getByLabelText('Message')).toHaveValue(' Test portfolio message ');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send Message' })).toBeEnabled());
  });
});
