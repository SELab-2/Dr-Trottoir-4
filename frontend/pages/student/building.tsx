import React, {useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";
import RemarkModal from "@/components/student/remarkModal";
import {FileList} from "@/components/student/FileList";
import {postRemarkAtBuilding, RemarkAtBuilding, remarkTypes} from "@/lib/remark-at-building";
import {postPictureOfRemark} from "@/lib/picture-of-remark";
import {useRouter} from "next/router";


interface ParsedUrlQuery {}

interface DataBuildingIdQuery extends ParsedUrlQuery {
    buildingId?: number;
    studentOnTourId?: number;
}

/**
 * This page receives a studentOnTourId & buildingId, otherwise nothing is displayed
 */
export default function StudentBuilding() {
    const router = useRouter();
    const typeNames : string[] = ["Aankomst", "Binnen", "Vertrek"];
    const typeRemarks : string[] = [remarkTypes["arrival"], remarkTypes["inside"], remarkTypes["leaving"]];

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    // Steps for normal process through building (arrival, inside & leaving)
    const [step, setStep] = useState<number>(0);
    const finalStep = 2;
    const [files, setFiles] = useState<File[]>([]);
    const [stepDescription, setStepDescription] = useState<string>("");
    const [timeRegistry, setTimeRegistry] = useState<Date | null>(null);

    const [showRemarkModal, setShowRemarkModal] = useState<boolean>(false);

    useEffect(() => {
        const query : DataBuildingIdQuery = router.query as DataBuildingIdQuery;
        if (! query.buildingId || ! query.studentOnTourId) {
            return;
        }
        console.log("Building: " + query.buildingId);
        console.log("StudentOnTour: " + query.studentOnTourId);
    }, [router.isReady]);

    // Handle when a file is selected
    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (!timeRegistry) {
            setTimeRegistry(new Date());
        }
        const newFiles: FileList | null = event.target.files;
        if (!newFiles) {
            return;
        }
        setFiles([...files, newFiles[0]]);
    }

    // Remove a file from the list of selected files
    function handleRemoveFile(index: number) {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    }

    // Handle the submit event
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // There must be 1 picture to upload at minimum
        if (files.length === 0) {
            setErrorMessages(["U moet ten minste 1 foto uploaden."]);
            return;
        }

        // This is temp hardcoded for testing purposes
        const sot = 23; // studentOnTourId
        const b = 2; // buildingId

        // Post a remark & pictures with the remark for a building by a student on a tour.
        postRemarkAtBuilding(
            b,
            sot,
            stepDescription,
            timeRegistry ? timeRegistry : new Date(),
            typeRemarks[step]
        ).then((res) => {
            const remark: RemarkAtBuilding = res.data;
            files.forEach((f: File) => {
                postPictureOfRemark(f, remark.id).then(_ => {
                }, console.error);
            });

            // remove all data
            setFiles([]);
            setTimeRegistry(null);
            setErrorMessages([]);
            setStepDescription("");

            // Set the step
            if (step === finalStep) {
                console.log("Go to next building");
                setStep(0);
                // Change buildingId etc..
            } else {
                setStep((prevState) => prevState + 1);
            }
        }, console.error);
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
                    <button type="button" className="btn-close" onClick={() => setErrorMessages([])}/>
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
