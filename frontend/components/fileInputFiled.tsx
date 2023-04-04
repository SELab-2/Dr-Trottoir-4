import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

interface FileInputFieldProps {
    onUpload: (files: FileList) => void;
}

function FileInputField(props: FileInputFieldProps) {
    const onUpload = props;
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (files)
            setSelectedFiles(event.target.files);
    }

    function handleSubmit(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();

        if (selectedFiles) {
            onUpload(selectedFiles);
            setSelectedFiles(null);
        }
    }


    return (
        <div>
        <Form onSubmit={handleSubmit}>
            <Form.Group>
            <Form.Label>Upload photos</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileChange} value={selectedFiles} />
            </Form.Group>
            <Button type="submit">Upload</Button>
        </Form>
        </div>
    );
}

export default MyComponent;