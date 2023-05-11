import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import {AxiosResponse} from "axios";
import {deleteMailTemplate} from '@/lib/emailtemplate';
import {DeleteEmailModal} from "@/components/admin/deleteEmailModal";
import i18n from "@/i18n";

jest.mock('@/lib/emailtemplate', () => ({
    deleteMailTemplate: jest.fn(),
}));

describe('<DeleteEmailModal />', () => {
    const closeModal = jest.fn();
    const setMail = jest.fn();
    const selectedMail = {id: 1, name: 'testMail', template: "test"}; // Provide appropriate data

    beforeEach(() => {
        i18n.init();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render without crashing', () => {
        render(<DeleteEmailModal show={true} closeModal={closeModal} selectedMail={selectedMail} setMail={setMail}/>);
    });

    it('should call deleteMailTemplate when Verwijder button is clicked', async () => {
        // @ts-ignore
        (deleteMailTemplate as jest.MockedFunction<typeof deleteMailTemplate>).mockResolvedValue({data: {}});

        const {getByText} = render(<DeleteEmailModal show={true} closeModal={closeModal} selectedMail={selectedMail}
                                                     setMail={setMail}/>);

        fireEvent.click(getByText('Verwijder'));

        await waitFor(() => expect(deleteMailTemplate).toHaveBeenCalled());
    });
});
