import { TourView, UserView } from "@/types";
import { useTranslation } from "react-i18next";
import { deleteTour } from "@/lib/tour";
import { getAndSetErrors } from "@/lib/error";
import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";

export function TourDeleteModal({
    show,
    closeModal,
    onDelete,
    selectedTour,
    setSelectedTour,
}: {
    show: boolean;
    closeModal: () => void;
    onDelete: () => void;
    selectedTour: TourView | null;
    setSelectedTour: (x: any) => void;
}) {
    const { t } = useTranslation();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    function removeTour() {
        if (!selectedTour) {
            return;
        }
        deleteTour(selectedTour.tour_id).then(
            (_) => {
                setErrorMessages([]);
                onDelete();
            },
            (err) => {
                let errorRes = err.response;
                if (errorRes && errorRes.status === 400) {
                    getAndSetErrors(Object.entries(errorRes.data), setErrorMessages);
                } else if (errorRes && errorRes.status === 403) {
                    const errorData: [any, string][] = Object.entries(errorRes.data);
                    setErrorMessages(errorData.map((val) => val[1]));
                } else {
                    console.error(err);
                }
            }
        );
    }

    return (
        <Modal show={show} onHide={closeModal}>
            <Modal.Header>
                <Modal.Title>Verwijder ronde</Modal.Title>
            </Modal.Header>
            {errorMessages.length !== 0 && (
                <div className={"visible alert alert-danger alert-dismissible fade show"}>
                    <ul>
                        {errorMessages.map((err, i) => (
                            <li key={i}>{t(err)}</li>
                        ))}
                    </ul>
                    <button type="button" className="btn-close" onClick={() => setErrorMessages([])}></button>
                </div>
            )}
            <Modal.Body>Bent u zeker dat u ronde {selectedTour?.name} wil verwijderen?</Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    className="btn-light"
                    onClick={() => {
                        setSelectedTour(null);
                        setErrorMessages([]);
                        closeModal();
                    }}
                >
                    Annuleer
                </Button>
                <Button
                    variant="primary"
                    className="btn-dark"
                    onClick={async () => {
                        removeTour();
                    }}
                >
                    Verwijder
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
