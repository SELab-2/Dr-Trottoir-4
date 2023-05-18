// __tests__/RegionModal.test.tsx
import React from 'react';
import {render, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RegionModal, {ModalMode} from "@/components/regionModal";

describe('RegionModal', () => {
    const setup = () => {
        const closeModal = jest.fn();
        const onSubmit = jest.fn();
        const setRegionName = jest.fn();
        const utils = render(
            <RegionModal
                show={true}
                closeModal={closeModal}
                onSubmit={onSubmit}
                mode={ModalMode.ADD}
                regionName=""
                setRegionName={setRegionName}
            />
        );
        const input = utils.getByLabelText('Regio naam');
        return {
            input,
            closeModal,
            onSubmit,
            setRegionName,
            ...utils,
        };
    };

    it('renders without crashing', () => {
        const {getByText} = setup();
        expect(getByText('Maak nieuwe regio')).toBeInTheDocument();
    });

    it('calls setRegionName when input changes', () => {
        const {input, setRegionName} = setup();
        fireEvent.change(input, {target: {value: 'Test Region'}});
        expect(setRegionName).toHaveBeenCalledWith('Test Region');
    });

    it('calls closeModal and onSubmit when Opslaan button is clicked', () => {
        const {getByText, closeModal, onSubmit} = setup();
        fireEvent.click(getByText('Opslaan'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(closeModal).toHaveBeenCalledTimes(1);
    });

    it('calls closeModal when Annuleer button is clicked', () => {
        const {getByText, closeModal} = setup();
        fireEvent.click(getByText('Annuleer'));
        expect(closeModal).toHaveBeenCalledTimes(1);
    });
});
