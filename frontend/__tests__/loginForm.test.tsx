import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from "@/components/loginForm";
import {useRouter} from 'next/router';
import i18n from "@/i18n";

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('LoginForm', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            query: {},
            push: jest.fn(),
        });
        i18n.init();
    });

    test('renders LoginForm component', () => {
        render(<LoginForm/>);
        expect(screen.getByText('Login.')).toBeInTheDocument();
    });

    test('renders input field for email', () => {
        render(<LoginForm/>);
        const emailInput = screen.getByLabelText('E-mailadres');
        expect(emailInput).toBeInTheDocument();
    });

    test('renders input field for password', () => {
        render(<LoginForm/>);
        const passwordInput = screen.getByLabelText('Wachtwoord');
        expect(passwordInput).toBeInTheDocument();
    });

    test('renders login button', () => {
        render(<LoginForm/>);
        const loginButton = screen.getByRole('button', {name: /Login/i});
        expect(loginButton).toBeInTheDocument();
    });

    test('renders forgot password link', () => {
        render(<LoginForm/>);
        const forgotPasswordLink = screen.getByText(/Wachtwoord vergeten?/i);
        expect(forgotPasswordLink).toBeInTheDocument();
    });

    test('renders sign up link', () => {
        render(<LoginForm/>);
        const signUpLink = screen.getByText(/Registreer je hier!/i);
        expect(signUpLink).toBeInTheDocument();
    });

    test('able to type into email and password fields', async () => {
        const user = userEvent.setup()

        render(<LoginForm/>);
        const emailInput = screen.getByLabelText('E-mailadres');
        await user.type(emailInput, 'test@example.com');
        expect(emailInput).toHaveValue('test@example.com');

        const passwordInput = screen.getByLabelText('Wachtwoord');
        await user.type(passwordInput, 'mypassword');
        expect(passwordInput).toHaveValue('mypassword');
    });
});
