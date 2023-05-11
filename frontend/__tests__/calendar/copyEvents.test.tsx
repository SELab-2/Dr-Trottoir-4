import { render, fireEvent, screen, waitFor } from "@testing-library/react";

import { postBulkStudentOnTour } from "@/lib/student-on-tour";
import { formatDate } from "@/lib/date";
import CopyScheduleEventsModal from "@/components/calendar/copyEvents";
import { ScheduleEvent } from "@/types";

jest.mock("@/lib/student-on-tour", () => ({
    postBulkStudentOnTour: jest.fn(),
}));

jest.mock("@/lib/date", () => ({
    formatDate: jest.fn(),
}));

describe("<CopyScheduleEventsModal />", () => {
    const onClose = jest.fn();
    const events: ScheduleEvent[] = []; // Provide appropriate events data

    beforeEach(() => {
        (formatDate as jest.Mock).mockReturnValue("2023-05-11");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should render without crashing", () => {
        render(
            <CopyScheduleEventsModal
                isOpen={true}
                onClose={onClose}
                events={events}
                range={{ start: new Date("2023-05-11"), end: new Date("2023-05-16") }}
            />
        );
    });

    it("should call postBulkStudentOnTour when Kopieer button is clicked", async () => {
        // @ts-ignore
        (postBulkStudentOnTour as jest.MockedFunction<typeof postBulkStudentOnTour>).mockResolvedValue({});

        const { getByText } = render(
            <CopyScheduleEventsModal
                isOpen={true}
                onClose={onClose}
                events={events}
                range={{
                    start: new Date("2023-05-11"),
                    end: new Date("2023-05-16"),
                }}
            />
        );

        fireEvent.click(getByText("Kopieer"));

        await waitFor(() => expect(postBulkStudentOnTour).toHaveBeenCalled());
    });
});
