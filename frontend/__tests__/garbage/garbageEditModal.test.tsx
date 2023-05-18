import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    garbageTypes,
    deleteGarbageCollection,
    patchGarbageCollection,
    postGarbageCollection, GarbageCollectionInterface
} from '@/lib/garbage-collection';
import {formatDate} from '@/lib/date';
import GarbageEditModal from "@/components/garbage/GarbageEditModal";
import buildings from "@/pages/admin/data/buildings";

jest.mock('@/lib/garbage-collection');
jest.mock('@/lib/date');

describe('GarbageEditModal', () => {
    const mockCloseModal = jest.fn();
    const mockOnPost = jest.fn();
    const mockOnPatch = jest.fn();
    const mockOnDelete = jest.fn();
    const mockBuilding = {
        id: 1,
        syndic: 1,
        name: 'Building 1',
        city: 'City 1',
        postal_code: '12345',
        street: 'Street 1',
        house_number: '1',
        bus: '1',
        client_number: '1',
        duration: '1',
        region: 1,
        public_id: '1',
    };
    const mockGarbageCollectionEvent = {
        start: new Date(),
        end: new Date(),
        id: 1,
        building: mockBuilding,
        garbageType: 'Type 1',
    };
    const garbageCollectionData: GarbageCollectionInterface = {
        id: 1,
        date: new Date(),
        garbage_type: 'Type1',
        building: 1
    };
    const mockPostGarbageCollection = postGarbageCollection as jest.MockedFunction<typeof postGarbageCollection>;
    const mockPatchGarbageCollection = patchGarbageCollection as jest.MockedFunction<typeof patchGarbageCollection>;
    const mockDeleteGarbageCollection = deleteGarbageCollection as jest.MockedFunction<typeof deleteGarbageCollection>;


    beforeEach(() => {
        (formatDate as jest.Mock).mockReturnValue('2023-05-11');
        jest.clearAllMocks();
    });


    it('should render correctly for creating a new garbage collection', () => {
        render(
            <GarbageEditModal
                selectedEvent={null}
                show={true}
                closeModal={mockCloseModal}
                onPost={mockOnPost}
                onPatch={mockOnPatch}
                onDelete={mockOnDelete}
                clickedDate={new Date()}
                buildings={[mockBuilding]}
            />
        );

        expect(screen.getByText('Voeg ophaling(en) toe')).toBeInTheDocument();
        expect(screen.getByText('Datum:')).toBeInTheDocument();
        expect(screen.getByText('Gebouw(en):')).toBeInTheDocument();
        expect(screen.getByText('Type:')).toBeInTheDocument();
        expect(screen.getByText('Voeg toe')).toBeInTheDocument();
    });

    it('should render correctly for updating an existing garbage collection', () => {
        render(
            <GarbageEditModal
                selectedEvent={mockGarbageCollectionEvent}
                show={true}
                closeModal={mockCloseModal}
                onPost={mockOnPost}
                onPatch={mockOnPatch}
                onDelete={mockOnDelete}
                clickedDate={null}
                buildings={[mockBuilding]}
            />
        );

        expect(screen.getByText('Pas ophaling aan')).toBeInTheDocument();
        expect(screen.getByText('Datum:')).toBeInTheDocument();
        expect(screen.getByText('Gebouw:')).toBeInTheDocument();
        expect(screen.getByText('Type:')).toBeInTheDocument();
        expect(screen.getByText('Verwijder')).toBeInTheDocument();
        expect(screen.getByText('Pas aan')).toBeInTheDocument();
    });
});
