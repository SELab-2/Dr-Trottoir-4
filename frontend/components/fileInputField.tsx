import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";

interface FileInputFieldProps {
    onUpload: (files: FileList) => void;
}

function FileInputField(props: FileInputFieldProps) {
    const { onUpload } = props;
    const [selectedFiles, setSelectedFiles] = useState<FileList | undefined>();

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (files) setSelectedFiles(files);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (selectedFiles) {
            onUpload(selectedFiles);
            setSelectedFiles(undefined);
        }
    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>Voeg bestand toe</Form.Label>
                    <Form.Control type="file" multiple onChange={handleFileChange} value={undefined} />
                </Form.Group>
                <Button type="submit">Upload</Button>
            </Form>
        </div>
    );
}

export default FileInputField;
