import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import React from "react";

export function FileList(
    {
        files,
        handleRemoveFile
    }: {
        files : File[];
        handleRemoveFile : (index: number) => void;
    }
) {

    function downloadFile(file: File, index: number) {
        const fileUrl = URL.createObjectURL(file);
        const fileName = file.name;
        return (
            <a href={fileUrl} download={fileName} style={{ textDecoration: "underline" }}>{`upload_${index + 1}`}</a>
        );
    }

    return (
        <ol>
            {files.map((file, index) => (
                <li key={index}>
                    {
                        downloadFile(file, index)
                    }
                    <Tooltip arrow placement="right" title="Verwijder">
                        <IconButton onClick={() => handleRemoveFile(index)}>
                            <Delete/>
                        </IconButton>
                    </Tooltip>
                </li>
            ))}
        </ol>
    );

}