import {
    getRemarksOfStudentOnTourAtBuilding,
    patchRemarkAtBuilding,
    postRemarkAtBuilding,
    RemarkAtBuilding,
    remarkTypes,
} from "@/lib/remark-at-building";
import React, { useEffect, useState } from "react";
import { endStudentOnTour, getStudentOnTour, StudentOnTour, StudentOnTourStringDate } from "@/lib/student-on-tour";
import { FileListElement, Progress } from "@/types";
import { BuildingInterface } from "@/lib/building";
import { getBuildingsOfTour } from "@/lib/tour";
import {
    getPictureOfRemarkOfSpecificRemark,
    getPicturePath,
    PictureOfRemarkInterface,
    postPictureOfRemark,
} from "@/lib/picture-of-remark";
import { Apartment, ArrowBack, ArrowForward, AssignmentTurnedIn, Comment } from "@mui/icons-material";
import { useRouter } from "next/router";
import RemarkModal from "@/components/student/remarkModal";
import BuildingInfoView from "@/components/student/buildingInfoView";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { FileList } from "@/components/student/fileList";

export function WorkingView({ redirectTo, studentOnTourId }: { redirectTo: string; studentOnTourId: number | null }) {
    const router = useRouter();

    const typeNames: string[] = ["Aankomst", "Binnen", "Vertrek"];
    const typeRemarks: string[] = [remarkTypes["arrival"], remarkTypes["inside"], remarkTypes["leaving"]];

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const [studentOnTour, setStudentOnTour] = useState<StudentOnTour | null>(null);
    const [selectedGlobalRemark, setSelectedGlobalRemark] = useState<RemarkAtBuilding | null>(null);

    // Steps for normal process through building (arrival, inside & leaving)
    const [progress, setProgress] = useState<Progress>({
        step: 0,
        currentIndex: 0,
        maxIndex: 0,
    });

    const [picturesAtStep, setPicturesAtStep] = useState<FileListElement[]>([]);
    const [stepDescription, setStepDescription] = useState<string>("");

    const [showRemarkModal, setShowRemarkModal] = useState<boolean>(false);

    // The necessary info of a building
    const [building, setBuilding] = useState<BuildingInterface | null>(null);
    const [buildingsOnTour, setBuildingsOnTour] = useState<BuildingInterface[]>([]);
    const [stepRemark, setStepRemark] = useState<RemarkAtBuilding | null>(null); // for remarks : AA, VE, BI

    const [globalRemarks, setGlobalRemarks] = useState<RemarkAtBuilding[]>([]); // for remark OP

    useEffect(() => {
        if (!studentOnTourId) {
            return;
        }
        // Get the building, garbage collection, buildingComments & studentOnTour
        getStudentOnTour(studentOnTourId)
            .then((res) => {
                const sots: StudentOnTourStringDate = res.data;
                const sot: StudentOnTour = {
                    id: sots.id,
                    student: sots.student,
                    tour: sots.tour,
                    date: new Date(sots.date),
                    max_building_index: sots.max_building_index - 1,
                    current_building_index: sots.current_building_index <= 1 ? 0 : sots.current_building_index - 1,
                    started_tour: sots.started_tour,
                    completed_tour: sots.completed_tour,
                };
                if (sot.completed_tour) {
                    // Tour is completed, redirect to no access
                    router.replace("/no-access").then((_) => {});
                }
                setProgress({
                    step: 0,
                    currentIndex: sot.current_building_index,
                    maxIndex: sot.max_building_index,
                });
                setStudentOnTour(sot);
                getBuildingsOnTour(sots.tour);
            })
            .catch((_) => {});
    }, [studentOnTourId]);

    useEffect(() => {
        if (!studentOnTour) {
            return;
        }
        // Set the initial info when the buildings of the tour are retrieved
        getBuidingAtIndex(studentOnTour.current_building_index);
    }, [studentOnTour, buildingsOnTour]);

    // Get the buildings on a tour
    function getBuildingsOnTour(tourId: number) {
        getBuildingsOfTour(tourId)
            .then((res) => {
                const bot: BuildingInterface[] = res.data;
                setBuildingsOnTour(bot);
            })
            .catch((_) => {});
    }

    // Get the buildingInfo at the currentIndex
    function getBuidingAtIndex(index: number): BuildingInterface | null {
        if (index >= buildingsOnTour.length || index < 0 || !studentOnTour) {
            return null;
        }
        const b: BuildingInterface = buildingsOnTour[index];
        setBuilding(b);
        getRemarkInfo(b.id, progress.step);
        getGlobalRemarksOfBuilding(b.id);
        return b;
    }

    // Get the global remarks of a building RemarkAtBuilding.type === "OP"
    function getGlobalRemarksOfBuilding(buildingId: number) {
        if (!studentOnTour) {
            return;
        }
        getRemarksOfStudentOnTourAtBuilding(buildingId, studentOnTour.id, "OP")
            .then((res) => {
                const r: RemarkAtBuilding[] = res.data;
                if (r.length > 0) {
                    setGlobalRemarks(r);
                } else {
                    setGlobalRemarks([]);
                }
            })
            .catch((_) => {});
    }

    // Get the remark of a step
    function getRemarkInfo(buildingId: number, step: number) {
        if (!studentOnTour) {
            return;
        }
        const stepType: { [key: number]: "AA" | "BI" | "VE" } = {
            0: "AA",
            1: "BI",
            2: "VE",
        };
        const type = stepType[step];
        if (!type) {
            return;
        }
        getRemarksOfStudentOnTourAtBuilding(buildingId, studentOnTour.id, type)
            .then((res) => {
                const r: RemarkAtBuilding[] = res.data;
                if (r.length > 0) {
                    setStepRemark(r[0]);
                    setStepDescription(r[0].remark);
                    getPictureOfRemarkOfSpecificRemark(r[0].id)
                        .then((p) => {
                            const pictures: PictureOfRemarkInterface[] = p.data;
                            setPicturesAtStep(
                                pictures.map((picture) => {
                                    return {
                                        url: getPicturePath(picture.picture),
                                        pictureId: picture.id,
                                        file: null,
                                    };
                                })
                            );
                        })
                        .catch((_) => {});
                }
            })
            .catch((_) => {});
    }

    // Handle the submit event
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!building || !studentOnTour) {
            return;
        }
        // There must be 1 picture to upload at minimum
        if (picturesAtStep.length === 0) {
            setErrorMessages(["U moet ten minste 1 foto uploaden."]);
            return;
        }
        if (stepRemark) {
            // PATCH the remark
            if (stepDescription != stepRemark.remark) {
                patchRemarkAtBuilding(stepRemark.id, stepDescription).then().catch(console.error);
            }
            picturesAtStep.forEach((f: FileListElement) => {
                if (f.file && !f.pictureId) {
                    postPictureOfRemark(f.file, stepRemark.id).then().catch(console.error);
                }
            });
            increaseStep();
        } else {
            // POST
            let timeRegistry = new Date();
            postRemarkAtBuilding(
                building.id,
                studentOnTour.id,
                stepDescription,
                timeRegistry,
                typeRemarks[progress.step]
            )
                .then((res) => {
                    const remark: RemarkAtBuilding = res.data;
                    picturesAtStep.forEach((f: FileListElement) => {
                        if (f.file && !f.pictureId) {
                            postPictureOfRemark(f.file, remark.id).catch(console.error);
                        }
                    });
                    increaseStep();
                })
                .catch((_) => {});
        }
    }

    function changeStep() {
        // remove all data
        setPicturesAtStep([]);
        setStepRemark(null);
        setPicturesAtStep([]);
        setErrorMessages([]);
        setStepDescription("");
    }

    // Go one step forward
    function increaseStep() {
        changeStep();
        // if step is 2, we go to next building or finish the tour
        if (progress.step === 2) {
            if (progress.currentIndex === progress.maxIndex) {
                // finish
                // route back to schedule
                if (studentOnTour) {
                    redirectToSchedule(studentOnTour.id);
                }
            } else {
                // next building
                const newIndex = progress.currentIndex + 1;
                const newStep = 0;
                const b = getBuidingAtIndex(newIndex);
                if (b) {
                    getRemarkInfo(b.id, newStep);
                    getGlobalRemarksOfBuilding(b.id);
                }
                setProgress((prevState) => {
                    const newState: Progress = { ...prevState };
                    newState.step = newStep;
                    newState.currentIndex = newIndex;
                    return newState;
                });
            }
            return;
        } else {
            if (!building) {
                return;
            }
            const newStep = progress.step + 1;
            getRemarkInfo(building.id, newStep);
            setProgress((prevState) => {
                const newState: Progress = { ...prevState };
                newState.step = newStep;
                return newState;
            });
        }
    }

    // Go one step back
    function decreaseStep() {
        changeStep();
        if (progress.currentIndex > 0 && progress.step === 0) {
            // Go to previous building
            const newIndex = progress.currentIndex - 1;
            const newStep = 2;
            const b = getBuidingAtIndex(newIndex);
            if (b) {
                getRemarkInfo(b.id, newStep);
                getGlobalRemarksOfBuilding(b.id);
            }
            setProgress((prevState) => {
                const newState: Progress = { ...prevState };
                newState.step = newStep;
                newState.currentIndex = newIndex;
                return newState;
            });
        } else {
            if (!building) {
                return;
            }
            const newStep = progress.step - 1;
            getRemarkInfo(building.id, newStep);
            setProgress((prevState) => {
                const newState: Progress = { ...prevState };
                newState.step = newStep;
                return newState;
            });
        }
    }

    // Add a global remark to the list
    function afterPostGlobalRemark(remark: RemarkAtBuilding) {
        setGlobalRemarks((prevState) => {
            return [...prevState, remark];
        });
    }

    // Change the global remark after a patch request
    function afterPatchGlobalRemark(remark: RemarkAtBuilding) {
        setGlobalRemarks((prevState) => {
            const index = prevState.findIndex((r) => r.id === remark.id);
            if (index < 0) {
                return prevState;
            }
            const newState = [...prevState];
            newState[index] = remark;
            return newState;
        });
    }

    // Remove the global remark of a building after a delete request
    function afterDeleteGlobalRemark(remark: RemarkAtBuilding) {
        setGlobalRemarks((prevState) => {
            const index = prevState.findIndex((r) => r.id === remark.id);
            if (index < 0) {
                return prevState;
            }
            const newState = [...prevState];
            newState.splice(index, 1);
            return newState;
        });
    }

    // Redirect to the schedule page
    function redirectToSchedule(studentOnTourId: number): void {
        router
            .push({
                pathname: redirectTo,
                query: { studentOnTourId },
            })
            .then();
    }

    /**
     * 2 functions that render the correct icons
     */
    function getNextStepIcon() {
        if (progress.currentIndex === progress.maxIndex && progress.step === 2) {
            return <AssignmentTurnedIn />;
        }
        if (progress.step === 2) {
            return (
                <>
                    <Apartment />
                    <ArrowForward />
                </>
            );
        }
        return <ArrowForward />;
    }

    function getPreviousStepIcon() {
        if (progress.step === 0) {
            return (
                <>
                    <ArrowBack />
                    <Apartment />
                </>
            );
        }
        return <ArrowBack />;
    }

    return (
        <>
            <RemarkModal
                onHide={() => setShowRemarkModal(false)}
                show={showRemarkModal}
                studentOnTour={studentOnTour}
                building={building}
                selectedRemark={selectedGlobalRemark}
                setSelectedRemark={setSelectedGlobalRemark}
                onPost={afterPostGlobalRemark}
                onPatch={afterPatchGlobalRemark}
                onDelete={afterDeleteGlobalRemark}
            />
            <div className="m-2">
                <BuildingInfoView
                    building={building}
                    currentIndex={progress.currentIndex}
                    amountOfBuildings={buildingsOnTour.length}
                />
                <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
                <Form onSubmit={handleSubmit} className="mt-2 mb-2">
                    <span className="h5 fw-bold mt-2">{typeNames[progress.step]}</span>
                    <Form.Group className="mb-2 mt-2">
                        <Form.Label>Beschrijving (optioneel):</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={stepDescription}
                            onChange={(e) => setStepDescription(e.target.value)}
                        />
                    </Form.Group>

                    <FileList files={picturesAtStep} setFiles={setPicturesAtStep} optional={false} editable />

                    <ButtonGroup className="d-flex gap-0 m-0" role="group">
                        {(progress.step > 0 || progress.currentIndex > 0) && (
                            <Button
                                variant="primary"
                                className="btn-dark"
                                onClick={() => {
                                    decreaseStep();
                                }}
                            >
                                {getPreviousStepIcon()}
                            </Button>
                        )}
                        <Button variant="primary" className="btn-dark" onClick={() => setShowRemarkModal(true)}>
                            <Comment />
                        </Button>
                        <Button variant="primary" className="btn-dark" type="submit">
                            {getNextStepIcon()}
                        </Button>
                    </ButtonGroup>
                </Form>
                {globalRemarks.length > 0 && (
                    <>
                        <span className="h6 fw-bold">Mijn algemene opmerkingen:</span>
                        <ul>
                            {globalRemarks.map((remark, index) => (
                                <li key={index}>
                                    <a
                                        style={{ color: "royalblue" }}
                                        onClick={() => {
                                            setSelectedGlobalRemark(remark);
                                            setShowRemarkModal(true);
                                        }}
                                    >
                                        {`Opmerking ${index + 1}`}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </>
    );
}
