import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";

export default function StudentBuilding() {

    const [files, setFiles] = useState<File[]>([]);
    const [numFiles, setNumFiles] = useState<number>(1);
    const [startTime, setStartTime] = useState<Date>();
    const [fileFields, setFileFields] = useState<JSX.Element[]>([
        (
            <Form.Group key={0}>
                <Form.Label>Voeg bestand toe</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} accept="image/*"/>
            </Form.Group>
        )
    ])

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newFiles: FileList | null = event.target.files;
        if (!newFiles) {
            return;
        }
        if (numFiles === 1 && !startTime) {
            setStartTime(new Date())
        }
        const f : File = newFiles[0];
        setFiles([...files, f]);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        console.log(files);
    }

    function removeFile(index: number) {
        const newFiles = [...files];
        const newFileFields = [...fileFields];

        newFiles.splice(index, 1);
        newFileFields.splice(index, 1);

        setFiles(newFiles);
        setFileFields(newFileFields);
        setNumFiles(numFiles - 1);
    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                {fileFields}
                <Button onClick={() => {
                    setNumFiles(numFiles + 1);
                    setFileFields([...fileFields, (
                        <Form.Group key={fileFields.length}>
                            <Form.Label>Voeg bestand toe</Form.Label>
                            <Form.Control type="file" onChange={handleFileChange} accept="image/*"/>
                            <Button onClick={() => removeFile(fileFields.length)}>Remove file</Button>
                        </Form.Group>
                    )])
                }}>Upload nog bestanden</Button>
                <Button type="submit">Upload</Button>
            </Form>
        </div>
    );
}
