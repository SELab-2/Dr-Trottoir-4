import {Button, Form, Modal} from "react-bootstrap";
import React, {useState} from "react";

export default function RemarkModal(
    {
        show,
        onHide,
        downloadFile
    }: {
        show: boolean;
        onHide: () => void;
        downloadFile: (file: File, index: number) => JSX.Element
    }
) {

    // Files for remarks at a building
    const [remark, setRemark] = useState<string>("");
    const [remarkFiles, setRemarkFiles] = useState<File[]>([]);

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

    return (
        <Modal show={show} onHide={() => closeModal()}>
            <Modal.Header>
                <Modal.Title>Welke opmerking heeft u?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <textarea className={`form-control form-control-lg`} value={remark}
                              onChange={e => setRemark(e.target.value)}/>
                    <div>
                        <label className="form-label">Upload een foto bij uw opmerking</label>
                        <input className="form-control" type="file" onChange={handleRemarkFileChange} accept="image/*"/>
                    </div>
                    <ol>
                        {remarkFiles.map((file, index) => (
                            <li key={index}>
                                <div>{downloadFile(file, index)}</div>
                                <button type="button" onClick={() => handleRemoveRemarkFile(index)}>Remove</button>
                            </li>
                        ))}
                    </ol>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    className="btn-light"
                    onClick={() => closeModal()}>
                    Annuleer
                </Button>
                <Button
                    variant="primary"
                    className="btn-dark"
                    onClick={async () => {
                    }}>
                    Upload opmerking
                </Button>
            </Modal.Footer>
        </Modal>
    );
}