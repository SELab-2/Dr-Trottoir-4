import {useEffect, useState} from "react";
import {
    getRemarksAtBuildingOfSpecificBuilding,
    RemarkAtBuildingInterface,
    translateRemarkAtBuildingType
} from "@/lib/remark-at-building";
import {getPictureOfRemarkOfSpecificRemark, PictureOfRemarkInterface} from "@/lib/picture-of-remark";
import {Accordion, Card} from "react-bootstrap";
import ImageEnlargeModal from "@/components/ImageEnlargeModal";


function CollectionCards({building}: { building: number }) {

    const [collectionDetails, setCollectionDetails] = useState<[RemarkAtBuildingInterface, PictureOfRemarkInterface[]][] | []>([]);

    const [enlargeImageShow, setEnlargeImageShow] = useState<boolean>(false);
    const [enlargeImageURL, setEnlargeImageURL] = useState<string>("");


    useEffect(() => {


        getRemarksAtBuildingOfSpecificBuilding(building, true)
            .then((response) => {

                const responseData: RemarkAtBuildingInterface[] = response.data.sort((a: RemarkAtBuildingInterface, b: RemarkAtBuildingInterface) => {
                    for (let t of ["AA", "BI", "VE", "OP"]) {
                        if (a.type == t) {
                            return -1;
                        }
                        if (b.type == t) {
                            return 1;
                        }
                    }
                });

                const fetchPictures = responseData.map((remark) =>
                    getPictureOfRemarkOfSpecificRemark(remark.id)
                );

                Promise.all(fetchPictures)
                    .then((responses) => {

                        const pictureData: PictureOfRemarkInterface[][] = responses.map(
                            (response) => response.data
                        );

                        const newCollectionDetails: [RemarkAtBuildingInterface, PictureOfRemarkInterface[]][] =
                            responseData.map(
                                (remark, index) => [
                                    remark,
                                    pictureData[index],
                                ]);

                        setCollectionDetails(newCollectionDetails);

                    })
                    .catch((error) => {
                        console.error(error);
                    });

            })
            .catch((error) => {
                console.error(error);
            });

    }, [building]);

    function imageClick(url: string) {
        setEnlargeImageURL(url);
        setEnlargeImageShow(true);
    }

    return (
        <>
            <ImageEnlargeModal show={enlargeImageShow} setShow={setEnlargeImageShow} imageURL={enlargeImageURL}/>

            <h1>Details laatste ophaling</h1>
            <div style={{margin: "0 0", width: "75%", maxWidth: "95%"}}>
                {collectionDetails.length == 0}
                <Accordion alwaysOpen>
                    {collectionDetails.map(([remark, pictures]) => (
                        <Accordion.Item eventKey={remark.id + ""} key={remark.id}>
                            <Accordion.Header>
                                {translateRemarkAtBuildingType(remark.type)}
                            </Accordion.Header>
                            <Accordion.Body>
                                <Card.Subtitle className="mb-2 text-muted">
                                    {remark.timestamp + ''}
                                </Card.Subtitle>
                                <Card.Text>{remark.remark}</Card.Text>
                                <div>
                                    {pictures.map(picture => (
                                        <Card.Img
                                            key={picture.id}
                                            src={`${("" + process.env.NEXT_PUBLIC_BASE_API_URL).slice(0, -1)}${picture.picture}`} // Update the base URL accordingly
                                            alt="Remark picture"
                                            style={{
                                                maxHeight: '15em',
                                                width: "auto",
                                                maxWidth: "95%",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => imageClick(`${("" + process.env.NEXT_PUBLIC_BASE_API_URL).slice(0, -1)}${picture.picture}`)}
                                        />
                                    ))}
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </div>
        </>
    );

}

export default CollectionCards;
