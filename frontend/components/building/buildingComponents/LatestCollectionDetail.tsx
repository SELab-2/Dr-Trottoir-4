import {useEffect, useState} from "react";
import {
    getRemarksAtBuildingOfSpecificBuilding,
    RemarkAtBuildingInterface,
    translateRemartAtBuildingType
} from "@/lib/remark-at-building";
import {Card} from "react-bootstrap";
import {getPictureOfRemarkOfSpecificRemark, PictureOfRemarkInterface} from "@/lib/picture-of-remark";

function LatestCollectionDetail({building}: { building: number }) {

    const [remarks, setRemarks] = useState<RemarkAtBuildingInterface[]>([]);
    const [pictures, setPictures] = useState<string[]>([]);
    const [date, setDate] = useState<Date | undefined>();

    useEffect(() => {
        if (!building)
            return;
        getRemarksAtBuildingOfSpecificBuilding(building, true)
            .then((response) => {
                setRemarks(response.data.sort(
                    (a: RemarkAtBuildingInterface, b: RemarkAtBuildingInterface) => {
                        for (let t of ["AA", "BI", "VE", "OP"]) {
                            if (a.type == t) {
                                return 1;
                            }
                            if (b.type == t) {
                                return -1;
                            }
                        }
                    }
                ));

            })
            .catch((error) => {
                console.error(error);
            })
    }, [building]);


    useEffect(() => {

        let remarkPictures: string[] = [];

        for (let remark of remarks) {
            getPictureOfRemarkOfSpecificRemark(remark.id)
                .then((response) => {
                    remarkPictures.push(...response.data.map((picture: PictureOfRemarkInterface) => picture.picture));
                    setPictures([...remarkPictures]);
                })
                .catch((error) => {
                    console.error(error);
                });
        }

    }, [remarks])

    useEffect(() => {
        if (remarks.length > 0) {
            setDate(remarks[0].timestamp);
        }
    }, [remarks]);


    return (
        <>
            <h1>Details laatste ophaling</h1>

            <h3>{date ? `${new Date(date).getDate()}/${new Date(date).getMonth() + 1}/${new Date(date).getFullYear()}` : "Details"}</h3>

            {pictures.length === 0 ? (
                <p>Geen foto's om weer te geven</p>
            ) : (
                pictures.map((picture: string, index: number) => {
                    //TODO: misschien fixen dat als je klikt op de foto, deze vergroot wordt weergegeven
                    return (
                        <div key={index} className="m-2">
                            <img src={`${process.env.NEXT_PUBLIC_BASE_API_URL}${picture}`} alt={`Media ${index + 1}`}
                                 style={{maxWidth: "20%"}}/>
                        </div>
                    );
                })
            )
            }

            <h3>Opmerkingen</h3>
            {remarks.map((remark: RemarkAtBuildingInterface) => {
                return (
                    <Card key={remark.id}>
                        <Card.Body>
                            <Card.Title>{translateRemartAtBuildingType(remark.type)}</Card.Title>
                            <Card.Subtitle>{remark.timestamp ? String(remark.timestamp) : ""}</Card.Subtitle>
                            <Card.Text>{remark.remark || "Geen opmerkingen"}</Card.Text>
                        </Card.Body>
                    </Card>
                )
            })
            }

        </>
    )


}


export default LatestCollectionDetail;
