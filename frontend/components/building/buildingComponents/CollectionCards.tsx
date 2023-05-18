import React, {useEffect, useState} from "react";
import {
    getRemarksAtBuildingOfSpecificBuilding,
    RemarkAtBuildingInterface,
    translateRemarkAtBuildingType,
} from "@/lib/remark-at-building";
import {getPictureOfRemarkOfSpecificRemark, PictureOfRemarkInterface} from "@/lib/picture-of-remark";
import {Accordion, Card} from "react-bootstrap";
import ImageEnlargeModal from "@/components/ImageEnlargeModal";
import {convertToSensibleDateLong, convertToSensibleDateShort} from "@/lib/dateUtil";
import {AxiosResponse} from "axios";
import {handleError} from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";

function CollectionCards({building, date}: { building: number; date: string | null }) {
    const [collectionDetails, setCollectionDetails] = useState<[RemarkAtBuildingInterface, PictureOfRemarkInterface[]][] | []>([]);

    const [enlargeImageShow, setEnlargeImageShow] = useState<boolean>(false);
    const [enlargeImageURL, setEnlargeImageURL] = useState<string>("");

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const connectToWebSocket = (websocketURL: string, callback: () => void) => {
        const client = new WebSocket(websocketURL);

        client.onopen = () => {
        };

        client.addEventListener("message", () => {
            callback();
        });

        client.onclose = () => {
        };
    };

    function handleRemarksAtBuildingsCall(response: AxiosResponse) {
        const responseData: RemarkAtBuildingInterface[] = response.data.sort(
            (a: RemarkAtBuildingInterface, b: RemarkAtBuildingInterface) => {
                for (let t of ["AA", "BI", "VE", "OP"]) {
                    if (a.type == t) {
                        return -1;
                    }
                    if (b.type == t) {
                        return 1;
                    }
                }
            }
        );

        const fetchPictures = responseData.map((remark) => getPictureOfRemarkOfSpecificRemark(remark.id));

        Promise.all(fetchPictures)
            .then((responses) => {
                const pictureData: PictureOfRemarkInterface[][] = responses.map((response) => response.data);

                const newCollectionDetails: [RemarkAtBuildingInterface, PictureOfRemarkInterface[]][] =
                    responseData.map((remark, index) => [remark, pictureData[index]]);

                setCollectionDetails(newCollectionDetails);
                setErrorMessages([]);
            })
            .catch((error) => {
                setErrorMessages(handleError(error));
            });
    }

    function fetchData() {
        if (date) {
            getRemarksAtBuildingOfSpecificBuilding(building, {date: date})
                .then((response) => {
                    handleRemarksAtBuildingsCall(response);
                    setErrorMessages([]);
                })
                .catch((error) => {
                    setErrorMessages(handleError(error));
                });
        } else {
            getRemarksAtBuildingOfSpecificBuilding(building, {mostRecent: true})
                .then((response) => {
                    handleRemarksAtBuildingsCall(response);
                    setErrorMessages([]);
                })
                .catch((error) => {
                    setErrorMessages(handleError(error));
                });
        }
    }

    useEffect(() => {
        fetchData();
        connectToWebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}building/${building}/remarks/`, fetchData);
    }, [building]);

    function imageClick(url: string) {
        setEnlargeImageURL(url);
        setEnlargeImageShow(true);
    }

    return (
        <>
            <ImageEnlargeModal show={enlargeImageShow} setShow={setEnlargeImageShow} imageURL={enlargeImageURL}/>

            <label className="title">Details laatste ophaling {date ? "(" + convertToSensibleDateShort(date) + ")" : null}</label>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
            <div>
                {collectionDetails.length == 0 ? (
                    <p className="normal_text">Er zijn geen ophalingen gevonden.</p>
                ) : (
                    <Accordion alwaysOpen>
                        {collectionDetails.map(([remark, pictures]) => (
                            <Accordion.Item eventKey={remark.id + ""} key={remark.id}>
                                <Accordion.Header>
                                    <div>
                                        <strong>{translateRemarkAtBuildingType(remark.type)}</strong>
                                        <Card.Subtitle style={{fontSize: '14px'}}>
                                            {convertToSensibleDateLong(remark.timestamp + "")}
                                        </Card.Subtitle> <br/>
                                        <Card.Text>{remark.remark}</Card.Text>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div>
                                        {pictures.map((picture: PictureOfRemarkInterface) => (
                                            <Card.Img
                                                key={picture.id}
                                                src={`${("" + process.env.NEXT_PUBLIC_BASE_API_URL).slice(0, -1)}${
                                                    picture.picture
                                                }`}
                                                alt="Remark picture"
                                                style={{
                                                    width: "auto",
                                                    maxWidth: "95%",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                    imageClick(
                                                        `${("" + process.env.NEXT_PUBLIC_BASE_API_URL).slice(0, -1)}${
                                                            picture.picture
                                                        }`
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                )}
            </div>
        </>
    );
}

export default CollectionCards;
