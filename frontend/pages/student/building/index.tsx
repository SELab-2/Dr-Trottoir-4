import React, {useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";
import RemarkModal from "@/components/student/remarkModal";
import {IconButton, Tooltip} from "@mui/material";
import {Emailtemplate} from "@/lib/emailtemplate";
import {Delete} from "@mui/icons-material";
import {FileList} from "@/components/student/FileList";
import {postRemarkAtBuilding, remarkTypes} from "@/lib/remark-at-building";
import {postPictureOfRemark} from "@/lib/picture-of-remark";

export default function StudentBuilding() {
    const typeNames = ["Aankomst", "Binnen", "Vertrek"];

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    // Steps for normal process through building (arrival, inside & leaving)
    const [step, setStep] = useState<number>(0);
    const finalStep = 2;
    const [files, setFiles] = useState<File[]>([]);
    const [stepDescription, setStepDescription] = useState<string>("");
    const [timeRegistry, setTimeRegistry] = useState<Date | null>(null);

    const [showRemarkModal, setShowRemarkModal] = useState<boolean>(false);

    useEffect(() => {
        console.log(files);
    }, []);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (! files) {
            setTimeRegistry(new Date());
        }
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
        if (files.length === 0) {
            setErrorMessages(["U moet ten minste 1 foto uploaden."]);
            return;
        }
        console.log(files);
        console.log(stepDescription);

        setFiles([]);
        setTimeRegistry(null);

        /*const sot = 23; // stuentOnTourId
        const b = 2; // buildingId
        postRemarkAtBuilding(b, sot, stepDescription, new Date(), remarkTypes["arrival"]).then((res) => {
            console.log(res.data);
        }, console.error);
        // TODO: upload the files to the server for resp. arrival, inside or leaving
        */

        const remark_at_buildingId = 24;
        postPictureOfRemark(files[0], remark_at_buildingId).then(res => {
            console.log(res);
        }, console.error);

        setErrorMessages([]);
        if (step === finalStep) {
            console.log("Go to next building");
        } else {
            setStep((prevState) => prevState + 1);
        }
    }

    return (
        <div className="m-2">
            <RemarkModal onHide={() => setShowRemarkModal(false)} show={showRemarkModal}/>
            {errorMessages.length > 0 && (
                <div className={"visible alert alert-danger alert-dismissible fade show"}>
                    <ul>
                        {errorMessages.map((err: string, index: number) => (
                            <li key={index}>{err}</li>
                        ))}
                    </ul>
                    <button type="button" className="btn-close" onClick={() => setErrorMessages([])} />
                </div>
            )}
            <Form onSubmit={handleSubmit}>
                <span className="h1">{typeNames[step]}</span>
                <div className="mb-2 mt-2">
                    <label className="form-label">Beschrijving (optioneel):</label>
                    <textarea className={`form-control form-control-lg`} value={stepDescription}
                              onChange={e => setStepDescription(e.target.value)}></textarea>
                </div>
                <div>
                    <label className="form-label">Upload een foto</label>
                    <input className="form-control" type="file" onChange={handleFileChange} accept="image/*"/>
                </div>

                <FileList files={files} handleRemoveFile={handleRemoveFile}/>

                <Button variant="primary"
                        className="btn-dark" type="submit">{`Upload bestanden`}</Button>
            </Form>
            <Button variant="primary"
                    className="btn-dark" onClick={() => setShowRemarkModal(true)}>Maak een opmerking</Button>
        </div>
    );
}
