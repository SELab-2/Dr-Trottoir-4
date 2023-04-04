import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function EditEventModal(data : any) {
  const {event, isOpen, onClose, onSave} = data
  const [title, setTitle] = useState(event.title);
  const [start, setStart] = useState(event.start);
  const [end, setEnd] = useState(event.end);

  const handleSave = () => {
    onSave({ title, start, end });
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Event</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Start</label>
            <input
              type="datetime-local"
              className="form-control"
              value={start.toISOString().substring(0, 16)}
              onChange={(e) => setStart(new Date(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>End</label>
            <input
              type="datetime-local"
              className="form-control"
              value={end.toISOString().substring(0, 16)}
              onChange={(e) => setEnd(new Date(e.target.value))}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditEventModal;
