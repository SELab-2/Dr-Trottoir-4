import { Button, Form, Modal } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { FileList } from "@/components/student/fileList";
import {
    deleteRemarkAtBuilding,
    patchRemarkAtBuilding,
    postRemarkAtBuilding,
    RemarkAtBuilding,
    remarkTypes,
} from "@/lib/remark-at-building";
import {
    deletePictureOfRemark,
    getPictureOfRemarkOfSpecificRemark,
    getPicturePath,
    PictureOfRemarkInterface,
    postPictureOfRemark,
} from "@/lib/picture-of-remark";
import { StudentOnTour } from "@/lib/student-on-tour";
import { BuildingInterface } from "@/lib/building";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { FileListElement } from "@/types";
import { handleError } from "@/lib/error";

export default function RemarkModal({
    show,
    onHide,
    studentOnTour,
    building,
    selectedRemark,
    setSelectedRemark,
    onPost,
    onPatch,
    onDelete,
}: {
    show: boolean;
    onHide: () => void;
    studentOnTour: StudentOnTour | null;
    building: BuildingInterface | null;
    selectedRemark: RemarkAtBuilding | null;
    setSelectedRemark: (r: RemarkAtBuilding | null) => void;
    onPost: (r: RemarkAtBuilding) => void;
    onPatch: (r: RemarkAtBuilding) => void;
    onDelete: (r: RemarkAtBuilding) => void;
}) {
    // Files for remarks at a building
    const [remark, setRemark] = useState<string>("");
    const [remarkFiles, setRemarkFiles] = useState<FileListElement[]>([]);
    const type: string = remarkTypes["remark"];

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        if (selectedRemark) {
            setRemark(selectedRemark.remark);
            getPictureOfRemarkOfSpecificRemark(selectedRemark.id).then((res) => {
                const pictures: PictureOfRemarkInterface[] = res.data;
                setRemarkFiles(
                    pictures.map((picture) => {
                        return {
                            url: getPicturePath(picture.picture),
                            pictureId: picture.id,
                            file: null,
                        };
                    })
                );
            }, console.error);
        } else {
            setRemark("");
            setRemarkFiles([]);
            setErrorMessages([]);
        }
    }, [selectedRemark]);

    function closeModal() {
        setSelectedRemark(null);
        onHide();
    }

    function deleteRemark() {
        if (!selectedRemark) {
            return;
        }
        deleteRemarkAtBuilding(selectedRemark.id).then(
            (_) => {
                onDelete(selectedRemark);
                closeModal();
            },
            (err) => setErrorMessages(handleError(err))
        );
    }

    function uploadRemark() {
        if (!remark) {
            setErrorMessages(["De opmerking mag niet leeg zijn."]);
            return;
        }
        if (!building || !studentOnTour) {
            return;
        }
        if (!selectedRemark) {
            // POST
            postRemarkAtBuilding(building.id, studentOnTour.id, remark, new Date(), type).then(
                (res) => {
                    const r: RemarkAtBuilding = res.data;
                    onPost(r);
                    remarkFiles.forEach((f: FileListElement) => {
                        if (f.file) {
                            postPictureOfRemark(f.file, r.id).catch(console.error);
                        }
                    });
                    closeModal();
                },
                (err) => setErrorMessages(handleError(err))
            );
        } else {
            if (selectedRemark.remark != remark) {
                patchRemarkAtBuilding(selectedRemark.id, remark).then(
                    (res) => {
                        const r: RemarkAtBuilding = res.data;
                        onPatch(r);
                    },
                    (err) => setErrorMessages(handleError(err))
                );
            }
            remarkFiles.forEach((f: FileListElement) => {
                if (f.file) {
                    postPictureOfRemark(f.file, selectedRemark.id).catch(console.error);
                }
            });
            closeModal();
        }
    }

    return (
        <Modal show={show} onHide={() => closeModal()}>
            <Modal.Header>
                <Modal.Title>Welke algemene opmerking heeft u?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
                <Form>
                    <Form.Control as="textarea" rows={3} value={remark} onChange={(e) => setRemark(e.target.value)} />
                    <FileList files={remarkFiles} optional setFiles={setRemarkFiles} editable />
                </Form>
                {selectedRemark && (
                    <Button className="btn-danger" onClick={() => deleteRemark()}>
                        Verwijder
                    </Button>
                )}
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
                    {selectedRemark ? "Pas opmerking aan" : "Upload opmerking"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
