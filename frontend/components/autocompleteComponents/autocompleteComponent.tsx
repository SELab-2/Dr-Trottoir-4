import React, {useState, useEffect} from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, {AutocompleteRenderInputParams} from "@mui/material/Autocomplete";
import {AxiosResponse} from "axios/index";
import {Button, Form, Dropdown, InputGroup} from "react-bootstrap";
import {styled} from "@mui/system";


interface Props {
    value: string;
    label: string;
    fetchOptions: () => Promise<AxiosResponse<any>>;
    onChange: (value: string) => void;
    mapping: (value: any) => any; //this is any because it has to be generic
}

export interface GenericProps {
    value: string;
    onChange: (value: string) => void;
}

const AutocompleteComponent: React.FC<Props> = ({value, label, fetchOptions, onChange, mapping}) => {
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await fetchOptions();
                const availableOptions = res.data.map(mapping);
                setOptions(availableOptions);
            } catch (err) {
                console.error(err);
            }
        }

        fetch().then();
    }, [fetchOptions]);

    return (
        <>
            <Form.Label> {label} </Form.Label><Autocomplete
            value={value}
            inputValue={inputValue}
            onChange={(
                e: React.SyntheticEvent,
                newValue: string | null
            ) => {
                onChange(newValue ?? "");
            }}
            onInputChange={(
                e: React.SyntheticEvent,
                newInputValue: string
            ) => {
                setInputValue(newInputValue);
            }}
            options={options}
            renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField {...params} variant="outlined" fullWidth/>
            )}/>
        </>
    );
};

export default AutocompleteComponent;
