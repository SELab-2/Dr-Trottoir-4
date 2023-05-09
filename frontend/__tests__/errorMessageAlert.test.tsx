// __tests__/ErrorMessageAlert.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorMessageAlert from "@/components/errorMessageAlert";


describe('ErrorMessageAlert', () => {
  it('renders error messages when present', () => {
    const errorMessages = ['Error 1', 'Error 2'];
    const mockSetErrorMessages = jest.fn();

    render(<ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={mockSetErrorMessages} />);

    errorMessages.forEach((message) => {
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  });

  it('does not render when there are no error messages', () => {
    const errorMessages: string[] = [];
    const mockSetErrorMessages = jest.fn();

    render(<ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={mockSetErrorMessages} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
