import { useState } from "react";
import { Col, Container, Image, Row } from "react-bootstrap";

type PhotoSelectorProps = {
    photos: string[];
    onSelectionChange: (selectedPhotos: string[]) => void;
};

const PhotoSelector = ({ photos, onSelectionChange }: PhotoSelectorProps) => {
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

    const toggleSelection = (photo: string) => {
        if (selectedPhotos.includes(photo)) {
            setSelectedPhotos(selectedPhotos.filter((p) => p !== photo));
        } else {
            setSelectedPhotos([...selectedPhotos, photo]);
        }
    };

    const isSelected = (photo: string) => selectedPhotos.includes(photo);

    const handleSelectionChange = () => {
        onSelectionChange(selectedPhotos);
    };

    return (
        <Container>
            <div
                style={{
                    display: "inline-block",
                    margin: "10px",
                    cursor: "pointer",
                    maxHeight: "300px",
                    overflowY: "scroll",
                }}
            >
                <Row lg={1}>
                    {photos.map((photo) => (
                        <Col key={photo}>
                            <div
                                style={{ border: isSelected(photo) ? "3px solid blue" : "none" }}
                                onClick={() => toggleSelection(photo)}
                            >
                                <Image src={photo} thumbnail fluid alt={photo}/>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>
            <button onClick={handleSelectionChange}>Voeg toe</button>
        </Container>
    );
};

export default PhotoSelector;
