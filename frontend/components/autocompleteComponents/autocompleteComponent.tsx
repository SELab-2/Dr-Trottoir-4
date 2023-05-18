import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import { AxiosResponse } from "axios/index";
import { Form } from "react-bootstrap";

/**
 * The AutocompleteComponent aims to be as generic as possible to suit many use-cases. Therefore, a lot of the typings
 * have been set to 'any'.
 *
 * To make your own AutocompleteComponent, all you have to do is provide the AutocompleteComponent 5 fields, those being:
 * @param initialId: The ID of the initial value that has to be displayed
 * @param label: The label of the AutocompleteComponent
 * @param fetchOptions: A function that fetches all possible options in the dropdown of the AutocompleteComponent
 * @param mapping: A function that takes an object (of the same type as the items of the return value of fetchOptions())
 * and returns the string representation that should get displayed in the AutocompleteComponent
 * @param setObjectId: A state setter that will set the ID of the currently selected option in order for the parent
 * component to be able to access it.
 */

interface Props {
    initialId: number;
    label: string;
    fetchOptions: () => Promise<AxiosResponse<any>>;
    mapping: (value: any) => any;
    setObjectId: (value: any) => void;
    disabled?: boolean;
}

export interface GenericProps {
    initialId: any;
    setObjectId: (value: any) => void;
    required: boolean;
}

export interface TourUserProps {
    initialId: any;
    setObjectId: (value: any) => void;
    tourId?: number | null;
}

export interface StudentOnTourProps {
    initialId: any;
    setObjectId: (value: any) => void;
    required: boolean;
    studentId: number;
    disabled?: boolean;
}

const AutocompleteComponent: React.FC<Props> = ({ initialId, label, fetchOptions, mapping, setObjectId, disabled = false }) => {
    const [value, setValue] = React.useState<any>();
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await fetchOptions();
                let availableOptions: any[] = [];
                for (let data of res.data) {
                    availableOptions.push({ label: mapping(data), id: data.id });
                }
                setOptions(availableOptions);

                //Set the initial value to the object with the same id
                const initialOption = availableOptions.find((option) => Number(option.id) === Number(initialId));
                if (initialOption) {
                    setValue(initialOption);
                    setInputValue(initialOption.label);
                }
            } catch (err) {
                console.error(err);
            }
        }

        fetch().then();
    }, [fetchOptions, initialId]);

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
                disabled={disabled}
                renderInput={(params: AutocompleteRenderInputParams) => (
                    <TextField {...params} variant="outlined" fullWidth />
                )}
            />
        </>
    );
};

export default AutocompleteComponent;
