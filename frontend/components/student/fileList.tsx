import { IconButton, Tooltip } from "@mui/material";
import { FileListElement } from "@/types";
import { deletePictureOfRemark } from "@/lib/picture-of-remark";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ClearIcon from "@mui/icons-material/Clear";
import { Button } from "react-bootstrap";
import React, { useState } from "react";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { handleError } from "@/lib/error";

export function FileList({
    files,
    setFiles,
    optional,
    editable,
}: {
    files: FileListElement[];
    setFiles: (f: FileListElement[]) => void;
    optional: boolean;
    editable: boolean;
}) {
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    // Handle when a file is selected
    function handleFileAdd(event: React.ChangeEvent<any>) {
        const newFiles: FileList | null = event.target.files;
        if (!newFiles || newFiles.length <= 0) {
            return;
        }
        const updatedFiles = Array.from(newFiles).map((file: File) => ({
            url: URL.createObjectURL(file),
            file: file,
            pictureId: null,
        }));
        setFiles([...files, ...updatedFiles]);
    }

    // Remove a file from the list of selected files
    function handleRemoveFile(index: number) {
        const el: FileListElement = files[index];
        if (!el.file && el.pictureId) {
            deletePictureOfRemark(el.pictureId)
                .then((_) => {
                    const newFiles = [...files];
                    newFiles.splice(index, 1);
                    setFiles(newFiles);
                })
                .catch((err) => setErrorMessages(handleError(err)));
        } else {
            const newFiles = [...files];
            newFiles.splice(index, 1);
            setFiles(newFiles);
        }
    }

    return (
        <>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            {editable && (
                <div>
                    <label htmlFor={"photos"} className="custom-file-input-label">
                        <Button
                            type="button"
                            style={{
                                height: "40px",
                                backgroundColor: "#1d1d1d",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onClick={(e) => document.getElementById("photos")?.click()}
                        >
                            <CameraAltIcon style={{ marginRight: "5px", height: "20px" }} />
                            Upload foto's
                        </Button>
                    </label>
                    <input
                        id={"photos"}
                        type="file"
                        multiple
                        onChange={handleFileAdd}
                        accept="image/*"
                        className="custom-file-input"
                    />
                </div>
            )}
            <ul
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    listStyle: "none",
                    padding: 3,
                }}
            >
                {files.map((fileEl, index) => {
                    return (
                        <li
                            key={index}
                            style={{
                                marginRight: "3px",
                                marginBottom: "3px",
                                paddingLeft: "8px",
                                backgroundColor: "lightgray",
                                borderRadius: "3px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <a href={fileEl.url} download style={{ textDecoration: "underline", color: "royalblue" }}>
                                {`upload_${index + 1}`}
                            </a>
                            {editable && (
                                <Tooltip arrow placement="right" title="Verwijder" data-testid="delete-button">
                                    <IconButton onClick={() => handleRemoveFile(index)}>
                                        <ClearIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
