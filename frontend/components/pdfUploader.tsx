import React, {ChangeEvent, useState} from "react";
import styles from "@/styles//PDFUploader.module.css";
import {Form} from "react-bootstrap";


interface Props {
    onUpload: (file: File) => void;
}

const PDFUploader: React.FC<Props> = ({onUpload}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.type === "application/pdf") {
                setSelectedFile(file);
            } else {
                alert("Selecteer een PDF-bestand.");
            }
        }
    };

    return (
        <div>
            <Form.Group controlId="manual">

                <Form.Label>Handleiding PDF (optioneel)</Form.Label>
                <br/>
                <label htmlFor="pdf-upload" className={styles.customFileUpload}>
                    {selectedFile ? selectedFile.name : "Kies een bestand"}
                </label>
                <input
                    type="file"
                    id="pdf-upload"
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className={styles.hiddenFileInput}
                />
            </Form.Group>

        </div>
    );
};

export default PDFUploader;
