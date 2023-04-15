import { IconButton, Tooltip } from "@mui/material";
import { Delete } from "@mui/icons-material";
import React from "react";

export function FileList({ files, handleRemoveFile }: { files: File[]; handleRemoveFile: (index: number) => void }) {
    return (
        <ol>
            {files.map((file, index) => {
                const fileUrl = URL.createObjectURL(file); // Get the url to download the image
                return (
                    <li key={index}>
                        <a href={fileUrl} download style={{ textDecoration: "underline" }}>
                            {file.name}
                        </a>
                        <Tooltip arrow placement="right" title="Verwijder">
                            <IconButton onClick={() => handleRemoveFile(index)}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </li>
                );
            })}
        </ol>
    );
}
