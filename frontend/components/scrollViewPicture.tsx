import { useState } from "react";
import { Container, Row, Col, Image } from "react-bootstrap";

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
      <Row xs={2} md={3} lg={4} className="g-4">
        {photos.map((photo) => (
          <Col key={photo}>
            <div
              className={`p-2 border rounded ${
                isSelected(photo) ? "border-primary" : ""
              }`}
              onClick={() => toggleSelection(photo)}
            >
              <Image src={photo} thumbnail fluid />
            </div>
          </Col>
        ))}
      </Row>
      <button onClick={handleSelectionChange}>Save Selection</button>
    </Container>
  );
};

export default PhotoSelector;
