import { Button, Form, Modal } from "react-bootstrap";
import React, { useState } from "react";
import { FileList } from "@/components/student/fileList";
import { postRemarkAtBuilding, RemarkAtBuilding, remarkTypes } from "@/lib/remark-at-building";
import { postPictureOfRemark } from "@/lib/picture-of-remark";
import { StudentOnTour } from "@/lib/student-on-tour";
import { BuildingInterface } from "@/lib/building";
import ErrorMessageAlert from "@/components/errorMessageAlert";

export default function RemarkModal({
    show,
    onHide,
    studentOnTour,
    building,
}: {
    show: boolean;
    onHide: () => void;
    studentOnTour: StudentOnTour | null;
    building: BuildingInterface | null;
}) {
    // Files for remarks at a building
    const [remark, setRemark] = useState<string>("");
    const [remarkFiles, setRemarkFiles] = useState<File[]>([]);
    const type: string = remarkTypes["remark"];

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    function handleRemarkFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newFiles: FileList | null = event.target.files;
        if (!newFiles) {
            return;
        }
        setRemarkFiles([...remarkFiles, newFiles[0]]);
    }

    function handleRemoveRemarkFile(index: number) {
        const newFiles = [...remarkFiles];
        newFiles.splice(index, 1);
        setRemarkFiles(newFiles);
    }

    function closeModal() {
        setRemark("");
        setRemarkFiles([]);
        onHide();
    }

    function uploadRemark() {
        if (!remark) {
            setErrorMessages(["De opmerking mag niet leeg zijn."]);
            return;
        }
        if (!building || !studentOnTour) {
            return;
        }

        postRemarkAtBuilding(building.id, studentOnTour.id, remark, new Date(), type).then((res) => {
            const remark: RemarkAtBuilding = res.data;
            remarkFiles.forEach((f: File) => {
                postPictureOfRemark(f, remark.id).then((_) => {}, console.error);
            });

            setRemark("");
            setRemarkFiles([]);
            setErrorMessages([]);
            closeModal();
        }, console.error);
    }

    return (
        <Modal show={show} onHide={() => closeModal()}>
            <Modal.Header>
                <Modal.Title>Welke opmerking heeft u?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
                <Form>
                    <textarea
                        className={`form-control form-control-lg`}
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                    />
                    <div>
                        <label className="form-label">Upload foto's bij uw opmerking (optioneel)</label>
                        <input
                            className="form-control"
                            type="file"
                            onChange={handleRemarkFileChange}
                            accept="image/*"
                        />
                    </div>
                    <FileList files={remarkFiles} handleRemoveFile={handleRemoveRemarkFile} />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className="btn-light" onClick={() => closeModal()}>
                    Annuleer
                </Button>
                <Button
                    variant="primary"
                    className="btn-dark"
                    onClick={async () => {
                        uploadRemark();
                    }}
                >
                    Upload opmerking
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
