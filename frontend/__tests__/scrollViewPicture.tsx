import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import PhotoSelector from "@/components/scrollViewPicture";

describe("PhotoSelector", () => {
    const photos = ["photo1.png", "photo2.png", "photo3.png"];

    it("renders without crashing", () => {
        const mockFn = jest.fn();
        render(<PhotoSelector photos={photos} onSelectionChange={mockFn} />);
        photos.forEach((photo) => {
            expect(screen.getByAltText(photo)).toBeInTheDocument();
        });
        expect(screen.getByText("Voeg toe")).toBeInTheDocument();
    });

    it("toggles photo selection", () => {
        const mockFn = jest.fn();
        render(<PhotoSelector photos={photos} onSelectionChange={mockFn} />);
        const image = screen.getByAltText(photos[0]);
        expect(image.parentElement).not.toHaveStyle("border: 3px solid blue");
        fireEvent.click(image);
        expect(image.parentElement).toHaveStyle("border: 3px solid blue");
        fireEvent.click(image);
        expect(image.parentElement).not.toHaveStyle("border: 3px solid blue");
    });

    it("calls onSelectionChange with selected photos", () => {
        const mockFn = jest.fn();
        render(<PhotoSelector photos={photos} onSelectionChange={mockFn} />);
        const image = screen.getByAltText(photos[0]);
        fireEvent.click(image);
        fireEvent.click(screen.getByText("Voeg toe"));
        expect(mockFn).toHaveBeenCalledWith([photos[0]]);
    });
});
