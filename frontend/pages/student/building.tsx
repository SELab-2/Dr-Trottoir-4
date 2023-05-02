import React, {useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";
import RemarkModal from "@/components/student/remarkModal";
import {FileList} from "@/components/student/fileList";
import {
    getRemarksOfStudentOnTourAtBuilding, patchRemarkAtBuilding,
    postRemarkAtBuilding,
    RemarkAtBuilding,
    remarkTypes
} from "@/lib/remark-at-building";
import {
    getPictureOfRemarkOfSpecificRemark, getPicturePath,
    PictureOfRemarkInterface,
    postPictureOfRemark
} from "@/lib/picture-of-remark";
import {useRouter} from "next/router";
import {BuildingInterface} from "@/lib/building";
import {getStudentOnTour, StudentOnTour, StudentOnTourStringDate} from "@/lib/student-on-tour";
import {
    GarbageCollectionInterface,
    getGarbageCollectionFromBuilding,
} from "@/lib/garbage-collection";
import {BuildingComment, getAllBuildingCommentsByBuildingID} from "@/lib/building-comment";
import StudentHeader from "@/components/header/studentHeader";
import {BuildingManual, getManualPath, getManualsForBuilding} from "@/lib/building-manual";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {addDays, subDays} from "date-fns";
import {getBuildingsOfTour} from "@/lib/tour";
import {FileListElement} from "@/types";
import {withAuthorisation} from "@/components/withAuthorisation";
import BuildingInfoView from "@/components/student/buildingInfoView";
import Comment from '@mui/icons-material/Comment';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';

interface ParsedUrlQuery {
}

interface DataBuildingIdQuery extends ParsedUrlQuery {
    studentOnTourId?: number;
}

/**
 * This page receives a studentOnTourId & buildingId, otherwise nothing is displayed
 */
function StudentBuilding() {
    const router = useRouter();
    const typeNames: string[] = ["Aankomst", "Binnen", "Vertrek"];
    const typeRemarks: string[] = [remarkTypes["arrival"], remarkTypes["inside"], remarkTypes["leaving"]];

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const [studentOnTour, setStudentOnTour] = useState<StudentOnTour | null>(null);

    // Steps for normal process through building (arrival, inside & leaving)
    const [step, setStep] = useState<number>(0);
    const finalStep = 2;
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const [picturesAtStep, setPicturesAtStep] = useState<FileListElement[]>([]);
    const [stepDescription, setStepDescription] = useState<string>("");

    const [showRemarkModal, setShowRemarkModal] = useState<boolean>(false);

    // The necessary info of a building
    const [building, setBuilding] = useState<BuildingInterface | null>(null);
    const [garbageCollections, setGarbageCollections] = useState<{ [p: string]: GarbageCollectionInterface[] }>({});
    const [buildingComments, setBuildingComments] = useState<BuildingComment[]>([]);
    const [manual, setManual] = useState<BuildingManual | null>(null);
    const [buildingsOnTour, setBuildingsOnTour] = useState<BuildingInterface[]>([]);
    const [stepRemark, setStepRemark] = useState<RemarkAtBuilding | null>(null); // for remarks : AA, VE, BI

    const [globalRemarks, setGlobalRemarks] = useState<RemarkAtBuilding[]>([]); // for remark OP

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
        getBuildingInfoAtIndex();
    }, [currentIndex, buildingsOnTour]);

    useEffect(() => {
        if (!studentOnTour || !building) {
            return;
        }
        changeStep();
        const stepType: { [key: number]: "AA" | "BI" | "VE" } = {
            0: "AA",
            1: "BI",
            2: "VE"
        };

        const type = stepType[step];

        if (type) { // Check if there are already remarks for this type
            getRemarksOfStudentOnTourAtBuilding(building.id, studentOnTour.id, type).then(res => {
                const r: RemarkAtBuilding[] = res.data;
                if (r.length > 0) {
                    setStepRemark(r[0]);
                    setStepDescription(r[0].remark);
                    getPictureOfRemarkOfSpecificRemark(r[0].id).then(p => {
                        const pictures: PictureOfRemarkInterface[] = p.data;
                        setPicturesAtStep(pictures.map(picture => {
                            return {
                                url: getPicturePath(picture.picture),
                                pictureId: picture.id,
                                file: null
                            };
                        }));
                    }, console.error);
                }
            }, console.error);
        }

        getRemarksOfStudentOnTourAtBuilding(building.id, studentOnTour.id, "OP").then(res => {
            const r: RemarkAtBuilding[] = res.data;
            if (r.length > 0) {
                setGlobalRemarks(r);
            } else {
                setGlobalRemarks([]);
            }
        }, console.error);
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
            const grouped: { [p: string]: GarbageCollectionInterface[] } = {};
            grouped[startDate.toISOString().split('T')[0]] = [];
            grouped[new Date().toISOString().split('T')[0]] = [];
            grouped[endDate.toISOString().split('T')[0]] = [];

            col.forEach(g => {
                const dateString: string = new Date(g.date).toISOString().split('T')[0]
                if (grouped[dateString]) {
                    grouped[dateString].push(g);
                }
            });

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
        if (stepRemark) { // PATCH the remark
            console.log("Patch");
            if (stepDescription != stepRemark.remark) {
                patchRemarkAtBuilding(stepRemark.id, stepDescription).then().catch(console.error);
            }
            picturesAtStep.forEach((f: FileListElement) => {
                if (f.file && !f.pictureId) {
                    postPictureOfRemark(f.file, stepRemark.id).then().catch(console.error);
                }
            });
            if (step === finalStep) {
                setStep(0);
                setCurrentIndex(currentIndex + 1);
            } else {
                setStep(step + 1);
            }
        } else { // POST
            let timeRegistry = new Date();
            const newPictures = picturesAtStep.filter(p => p.file);
            if (newPictures.length > 0) {
                timeRegistry = new Date(newPictures[0].file!.lastModified);
            }
            postRemarkAtBuilding(
                building.id,
                studentOnTour.id,
                stepDescription,
                timeRegistry,
                typeRemarks[step]
            ).then((res) => {
                const remark: RemarkAtBuilding = res.data;
                picturesAtStep.forEach((f: FileListElement) => {
                    if (f.file && !f.pictureId) {
                        postPictureOfRemark(f.file, remark.id).catch(console.error);
                    }
                });
                if (step === finalStep) {
                    setStep(0);
                    setCurrentIndex(currentIndex + 1);
                } else {
                    setStep(step + 1);
                }
            }, console.error);
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

    function getNextStepText() {
        if (currentIndex + 1 === buildingsOnTour.length && step === 2) {
            return "Beëindig tour";
        }
        if (step === 2) {
            return "Volgende gebouw";
        }
        return "Volgende stap";
    }

    return (
        <>
            <StudentHeader/>
            <RemarkModal
                onHide={() => setShowRemarkModal(false)}
                show={showRemarkModal}
                studentOnTour={studentOnTour}
                building={building}
            />
            <div className="m-2">
                <BuildingInfoView manual={manual} building={building}
                                  currentIndex={currentIndex}
                                  amountOfBuildings={buildingsOnTour.length}
                                  garbageCollections={garbageCollections}
                                  buildingComments={buildingComments}/>
                <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
                <Form onSubmit={handleSubmit} className="mt-2 mb-2">
                    <span className="h5 fw-bold mt-2">{typeNames[step]}</span>
                    <div className="mb-2 mt-2">
                        <label className="form-label">Beschrijving (optioneel):</label>
                        <textarea
                            className={`form-control form-control-lg`}
                            value={stepDescription}
                            onChange={(e) => setStepDescription(e.target.value)}
                        ></textarea>
                    </div>


                    <FileList files={picturesAtStep} setFiles={setPicturesAtStep} optional={false}/>


                    <div className="btn-group d-flex gap-0" role="group">
                        {
                            (step > 0 || currentIndex > 0) &&
                            <Button
                                variant="primary"
                                className="btn-dark"
                                onClick={() => {
                                    if (step === 0) {
                                        setCurrentIndex(currentIndex - 1);
                                        setStep(2);
                                        return;
                                    }
                                    setStep(step - 1);
                                }}
                            ><ArrowBack/>
                            </Button>
                        }
                        <Button
                            variant="primary"
                            className="btn-dark"
                            onClick={() => setShowRemarkModal(true)}
                        ><Comment/></Button>
                        <Button
                            variant="primary"
                            className="btn-dark"
                            type="submit"
                        ><ArrowForward/></Button>
                    </div>

                </Form>
            </div>
        </>
    );
}

export default withAuthorisation(StudentBuilding, ["Student", "Admin", "Superstudent"]);
