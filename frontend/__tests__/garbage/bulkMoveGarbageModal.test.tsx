import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { bulkMoveGarbageCollectionSchedule, GarbageCollectionInterface } from "@/lib/garbage-collection";
import { formatDate } from "@/lib/date";
import { addDays } from "date-fns";
import BulkMoveGarbageModal from "@/components/garbage/BulkMoveGarbageModal";
import userEvent from "@testing-library/user-event";
import { getBuildingInfo } from "@/lib/building";
import { AxiosResponse } from "axios";

// Mock the bulkMoveGarbageCollectionSchedule API function
jest.mock("@/lib/garbage-collection", () => ({
    bulkMoveGarbageCollectionSchedule: jest.fn(),
    garbageTypes: { testType: "Test Type" },
}));

describe("BulkOperationModal", () => {
    let closeModal: jest.Mock;
    let buildings: any[];
    const dateToMove = formatDate(new Date());
    const moveToDate = formatDate(addDays(new Date(), 2));
    const garbageType = "testType";

    beforeEach(() => {
        closeModal = jest.fn();
        buildings = [{ id: 1 }, { id: 2 }];

        // (bulkMoveGarbageCollectionSchedule as jest.Mock).mockResolvedValueOnce({});
        (
            bulkMoveGarbageCollectionSchedule as jest.MockedFunction<typeof bulkMoveGarbageCollectionSchedule>
        ).mockResolvedValue({
            data: {},
        } as AxiosResponse);

        render(<BulkMoveGarbageModal show={true} buildings={buildings} closeModal={closeModal} />);
    });

    it("renders correctly", () => {
        expect(screen.getByText("Bulk operatie voor geselecteerde gebouwen")).toBeInTheDocument();
        expect(screen.getByText("Verplaats van:")).toBeInTheDocument();
        expect(screen.getByText("naar:")).toBeInTheDocument();
        expect(screen.getByText("Type:")).toBeInTheDocument();
    });

});
