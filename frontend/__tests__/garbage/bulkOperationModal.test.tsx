import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {bulkMoveGarbageCollectionSchedule} from '@/lib/garbage-collection';
import {formatDate} from '@/lib/date';
import {addDays} from 'date-fns';
import BulkOperationModal from "@/components/garbage/BulkOperationModal";

// Mock the bulkMoveGarbageCollectionSchedule API function
jest.mock('@/lib/garbage-collection', () => ({
    bulkMoveGarbageCollectionSchedule: jest.fn(),
    garbageTypes: {testType: 'Test Type'},
}));

describe('BulkOperationModal', () => {
    let closeModal: jest.Mock;
    let buildings: any[];

    beforeEach(() => {
        closeModal = jest.fn();
        buildings = [{id: 1}, {id: 2}];

        (bulkMoveGarbageCollectionSchedule as jest.Mock).mockResolvedValueOnce({});

        render(<BulkOperationModal show={true} buildings={buildings} closeModal={closeModal}/>);
    });

    it('renders correctly', () => {
        expect(screen.getByText('Bulk operatie voor geselecteerde gebouwen')).toBeInTheDocument();
        expect(screen.getByText('Verplaats van:')).toBeInTheDocument();
        expect(screen.getByText('naar:')).toBeInTheDocument();
        expect(screen.getByText('Type:')).toBeInTheDocument();
    });

    it('handles input changes', () => {
        const dateToMove = formatDate(new Date());
        const moveToDate = formatDate(addDays(new Date(), 2));
        const garbageType = 'testType';

        fireEvent.change(screen.getByLabelText('Verplaats van:'), {target: {value: dateToMove}});
        fireEvent.change(screen.getByLabelText('naar:'), {target: {value: moveToDate}});
        fireEvent.change(screen.getByLabelText('Type:'), {target: {value: garbageType}});

        expect(screen.getByLabelText('Verplaats van:')).toHaveValue(dateToMove);
        expect(screen.getByLabelText('naar:')).toHaveValue(moveToDate);
        expect(screen.getByLabelText('Type:')).toHaveValue(garbageType);
    });

    it('handles form submission', async () => {
        const dateToMove = formatDate(new Date());
        const moveToDate = formatDate(addDays(new Date(), 2));
        const garbageType = 'testType';

        fireEvent.change(screen.getByLabelText('Verplaats van:'), {target: {value: dateToMove}});
        fireEvent.change(screen.getByLabelText('naar:'), {target: {value: moveToDate}});
        fireEvent.change(screen.getByLabelText('Type:'), {target: {value: garbageType}});

        fireEvent.click(screen.getByText('Verplaats'));

        await waitFor(() => {
            expect(bulkMoveGarbageCollectionSchedule).toHaveBeenCalledWith(
                garbageType,
                dateToMove,
                moveToDate,
                buildings.map((b) => b.id)
            );
        });
    });
});
