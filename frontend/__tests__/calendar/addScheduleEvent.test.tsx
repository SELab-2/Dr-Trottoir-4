import {render, screen, fireEvent, waitFor} from '@testing-library/react';

import {formatDate} from "@/lib/date";
import {startOfWeek} from "date-fns";
import AddTourScheduleModal from "@/components/calendar/addTourSchedule";
import {postBulkStudentOnTour} from "@/lib/student-on-tour";

jest.mock('@/lib/student-on-tour');
jest.mock('@/lib/date');

jest.mock('@/lib/student-on-tour', () => ({
    postBulkStudentOnTour: jest.fn(),
}));

jest.mock('@/lib/date', () => ({
    formatDate: jest.fn(),
}));


describe('AddTourScheduleModal', () => {
    const onClose = jest.fn();
    const onPost = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders AddTourScheduleModal', () => {
        render(<AddTourScheduleModal isOpen={true} onClose={onClose} onPost={onPost}
                                     range={{start: new Date(), end: new Date()}}/>);
        expect(screen.getByText('Voeg ronde toe')).toBeInTheDocument();
        expect(screen.getByText('Sluit')).toBeInTheDocument();
        expect(screen.getByText('Sla op')).toBeInTheDocument();
    });

    it('should call onClose when Sluit button is clicked', () => {
        render(<AddTourScheduleModal isOpen={true} onClose={onClose} onPost={onPost}
                                     range={{start: new Date(), end: new Date()}}/>);
        fireEvent.click(screen.getByText('Sluit'));
        expect(onClose).toHaveBeenCalled();
    });

    // it('should call postBulkStudentOnTour when Sla op button is clicked', async () => {
    //     (postBulkStudentOnTour as jest.MockedFunction<typeof postBulkStudentOnTour>).mockResolvedValue({});
    //
    //     const {getByText} = render(<AddTourScheduleModal isOpen={true} onClose={onClose} onPost={onPost}
    //                                                      range={{
    //                                                          start: new Date('2023-05-11'),
    //                                                          end: new Date('2023-05-16')
    //                                                      }}/>);
    //
    //     // Click the Sla op button
    //     fireEvent.click(getByText('Sla op'));
    //
    //     // Wait for any async actions to complete
    //     await waitFor(() => expect(postBulkStudentOnTour).toHaveBeenCalled());
    // });
});
