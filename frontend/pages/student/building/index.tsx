import React, {useEffect, useState} from "react";
import {Button, Form} from "react-bootstrap";

export default function StudentBuilding() {

    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        console.log(files);
    }, []);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newFiles: FileList | null = event.target.files;
        if (!newFiles) {
            return;
        }
        setFiles([...files, newFiles[0]]);
    }

    function handleRemoveFile(index: number) {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // Submit files to server
    }

    function downloadFile(file: File) {
        const fileUrl = URL.createObjectURL(file);
        const fileName = file.name;
        return (
            <a href={fileUrl} download={fileName}>
                {fileName}
            </a>
        );
    }

    return (
        <Form onSubmit={handleSubmit}>
            <div>
                <label className="form-label">Upload een foto</label>
                <input className="form-control" type="file" onChange={handleFileChange} accept="image/*"/>
            </div>
            <br/>
            {files.map((file, index) => (
                <div key={index}>
                    <div>{downloadFile(file)}</div>
                    <button type="button" onClick={() => handleRemoveFile(index)}>Remove</button>
                </div>
            ))}
            <br/>
            <button type="submit">Submit</button>
        </Form>
    );
}
