import React, {useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";
import RemarkModal from "@/components/student/remarkModal";
import {FileList} from "@/components/student/fileList";
import {
    getRemarksOfStudentOnTourAtBuilding,
    postRemarkAtBuilding,
    RemarkAtBuilding,
    remarkTypes
} from "@/lib/remark-at-building";
import {postPictureOfRemark} from "@/lib/picture-of-remark";
import {useRouter} from "next/router";
import {BuildingInterface, getAddress} from "@/lib/building";
import {getStudentOnTour, StudentOnTour, StudentOnTourStringDate} from "@/lib/student-on-tour";
import {GarbageCollectionInterface, garbageTypes, getGarbageCollectionFromBuilding} from "@/lib/garbage-collection";
import {BuildingComment, getAllBuildingCommentsByBuildingID} from "@/lib/building-comment";
import StudentHeader from "@/components/header/studentHeader";
import {BuildingManual, getManualPath, getManualsForBuilding} from "@/lib/building-manual";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {addDays, subDays} from "date-fns";
import {getBuildingsOfTour} from "@/lib/tour";

interface ParsedUrlQuery {
}

interface DataBuildingIdQuery extends ParsedUrlQuery {
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
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const [files, setFiles] = useState<File[]>([]);
    const [stepDescription, setStepDescription] = useState<string>("");

    // Registry for time, when a first picture is uploaded, that time is used & send to db
    const [timeRegistry, setTimeRegistry] = useState<Date | null>(null);

    const [showRemarkModal, setShowRemarkModal] = useState<boolean>(false);

    // The necessary info of a building
    const [building, setBuilding] = useState<BuildingInterface | null>(null);
    const [garbageCollections, setGarbageCollections] = useState<{[p: string]: GarbageCollectionInterface[]}>({});
    const [buildingComments, setBuildingComments] = useState<BuildingComment[]>([]);
    const [manual, setManual] = useState<BuildingManual | null>(null);
    const [buildingsOnTour, setBuildingsOnTour] = useState<BuildingInterface[]>([]);
    const [uploadedRemarks, setUploadedRemarks] = useState<RemarkAtBuilding[]>([]);

    useEffect(() => {
        const query: DataBuildingIdQuery = router.query as DataBuildingIdQuery;
        if (!query.studentOnTourId) {
            return;
        }
        // Get the building, garbage collection, buildingComments & studentOnTour
        getStudentOnTour(query.studentOnTourId).then((res) => {
            const sots: StudentOnTourStringDate = res.data;
            const sot: StudentOnTour = {
                id: sots.id,
                student: sots.student,
                tour: sots.tour,
                date: new Date(sots.date),
            };
            setStudentOnTour(sot);
            getBuildingsOnTour(sots.tour);
        }, console.error);
    }, [router.isReady]);

    // Get the new building when the index changes
    useEffect(() => {
        if (buildingsOnTour.length === 0) {
            return;
        }
        // Set is last building flag on true
        if (currentIndex + 1 == buildingsOnTour.length) {
            setIsLastBuilding(true);
        }
        getBuildingInfoAtIndex();
    }, [currentIndex, buildingsOnTour]);

    useEffect(() => {
        if (! studentOnTour || ! building) {
            return;
        }
        changeStep();
        const stepType : {[key: number] : "AA" | "BI" | "VE" | "OP"} = {
            0 : "AA",
            1 : "BI",
            2 : "VE"
        };
        const type = stepType[step];
        if (type){
            getRemarksOfStudentOnTourAtBuilding(building.id, studentOnTour.id, type).then(res => {
                const r : RemarkAtBuilding[] = res.data;
                console.log(r);
                setUploadedRemarks(r);
            }, console.error);
        }
    }, [step, building])

    // Get the buildings on a tour
    function getBuildingsOnTour(tourId: number) {
        getBuildingsOfTour(tourId).then((res) => {
            const bot: BuildingInterface[] = res.data;
            setBuildingsOnTour(bot);
        }, console.error);
    }

    // Get the garbage collection for a building for today
    function getGarbageCollection(buildingId: number) {
        const startDate = subDays(new Date(), 1);
        const endDate = addDays(new Date(), 1);
        getGarbageCollectionFromBuilding(buildingId, {
            startDate: startDate,
            endDate: endDate
        }).then((res) => {
            const col: GarbageCollectionInterface[] = res.data;

            const grouped: {[p: string]: GarbageCollectionInterface[]} =
                col.reduce((accumulator: { [key: string]: GarbageCollectionInterface[] }, current) => {
                    const d: string = new Date(current.date).toISOString().split('T')[0];
                    (accumulator[d] = accumulator[d] || []).push(current);
                    return accumulator;
                }, {})
            setGarbageCollections(grouped);
        }, console.error);
    }

    // Get the comments of a building
    function getBuildingComments(buildingId: number) {
        getAllBuildingCommentsByBuildingID(buildingId).then((res) => {
            const bc: BuildingComment[] = res.data;
            setBuildingComments(bc);
        }, console.error);
    }

    // Get the manual for a building
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

    // Get the buildingInfo at the currentIndex
    function getBuildingInfoAtIndex(): boolean {
        if (currentIndex >= buildingsOnTour.length) {
            return false;
        }
        const b: BuildingInterface = buildingsOnTour[currentIndex];
        setBuilding(b)
        getBuildingManual(b.id);
        getGarbageCollection(b.id);
        getBuildingComments(b.id);
        return true;
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
        if (!building || !studentOnTour) {
            return;
        }
        // There must be 1 picture to upload at minimum
        if (files.length === 0 && uploadedRemarks.length === 0) {
            setErrorMessages(["U moet ten minste 1 foto uploaden."]);
            return;
        }
        if (files) {
            // Post a remark & pictures with the remark for a building by a student on a tour.
            postRemarkAtBuilding(
                building.id,
                studentOnTour.id,
                stepDescription,
                timeRegistry ? timeRegistry : new Date(),
                typeRemarks[step]
            ).then((res) => {
                const remark: RemarkAtBuilding = res.data;
                files.forEach((f: File) => {
                    postPictureOfRemark(f, remark.id).then((_) => {
                    }, console.error);
                });

                if (step === finalStep) {
                    setStep(0);
                    setCurrentIndex(currentIndex + 1);
                } else {
                    setStep(step + 1);
                }
            }, console.error);
        } else {
            if (step === finalStep) {
                if (currentIndex + 1 === buildingsOnTour.length) {
                    if (! studentOnTour) {
                        return;
                    }
                    alert("Einde van tour");
                    const studentOnTourId: number = studentOnTour.id;
                    router
                        .push({
                            pathname: "/student/schedule",
                            query: {studentOnTourId},
                        })
                        .then();
                } else {
                    setStep(0);
                    setCurrentIndex(currentIndex + 1);
                }
            } else {
                setStep(step + 1);
            }
        }
    }

    function changeStep() {
        // remove all data
        setFiles([]);
        setTimeRegistry(null);
        setErrorMessages([]);
        setStepDescription("");
    }

    return (
        <>
            <StudentHeader/>
            <div className="m-2">
                <RemarkModal
                    onHide={() => setShowRemarkModal(false)}
                    show={showRemarkModal}
                    studentOnTour={studentOnTour}
                    building={building}
                />
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">{building ? getAddress(building) : ""}</h5>
                        {
                            <div className="row">
                                {
                                    Object.keys(garbageCollections).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map(key => {
                                        const col = garbageCollections[key];
                                        return (
                                            <div className="col" key={key}>
                                                <span>{new Date(key).toLocaleDateString('en-GB')}</span>
                                                <ul>
                                                    {col.map((gar: GarbageCollectionInterface) => (
                                                        <li key={gar.id} className="card-subtitle mb-2 text-muted">
                                                            {garbageTypes[gar.garbage_type]
                                                                ? garbageTypes[gar.garbage_type]
                                                                : gar.garbage_type}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })

                                }
                            </div>
                        }
                    </div>
                    {buildingComments.length > 0 && (
                        <>
                            <h5>Opmerkingen bij dit gebouw:</h5>
                            <ul className="list-group list-group-flush">
                                {buildingComments.map((bc: BuildingComment) => (
                                    <li className="list-group-item" key={bc.id}>
                                        {bc.comment}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {manual && (
                        <>
                            <h5>Handleiding van gebouw:</h5>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item">
                                    <a href={manual.file} download style={{textDecoration: "underline"}}>
                                        Handleiding
                                    </a>
                                </li>
                            </ul>
                        </>
                    )}
                </div>
                <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
                <Form onSubmit={handleSubmit}>
                    <span className="h1 mt-2">{typeNames[step]}</span>
                    <div className="mb-2 mt-2">
                        <label className="form-label">Beschrijving (optioneel):</label>
                        <textarea
                            className={`form-control form-control-lg`}
                            value={stepDescription}
                            onChange={(e) => setStepDescription(e.target.value)}
                        ></textarea>
                    </div>
                    <div>
                        <label className="form-label">Upload één of meerdere foto's:</label>
                        <input
                            className="form-control"
                            type="file"
                            onChange={(e) => {
                                handleFileChange(e);
                                e.target.value = ""; // reset the value of the input field
                            }}
                            accept="image/*"
                        />
                    </div>

                    <FileList files={files} handleRemoveFile={handleRemoveFile}/>
                    <Button
                        variant="primary"
                        className="btn-danger d-inline-block"
                        onClick={() => setShowRemarkModal(true)}
                    >
                        Maak een opmerking
                    </Button>
                    {
                        (step > 0 || currentIndex > 0) &&
                        <Button
                            variant="primary"
                            className="btn-dark d-inline-block"
                            onClick={() => {
                                if (step === 0) {
                                    setCurrentIndex(currentIndex - 1);
                                    setStep(2);
                                    return;
                                }
                                setStep(step - 1);
                            }}
                        >{step === 0 ? "Vorige gebouw" : "Vorige stap"}</Button>
                    }
                    <Button
                        variant="primary"
                        className="btn-dark d-inline-block"
                        type="submit"
                    >Volgende stap</Button>
                </Form>
            </div>
        </>
    );
}
