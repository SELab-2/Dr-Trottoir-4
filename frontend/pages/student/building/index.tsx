import React, {useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";
import RemarkModal from "@/components/student/remarkModal";

export default function StudentBuilding() {
    const typeNames = ["Aankomst", "Binnen", "Vertrek"];

    // Steps for normal process through building (arrival, inside & leaving)
    const [step, setStep] = useState<number>(0);
    const finalStep = 2;
    const [files, setFiles] = useState<File[]>([]);

    const [showRemarkModal, setShowRemarkModal] = useState<boolean>(false);

    useEffect(() => {
        console.log(files);
    }, []);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newFiles: FileList | null = event.target.files;
        if (!newFiles) {
            return;
        }
        setFiles([...files, newFiles[0]]);
    }

    function handleRemoveFile(index: number) {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        console.log(files);

        setFiles([]);

        if (step === finalStep) {
            console.log("Go to next building");
        } else {
            setStep((prevState) => prevState + 1);
        }
    }

    function downloadFile(file: File, index: number) {
        const fileUrl = URL.createObjectURL(file);
        const fileName = file.name;
        return (
            <a href={fileUrl} download={fileName}>
                {`upload_${index + 1}`}
            </a>
        );
    }

    return (
        <>
            <RemarkModal downloadFile={downloadFile} onHide={() => setShowRemarkModal(false)} show={showRemarkModal}/>
            <Form onSubmit={handleSubmit}>
                <span className="h1">{typeNames[step]}</span>
                <div>
                    <label className="form-label">Upload een foto</label>
                    <input className="form-control" type="file" onChange={handleFileChange} accept="image/*"/>
                </div>
                <ol/>
                {files.map((file, index) => (
                    <li key={index}>
                        <div>{downloadFile(file, index)}</div>
                        <button type="button" onClick={() => handleRemoveFile(index)}>Remove</button>
                    </li>
                ))}
                <br/>
                <Button variant="primary"
                        className="btn-dark" type="submit">Submit</Button>
            </Form>
            <Button variant="primary"
                    className="btn-dark" onClick={() => setShowRemarkModal(true)}>Maak een opmerking</Button>
        </>
    );
}
