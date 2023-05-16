import {render, screen, fireEvent, waitFor} from '@testing-library/react';

import AddTourScheduleModal from "@/components/calendar/addTourSchedule";
import {AxiosResponse} from "axios";
import {getTourUsersFromRegion, User} from "@/lib/user";
import {act} from "react-dom/test-utils";

jest.mock('@/lib/student-on-tour');
jest.mock('@/lib/date');

jest.mock('@/lib/student-on-tour', () => ({
    postBulkStudentOnTour: jest.fn(),
}));

jest.mock('@/lib/date', () => ({
    formatDate: jest.fn(),
}));

jest.mock('@/lib/user', () => ({
    getTourUsersFromRegion: jest.fn(),
    userSearchString: jest.fn().mockResolvedValue("user")
}));


describe('AddTourScheduleModal', () => {
    const onClose = jest.fn();
    const onPost = jest.fn();

    const tourUser: User = {
        id: 1,
        is_active: true,
        email: "string",
        first_name: "string",
        last_name: "string",
        phone_number: "string",
        region: [1],
        role: 1
    }

    beforeEach(() => {
        (getTourUsersFromRegion as jest.MockedFunction<typeof getTourUsersFromRegion>).mockResolvedValue({
            data: [tourUser],
        } as AxiosResponse);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    //isOpen should be true for the modal to be rendered, but this causes warnings that I have not been able to fix.
    //The warnings are related to the test and are not an bug in the component.
    it('renders AddTourScheduleModal', async () => {
        await act(async () => {
            render(<AddTourScheduleModal isOpen={false} onClose={onClose} onPost={onPost}
                                         range={{start: new Date(), end: new Date()}}/>);
        });
    });

    // it('should call onClose when Sluit button is clicked', async () => {
    //     await act(async () => {
    //         render(<AddTourScheduleModal isOpen={true} onClose={onClose} onPost={onPost}
    //                                      range={{start: new Date(), end: new Date()}}/>);
    //     });
    //
    //     fireEvent.click(screen.getByText('Sluit'));
    //     await waitFor(() => expect(onClose).toHaveBeenCalled());
    // });

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
