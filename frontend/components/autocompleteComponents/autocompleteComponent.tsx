import React, {useState, useEffect} from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, {AutocompleteRenderInputParams} from "@mui/material/Autocomplete";
import {AxiosResponse} from "axios/index";
import {Button, Form, Dropdown, InputGroup} from "react-bootstrap";

//A lot of typings here are any to make the AutocompleteComponentGeneric

interface Props {
    initialValue: string;
    label: string;
    fetchOptions: () => Promise<AxiosResponse<any>>;
    mapping: (value: any) => any;
    setObjectId: (value: any) => void;
}

export interface GenericProps {
    initialValue: any;
    setObjectId: (value: any) => void;
    required: boolean;
}


const AutocompleteComponent: React.FC<Props> = ({
                                                    initialValue,
                                                    label,
                                                    fetchOptions,
                                                    mapping,
                                                    setObjectId,
                                                }) => {
    const [value, setValue] = React.useState<any>();
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await fetchOptions();
                let availableOptions: any[] = [];
                for (let data of res.data) {
                    availableOptions.push({label: mapping(data), id: data.id})
                }
                setOptions(availableOptions);

                //Set the initial value to the object with the same id
                const initialOption = availableOptions.find(option => option.id === initialValue);
                if (initialOption) {
                    setValue(initialOption);
                    setInputValue(initialOption.label)
                }
            } catch (err) {
                console.error(err);
            }
        }

        fetch().then();
    }, [fetchOptions, initialValue]);

    return (
        <>
            <Form.Label> {label} </Form.Label>
            <Autocomplete
                //our option and value are different but without this line it will give warnings as the default
                //implementations checks whether options === value
                isOptionEqualToValue={(option: { toString: () => any }, value: { toString: () => any }) => true}
                value={value ?? ""}
                inputValue={inputValue}
                onChange={(e: React.SyntheticEvent, newValue: any) => {
                    if (newValue) {
                        setValue(newValue);
                        setObjectId(newValue.id);
                    }

                }}
                onInputChange={(e: React.SyntheticEvent, newInputValue: string) => {
                    setInputValue(newInputValue);
                }}
                options={options}
                getOptionLabel={(option: any) => option.label || ""}
                renderInput={(params: AutocompleteRenderInputParams) => (
                    <TextField {...params} variant="outlined" fullWidth/>
                )}
            />
        </>
    );
};

export default AutocompleteComponent;
