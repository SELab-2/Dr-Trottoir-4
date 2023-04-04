import React, {useState, useEffect} from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, {AutocompleteRenderInputParams} from "@mui/material/Autocomplete";
import {AxiosResponse} from "axios/index";
import {Button, Form, Dropdown, InputGroup} from "react-bootstrap";


//A lot of typings here are any to make the AutocompleteComponentGeneric

interface Props {
    value: string;
    label: string;
    fetchOptions: () => Promise<AxiosResponse<any>>;
    onChange: (value: string) => void;
    mapping: (value: any) => any;
    searchField: string;
    // a function that takes the displayed input value and extract the search term from it
    searchTermHandler: (value: string) => string | null;
    setObjectId: (value: any) => void;
}

export interface GenericProps {
    value: any;
    onChange: (value: any) => void;
    setObjectId: (value: any) => void;
}

function getIdBySearchTerm(arr: any[], field: string, searchTerm: string | null) {
    if (searchTerm) {
        const foundObj = arr.find((obj) => obj[field].toLowerCase() === searchTerm.toLowerCase());
        return foundObj ? foundObj.id : null;
    }
    return null;
}

const AutocompleteComponent: React.FC<Props> = ({
                                                    value,
                                                    label,
                                                    fetchOptions,
                                                    onChange,
                                                    mapping,
                                                    searchField,
                                                    searchTermHandler,
                                                    setObjectId
                                                }) => {
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await fetchOptions();
                const availableOptions = res.data;
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
            // getOptionSelected={(option: { toString: () => any; }, value: { toString: () => any; }) => option.toString() === value.toString()}
            value={value}
            inputValue={inputValue}
            onChange={(
                e: React.SyntheticEvent,
                newValue: string | null
            ) => {
                if (newValue) {
                    setObjectId(getIdBySearchTerm(options, searchField, searchTermHandler(newValue)));
                    onChange(newValue ?? "");
                }
            }}
            onInputChange={(
                e: React.SyntheticEvent,
                newInputValue: string
            ) => {
                setInputValue(newInputValue);
            }}
            options={options.map(mapping)}
            renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField {...params} variant="outlined" fullWidth/>
            )}/>
        </>
    );
};

export default AutocompleteComponent;
