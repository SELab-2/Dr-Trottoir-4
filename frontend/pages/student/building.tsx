import React, {useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";
import RemarkModal from "@/components/student/remarkModal";
import {FileList} from "@/components/student/FileList";
import {postRemarkAtBuilding, RemarkAtBuilding, remarkTypes} from "@/lib/remark-at-building";
import {postPictureOfRemark} from "@/lib/picture-of-remark";
import {useRouter} from "next/router";
import {BuildingInterface, getAddress, getBuildingInfo} from "@/lib/building";
import {getStudentOnTour, StudentOnTour, StudentOnTourStringDate} from "@/lib/student-on-tour";
import {GarbageCollectionInterface, garbageTypes, getGarbageCollectionFromBuilding} from "@/lib/garbage-collection";
import {BuildingComment, getAllBuildingCommentsByBuildingID} from "@/lib/building-comment";
import StudentHeader from "@/components/header/studentHeader";
import {BuildingManual, getManualPath, getManualsForBuilding} from "@/lib/building-manual";
import api from "@/lib/api/axios";


interface ParsedUrlQuery {
}

interface DataBuildingIdQuery extends ParsedUrlQuery {
    buildingId?: number;
    studentOnTourId?: number;
}

/**
 * This page receives a studentOnTourId & buildingId, otherwise nothing is displayed
 */
export default function StudentBuilding() {
    const router = useRouter();
    const typeNames: string[] = ["Aankomst", "Binnen", "Vertrek"];
    const typeRemarks: string[] = [remarkTypes["arrival"], remarkTypes["inside"], remarkTypes["leaving"]];

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const [studentOnTour, setStudentOnTour] = useState<StudentOnTour | null>(null);

    // Steps for normal process through building (arrival, inside & leaving)
    const [step, setStep] = useState<number>(0);
    const finalStep = 2;
    const [files, setFiles] = useState<File[]>([]);
    const [stepDescription, setStepDescription] = useState<string>("");
    const [timeRegistry, setTimeRegistry] = useState<Date | null>(null);

    const [showRemarkModal, setShowRemarkModal] = useState<boolean>(false);
    const [building, setBuilding] = useState<BuildingInterface | null>(null);

    const [garbageCollections, setGarbageCollections] = useState<GarbageCollectionInterface[]>([]);
    const [buildingComments, setBuildingComments] = useState<BuildingComment[]>([]);
    const [manual, setManual] = useState<BuildingManual | null>()
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
        const query: DataBuildingIdQuery = router.query as DataBuildingIdQuery;
        if (!query.buildingId || !query.studentOnTourId) {
            return;
        }
        const bId: number = query.buildingId;
        // Get the building, garbage collection, buildingComments & studentOnTour
        getBuilding(bId);
        getBuildingManual(bId);
        getGarbageCollection(bId);
        getBuildingComments(bId);
        getStudentOnTour(query.studentOnTourId).then(res => {
            const sots: StudentOnTourStringDate = res.data;
            const sot: StudentOnTour = {
                id: sots.id,
                student: sots.student,
                tour: sots.tour,
                date: new Date(sots.date)
            };
            setStudentOnTour(sot);
        }, console.error);
    }, [router.isReady]);

    function getBuilding(buildingId: number) {
        getBuildingInfo(buildingId).then(res => {
            const b: BuildingInterface = res.data;
            setBuilding(b);
        }, console.error);
    }

    function getGarbageCollection(buildingId: number) {
        getGarbageCollectionFromBuilding(buildingId, {startDate: new Date(), endDate: new Date()}).then(res => {
            const col: GarbageCollectionInterface[] = res.data;
            setGarbageCollections(col);
        }, console.error);
    }

    function getBuildingComments(buildingId: number) {
        getAllBuildingCommentsByBuildingID(buildingId).then(res => {
            const bc: BuildingComment[] = res.data;
            setBuildingComments(bc);
        }, console.error);
    }

    function getBuildingManual(buildingId: number) {
        getManualsForBuilding(buildingId).then((res) => {
            const manuals: BuildingManual[] = res.data;
            if (manuals.length === 0) {
                return;
            }
            const m: BuildingManual = manuals[0];
            m.file = getManualPath(m.file);
            setManual(m);
        }, console.error);
    }

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
        <>
            <StudentHeader/>
            <div className="m-2">
                <RemarkModal onHide={() => setShowRemarkModal(false)} show={showRemarkModal}/>
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">{building ? getAddress(building) : ""}</h5>
                        {
                            <ul>
                                {
                                    garbageCollections.map((gar: GarbageCollectionInterface) => (
                                        <li key={gar.id} className="card-subtitle mb-2 text-muted">
                                            {
                                                garbageTypes[gar.garbage_type] ?
                                                    garbageTypes[gar.garbage_type] :
                                                    gar.garbage_type
                                            }
                                        </li>
                                    ))
                                }
                            </ul>
                        }
                    </div>
                    {
                        (buildingComments.length > 0) && (
                            <>
                                <h5>Opmerkingen bij dit gebouw:</h5>
                                <ul className="list-group list-group-flush">
                                    {
                                        buildingComments.map((bc: BuildingComment) => (
                                            <li className="list-group-item" key={bc.id}>{bc.comment}</li>
                                        ))
                                    }
                                </ul>
                            </>
                        )
                    }
                    {
                        (manual) && (
                            <>
                                <h5>Handleiding van gebouw:</h5>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">
                                        <a href={manual.file} download style={{ textDecoration: "underline" }}>
                                            Handleiding
                                        </a>
                                    </li>
                                </ul>
                            </>
                        )
                    }
                </div>


                {errorMessages.length > 0 && (
                    <div className="visible alert alert-danger alert-dismissible fade show mt-2 mb-2">
                        <ul>
                            {errorMessages.map((err: string, index: number) => (
                                <li key={index}>{err}</li>
                            ))}
                        </ul>
                        <button type="button" className="btn-close" onClick={() => setErrorMessages([])}/>
                    </div>
                )}
                <Form onSubmit={handleSubmit}>
                    <span className="h1 mt-2">{typeNames[step]}</span>
                    <div className="mb-2 mt-2">
                        <label className="form-label">Beschrijving (optioneel):</label>
                        <textarea className={`form-control form-control-lg`} value={stepDescription}
                                  onChange={e => setStepDescription(e.target.value)}></textarea>
                    </div>
                    <div>
                        <label className="form-label">Upload één of meerdere foto's:</label>
                        <input className="form-control" type="file" onChange={handleFileChange} accept="image/*"/>
                    </div>

                    <FileList files={files} handleRemoveFile={handleRemoveFile}/>

                    <Button variant="primary"
                            className="btn-dark" type="submit">{`Upload bestanden`}</Button>
                </Form>
                <Button variant="primary"
                        className="btn-dark" onClick={() => setShowRemarkModal(true)}>Maak een opmerking</Button>
            </div>
        </>
    );
}
