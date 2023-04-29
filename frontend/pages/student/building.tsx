import React, {useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";
import RemarkModal from "@/components/student/remarkModal";
import {FileList} from "@/components/student/fileList";
import {postRemarkAtBuilding, RemarkAtBuilding, remarkTypes} from "@/lib/remark-at-building";
import {postPictureOfRemark} from "@/lib/picture-of-remark";
import {useRouter} from "next/router";
import {BuildingInterface, getAddress, getBuildingInfo} from "@/lib/building";
import {getStudentOnTour, StudentOnTour, StudentOnTourStringDate} from "@/lib/student-on-tour";
import {GarbageCollectionInterface, garbageTypes, getGarbageCollectionFromBuilding} from "@/lib/garbage-collection";
import {BuildingComment, getAllBuildingCommentsByBuildingID} from "@/lib/building-comment";
import StudentHeader from "@/components/header/studentHeader";
import {BuildingManual, getManualPath, getManualsForBuilding} from "@/lib/building-manual";
import {BuildingOnTour, getAllBuildingsOnTourWithTourID} from "@/lib/building-on-tour";
import BuildingOverview from "@/components/student/buildingOverview";
import ErrorMessageAlert from "@/components/errorMessageAlert";

interface ParsedUrlQuery {}

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
    const [garbageCollections, setGarbageCollections] = useState<GarbageCollectionInterface[]>([]);
    const [buildingComments, setBuildingComments] = useState<BuildingComment[]>([]);
    const [manual, setManual] = useState<BuildingManual | null>(null);
    const [buildingsOnTour, setBuildingsOnTour] = useState<BuildingOnTour[]>([]);

    // buildingOverview
    const [showBuildingOverview, setShowBuildingOverview] = useState<boolean>(false);
    const [isLastBuilding, setIsLastBuilding] = useState<boolean>(false);

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

    // Get the building with id
    function getBuilding(buildingId: number) {
        getBuildingInfo(buildingId).then((res) => {
            const b: BuildingInterface = res.data;
            setBuilding(b);
        }, console.error);
    }

    // Get the buildings on a tour
    function getBuildingsOnTour(tourId: number) {
        getAllBuildingsOnTourWithTourID(tourId).then((res) => {
            const bot: BuildingOnTour[] = res.data;
            bot.sort((a, b) => a.index - b.index);
            setBuildingsOnTour(bot);
        }, console.error);
    }

    // Get the garbage collection for a building for today
    function getGarbageCollection(buildingId: number) {
        getGarbageCollectionFromBuilding(buildingId, { startDate: new Date(), endDate: new Date() }).then((res) => {
            const col: GarbageCollectionInterface[] = res.data;
            setGarbageCollections(col);
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
        const buildingOnTour: BuildingOnTour = buildingsOnTour[currentIndex];
        getBuilding(buildingOnTour.building);
        getBuildingManual(buildingOnTour.building);
        getGarbageCollection(buildingOnTour.building);
        getBuildingComments(buildingOnTour.building);
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
        if (files.length === 0) {
            setErrorMessages(["U moet ten minste 1 foto uploaden."]);
            return;
        }

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
                postPictureOfRemark(f, remark.id).then((_) => {}, console.error);
            });

            // remove all data
            setFiles([]);
            setTimeRegistry(null);
            setErrorMessages([]);
            setStepDescription("");

            if (step === finalStep) {
                // show finish building modal
                setShowBuildingOverview(true);
            } else {
                setStep((prevState) => prevState + 1);
            }
        }, console.error);
    }

    // Close the building overview & redirect back to schedule
    function closeBuildingOverviewModal() {
        setShowBuildingOverview(false);
        setStep(0);
        if (currentIndex + 1 === buildingsOnTour.length) {
            if (!studentOnTour) {
                return;
            }
            const studentOnTourId: number = studentOnTour.id;
            alert("Einde van tour");
            router
                .push({
                    pathname: "/student/schedule",
                    query: { studentOnTourId },
                })
                .then();
        } else {
            setCurrentIndex((prevIndex) => prevIndex + 1);
        }
    }

    return (
        <>
            <StudentHeader />
            <div className="m-2">
                <RemarkModal
                    onHide={() => setShowRemarkModal(false)}
                    show={showRemarkModal}
                    studentOnTour={studentOnTour}
                    building={building}
                />
                <BuildingOverview
                    show={showBuildingOverview}
                    closeModal={closeBuildingOverviewModal}
                    building={building}
                    finish={isLastBuilding}
                />
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">{building ? getAddress(building) : ""}</h5>
                        {
                            <ul>
                                {garbageCollections.map((gar: GarbageCollectionInterface) => (
                                    <li key={gar.id} className="card-subtitle mb-2 text-muted">
                                        {garbageTypes[gar.garbage_type]
                                            ? garbageTypes[gar.garbage_type]
                                            : gar.garbage_type}
                                    </li>
                                ))}
                            </ul>
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
                                    <a href={manual.file} download style={{ textDecoration: "underline" }}>
                                        Handleiding
                                    </a>
                                </li>
                            </ul>
                        </>
                    )}
                </div>
                <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
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

                    <FileList files={files} handleRemoveFile={handleRemoveFile} />
                    <Button
                        variant="primary"
                        className="btn-danger d-inline-block"
                        onClick={() => setShowRemarkModal(true)}
                    >
                        Maak een opmerking
                    </Button>
                    <Button
                        variant="primary"
                        className="btn-dark d-inline-block"
                        type="submit"
                    >{`Upload bestanden`}</Button>
                </Form>
            </div>
        </>
    );
}
