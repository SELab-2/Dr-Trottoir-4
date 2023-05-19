import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import SelectedBuildingList from "@/components/garbage/SelectedBuildingList";
import { BuildingInterface } from "@/lib/building";
import { getAllTours } from "@/lib/tour";

jest.mock("@/lib/tour", () => ({
    getAllTours: jest.fn(() =>
        Promise.resolve({
            data: [
                { id: 1, name: "Tour 1" },
                { id: 2, name: "Tour 2" },
            ],
        })
    ),
}));

jest.mock("@/lib/building", () => ({
    ...jest.requireActual("@/lib/building"),
    getAddress: jest.fn(() => "Building 1, Street 1, 12345, City 1"),
}));

describe("SelectedBuildingList Component", () => {
    const mockBuilding: BuildingInterface = {
        id: 1,
        syndic: 1,
        name: "Building 1",
        city: "City 1",
        postal_code: "12345",
        street: "Street 1",
        house_number: "1",
        bus: "1",
        client_number: "1",
        duration: "1",
        region: 1,
        public_id: "1",
    };

    const mockCloseModal = jest.fn();
    const mockRemoveBuilding = jest.fn();
    const mockRemoveTour = jest.fn();
    const mockRemoveAllBuildings = jest.fn();

    it("should render with initial state", async () => {
        render(
            <SelectedBuildingList
                show={true}
                closeModal={mockCloseModal}
                buildings={[mockBuilding]}
                selectedTours={{ 1: [mockBuilding] }}
                removeBuilding={mockRemoveBuilding}
                removeTour={mockRemoveTour}
                removeAllBuildings={mockRemoveAllBuildings}
            />
        );

        // Check if the getAllTours is called
        await waitFor(() => expect(getAllTours).toHaveBeenCalled());

        // Check if the building and tour are displayed
        expect(screen.getByText("Building 1, Street 1, 12345, City 1")).toBeInTheDocument();
        expect(screen.getByText("Tour 1")).toBeInTheDocument();
    });

    it("should remove a building when delete button is clicked", async () => {
        render(
            <SelectedBuildingList
                show={true}
                closeModal={mockCloseModal}
                buildings={[mockBuilding]}
                selectedTours={{ 1: [mockBuilding] }}
                removeBuilding={mockRemoveBuilding}
                removeTour={mockRemoveTour}
                removeAllBuildings={mockRemoveAllBuildings}
            />
        );

        // Check if the getAllTours is called
        await waitFor(() => expect(getAllTours).toHaveBeenCalled());

        // Check if the building is displayed
        expect(screen.getByText("Building 1, Street 1, 12345, City 1")).toBeInTheDocument();

        // Click on the delete button
        const deleteButtons = screen.getAllByRole("button");
        fireEvent.click(deleteButtons[0]); // Clicks the first delete button in the list

        // Check if the removeBuilding function is called
        expect(mockRemoveBuilding).toHaveBeenCalledWith(mockBuilding);
    });
});
