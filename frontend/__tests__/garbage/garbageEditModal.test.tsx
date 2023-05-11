import {render, fireEvent, waitFor, screen} from '@testing-library/react';

import {BuildingInterface} from '@/lib/building';
import {GarbageCollectionEvent} from '@/types';
import GarbageEditModal from "@/components/garbage/GarbageEditModal";
import {deleteGarbageCollection, patchGarbageCollection, postGarbageCollection} from "@/lib/garbage-collection";

jest.mock("@/lib/garbage-collection", () => ({
    deleteGarbageCollection: jest.fn(),
    patchGarbageCollection: jest.fn(),
    postGarbageCollection: jest.fn(),
    garbageTypes: {'paper': 'Papier', 'plastic': 'Plastic', 'glass': 'Glas'}
}));

jest.mock("@/lib/error", () => ({
    handleError: jest.fn()
}));

const buildings: BuildingInterface[] = [
    {
        id: 1,
        syndic: 100,
        name: 'Building A',
        city: 'City A',
        postal_code: '12345',
        street: 'Street A',
        house_number: '10',
        bus: 'Bus A',
        client_number: '123',
        duration: '1h',
        region: 1,
        public_id: 'pub1',
    },
    {
        id: 2,
        syndic: 200,
        name: 'Building B',
        city: 'City B',
        postal_code: '23456',
        street: 'Street B',
        house_number: '20',
        bus: 'Bus B',
        client_number: '234',
        duration: '2h',
        region: 2,
        public_id: 'pub2',
    }
];

const selectedEvent: GarbageCollectionEvent = {
    id: 1,
    start: new Date(),
    end: new Date(),
    building: buildings[0],
    garbageType: 'Papier',
    title: 'Event A',
    allDay: false,
};

test('renders the GarbageEditModal correctly', () => {
    const {getByText} = render(<GarbageEditModal
        selectedEvent={selectedEvent}
        show={true}
        closeModal={() => {
        }}
        onPost={() => {
        }}
        onPatch={() => {
        }}
        onDelete={() => {
        }}
        clickedDate={new Date()}
        buildings={buildings}
    />);

    expect(getByText("Pas ophaling aan")).toBeInTheDocument();
});

test('calls the deleteGarbageCollection function when delete button is clicked', async () => {
    render(<GarbageEditModal
        selectedEvent={selectedEvent}
        show={true}
        closeModal={() => {
        }}
        onPost={() => {
        }}
        onPatch={() => {
        }}
        onDelete={() => {
        }}
        clickedDate={new Date()}
        buildings={buildings}
    />);

    fireEvent.click(screen.getByText("Verwijder"));

    await waitFor(() => expect(deleteGarbageCollection).toHaveBeenCalled());
});

test('calls the patchGarbageCollection function when submit button is clicked with an existing event', async () => {
    render(<GarbageEditModal
        selectedEvent={selectedEvent}
        show={true}
        closeModal={() => {
        }}
        onPost={() => {
        }}
        onPatch={() => {
        }}
        onDelete={() => {
        }}
        clickedDate={new Date()}
        buildings={buildings}
    />);

    fireEvent.click(screen.getByText("Pas aan"));

    await waitFor(() => expect(patchGarbageCollection).toHaveBeenCalled());
});

test('calls the postGarbageCollection function when submit button is clicked without an existing event', async () => {
    render(<GarbageEditModal
        selectedEvent={null}
        show={true}
        closeModal={() => {
        }}
        onPost={() => {
        }}
        onPatch={() => {
        }}
        onDelete={() => {
        }}
        clickedDate={new Date()}
        buildings={buildings}
    />);

    fireEvent.click(screen.getByText("Voeg toe"));

    await waitFor(() => expect(postGarbageCollection).toHaveBeenCalled());
});
