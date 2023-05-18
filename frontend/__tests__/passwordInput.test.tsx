import {render, fireEvent, screen} from '@testing-library/react';
import PasswordInput from '@/components/password/passwordInput';

describe('PasswordInput', () => {
    it('renders without crashing', () => {
        render(
            <PasswordInput
                value=""
                setPassword={() => {
                }}
                handlePasswordVisibility={() => {
                }}
                showPassword={false}
                label="Password"
                placeholder="Enter your password"
                showIconButton={true}
            />
        );
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('triggers setPassword when input value changes', () => {
        const setPassword = jest.fn();
        render(
            <PasswordInput
                value=""
                setPassword={setPassword}
                handlePasswordVisibility={() => {
                }}
                showPassword={false}
                label="Password"
                placeholder="Enter your password"
                showIconButton={true}
            />
        );

        fireEvent.change(screen.getByLabelText('Password'), {target: {value: '123456'}});

        expect(setPassword).toHaveBeenCalledWith('123456');
    });

    it('triggers handlePasswordVisibility when visibility icon is clicked', () => {
        const handlePasswordVisibility = jest.fn();
        render(
            <PasswordInput
                value=""
                setPassword={() => {
                }}
                handlePasswordVisibility={handlePasswordVisibility}
                showPassword={false}
                label="Password"
                placeholder="Enter your password"
                showIconButton={true}
            />
        );

        fireEvent.click(screen.getByRole('button'));
        expect(handlePasswordVisibility).toHaveBeenCalledTimes(1);
    });

    it('shows password in plain text when showPassword is true', () => {
        render(
            <PasswordInput
                value="123456"
                setPassword={() => {
                }}
                handlePasswordVisibility={() => {
                }}
                showPassword={true}
                label="Password"
                placeholder="Enter your password"
                showIconButton={true}
            />
        );

        expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
    });

    it('shows password as hidden when showPassword is false', () => {
        render(
            <PasswordInput
                value="123456"
                setPassword={() => {
                }}
                handlePasswordVisibility={() => {
                }}
                showPassword={false}
                label="Password"
                placeholder="Enter your password"
                showIconButton={true}
            />
        );

        expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });
});
