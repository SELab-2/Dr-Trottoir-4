import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import DuplicateScheduleModal from "@/components/calendar/duplicateScheduleModal";

describe("DuplicateScheduleModal", () => {
    let mockOnSubmit: jest.Mock, mockCloseModal: jest.Mock;
    beforeEach(() => {
        mockOnSubmit = jest.fn();
        mockCloseModal = jest.fn();
    });

    it("renders without crashing", () => {
        render(
            <DuplicateScheduleModal
                show={true}
                closeModal={mockCloseModal}
                title={"Test Title"}
                onSubmit={mockOnSubmit}
                weekStartsOn={0}
            />
        );
    });

    it("handles form submission", async () => {
        const { getByLabelText, getByText } = render(
            <DuplicateScheduleModal
                show={true}
                closeModal={mockCloseModal}
                title={"Test Title"}
                onSubmit={mockOnSubmit}
                weekStartsOn={0}
            />
        );

        // fireEvent.change(getByLabelText("Van start van week:"), { target: { value: "2023-05-01" } });
        // fireEvent.change(getByLabelText("Tot einde van week:"), { target: { value: "2023-05-07" } });
        // fireEvent.change(getByLabelText("Kopieer naar start van week:"), { target: { value: "2023-05-08" } });

        // Mock successful form submission
        mockOnSubmit.mockResolvedValue({});

        fireEvent.click(getByText("Dupliceer"));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled();
        });
    });

    it("closes the modal", () => {
        const { getByText } = render(
            <DuplicateScheduleModal
                show={true}
                closeModal={mockCloseModal}
                title={"Test Title"}
                onSubmit={mockOnSubmit}
                weekStartsOn={0}
            />
        );
        fireEvent.click(getByText("Annuleer"));
        expect(mockCloseModal).toHaveBeenCalled();
    });
});
