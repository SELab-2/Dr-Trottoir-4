import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import { logout } from "@/lib/logout";
import Logout from "@/components/logout";

jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

jest.mock("@/lib/logout", () => ({
    logout: jest.fn(),
}));

describe("Logout", () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
        (logout as jest.Mock).mockResolvedValue({ status: 200 });
    });

    it("renders without crashing", () => {
        render(<Logout />);
        expect(screen.getByText("Log uit")).toBeInTheDocument();
    });

    it("opens modal on logout click", () => {
        render(<Logout />);
        fireEvent.click(screen.getByText("Log uit"));
        expect(screen.getByText("Zeker dat je wil uitloggen?")).toBeInTheDocument();
    });

    it("calls logout and router push on modal logout click", async () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: pushMock,
        });
        render(<Logout />);
        fireEvent.click(screen.getByText("Log uit")); // open the modal
        fireEvent.click(screen.getByText("Log uit", { selector: "button" })); // click on the logout button in the modal
        expect(logout).toHaveBeenCalled();

        // Use waitFor for asynchronous assertions
        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith("/login");
        });
    });
});
