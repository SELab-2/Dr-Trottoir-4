import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { changePassword } from "@/lib/authentication";
import PasswordModal from "@/components/password/passwordModal";

// Mock the changePassword API function
jest.mock("@/lib/authentication", () => ({
    changePassword: jest.fn(),
}));

describe("PasswordModal", () => {
    let closeModal: jest.Mock;

    beforeEach(() => {
        closeModal = jest.fn();
        (changePassword as jest.Mock).mockResolvedValueOnce({});

        render(<PasswordModal show={true} closeModal={closeModal} />);
    });

    it("renders correctly", () => {
        expect(screen.getByText("Wijzig wachtwoord")).toBeInTheDocument();
        expect(screen.getByText("Huidig wachtwoord:")).toBeInTheDocument();
        expect(screen.getByText("Nieuw wachtwoord:")).toBeInTheDocument();
        expect(screen.getByText("Bevestig nieuw wachtwoord:")).toBeInTheDocument();
    });

    it("handles password change submission", async () => {
        fireEvent.change(screen.getByPlaceholderText("Voer uw huidige wachtwoord in"), {
            target: { value: "oldpassword" },
        });
        fireEvent.change(screen.getByPlaceholderText("Voer uw nieuwe wachtwoord in"), {
            target: { value: "newpassword" },
        });
        fireEvent.change(screen.getByPlaceholderText("Voer uw nieuwe wachtwoord opnieuw in"), {
            target: { value: "newpassword" },
        });

        fireEvent.click(screen.getByText("Opslaan"));

        await waitFor(() => {
            expect(changePassword).toHaveBeenCalledWith({
                old_password: "oldpassword",
                new_password1: "newpassword",
                new_password2: "newpassword",
            });
        });
    });
});
