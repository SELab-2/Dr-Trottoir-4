import { IconButton, Tooltip } from "@mui/material";
import { Delete } from "@mui/icons-material";
import React from "react";
import { FileListElement } from "@/types";
import { deletePictureOfRemark } from "@/lib/picture-of-remark";

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
    // Handle when a file is selected
    function handleFileAdd(event: React.ChangeEvent<HTMLInputElement>) {
        const newFiles: FileList | null = event.target.files;
        if (!newFiles || newFiles.length <= 0) {
            return;
        }
        const f: File = newFiles[0];
        setFiles([
            ...files,
            {
                url: URL.createObjectURL(f),
                file: f,
                pictureId: null,
            },
        ]);
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
                .catch((_) => {});
        } else {
            const newFiles = [...files];
            newFiles.splice(index, 1);
            setFiles(newFiles);
        }
    }

    return (
        <>
            {editable && (
                <div>
                    <label data-testid="upload-label" htmlFor={"photos"} className="form-label">{`Upload foto's ${
                        optional ? "(Optioneel)" : ""
                    }:`}</label>
                    <input
                        id={"photos"}
                        className="form-control"
                        type="file"
                        onChange={(e) => {
                            handleFileAdd(e);
                            e.target.value = ""; // reset the value of the input field
                        }}
                        accept="image/*"
                    />
                </div>
            )}
            <ul>
                {files.map((fileEl, index) => {
                    return (
                        <li key={index}>
                            <a href={fileEl.url} download style={{ textDecoration: "underline", color: "royalblue" }}>
                                {`upload_${index + 1}`}
                            </a>
                            {editable && (
                                <Tooltip arrow placement="right" title="Verwijder" data-testid="delete-button">
                                    <IconButton onClick={() => handleRemoveFile(index)}>
                                        <Delete />
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
