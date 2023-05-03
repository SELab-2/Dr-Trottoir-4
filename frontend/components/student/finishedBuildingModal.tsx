import {BuildingInterface} from "@/lib/building";
import {Button, Modal} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {getRemarksOfStudentOnTourAtBuilding, RemarkAtBuilding} from "@/lib/remark-at-building";
import {StudentOnTour} from "@/lib/student-on-tour";
import {getPictureOfRemarkOfSpecificRemark, getPicturePath, PictureOfRemarkInterface} from "@/lib/picture-of-remark";
import {FileList} from "@/components/student/fileList";

export default function FinishedBuildingModal(
    {
        show,
        onHide,
        studentOnTour,
        building,
        setBuilding
    }: {
        show: boolean;
        onHide: () => void
        studentOnTour: StudentOnTour | null;
        building: BuildingInterface | null;
        setBuilding: (b: BuildingInterface | null) => void;
    }
) {
    const typeNames: string[] = ["Aankomst", "Binnen", "Vertrek", "Opmerkingen"];
    const [remarks, setRemarks] = useState<RemarkAtBuilding[]>([]);
    const [picturesOfRemarks, setPicturesOfRemarks] = useState<{ [remarkId: number]: PictureOfRemarkInterface[] }>({});

    useEffect(() => {
        if (!building || !studentOnTour) {
            return;
        }
        getRemarksOfStudentOnTourAtBuilding(building.id, studentOnTour.id).then(res => {
            const r: RemarkAtBuilding[] = res.data;
            setRemarks(r);
            const pictures: { [remarkId: number]: PictureOfRemarkInterface[] } = {};
            r.forEach(remark => pictures[remark.id] = []);
            Promise.all(r.map(remark => getPictureOfRemarkOfSpecificRemark(remark.id))).then((results: any[]) => {
                results.forEach(res => {
                    const p: PictureOfRemarkInterface[] = res.data;
                    if (p.length > 0) {
                        pictures[p[0].remark_at_building] = p;
                    }
                });
                setPicturesOfRemarks(pictures);
            }, console.error);
        }, console.error);
    }, [building]);

    function getRemarksOfType(type : string): RemarkAtBuilding[] {
        return remarks.filter(r => r.type === type);
    }

    function close() {
        onHide();
        setRemarks([]);
        setPicturesOfRemarks({});
        setBuilding(null);
    }

    return (
        <Modal show={show} onHide={close}>
            <Modal.Header>
                <Modal.Title>Overzicht gebouw</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    ["AA", "BI", "VE", "OP"].map((t, index) => (
                        <div className="ms-2 me-2" key={index}>
                            {
                                getRemarksOfType(t).length > 0 &&
                                <>
                                    <p className="h4 fw-bold mt-2">{typeNames[index]}</p>
                                    {
                                        getRemarksOfType(t).map((r, index) => (
                                            <div key={index}>
                                                <span className="h5 mt-2">{r.remark}</span>
                                                {
                                                    picturesOfRemarks[r.id] &&
                                                    <FileList editable={false} files={picturesOfRemarks[r.id].map(p => {
                                                        return {
                                                            url: getPicturePath(p.picture),
                                                            pictureId: p.id,
                                                            file: null,
                                                        };
                                                    })} optional={false} setFiles={() => {
                                                    }}/>
                                                }
                                            </div>
                                        ))
                                    }
                                </>
                            }
                        </div>
                    ))
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className="btn-dark col" onClick={close}>
                    Ok
                </Button>
            </Modal.Footer>
        </Modal>
    );
}