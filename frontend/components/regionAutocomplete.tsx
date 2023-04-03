import React, {useState, useEffect} from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, {AutocompleteChangeReason} from "@mui/material/Autocomplete";
import {getAllRegions, Region} from "@/lib/region";

interface Props {
    value: string;
    onChange: (value: string) => void;
}

const RegionAutocomplete: React.FC<Props> = ({value, onChange}) => {
    const [inputValue, setInputValue] = useState("");
    const [regions, setRegions] = useState<string[]>([]);

    useEffect(() => {
        async function fetchRegions() {
            try {
                const response = await getAllRegions();
                const availableRegions = response.data.map((region: Region) => region.region);
                setRegions(availableRegions);
            } catch (err) {
                console.error(err);
            }
        }

        fetchRegions().then();
    }, []);

    return (
        <Autocomplete
            value={value}
            inputValue={inputValue}
            onChange={(
                e: React.SyntheticEvent,
                newValue: string,
                reason: AutocompleteChangeReason
            ) => {
                onChange(newValue);
            }}
            onInputChange={(
                e: React.SyntheticEvent,
                newInputValue: string,
            ) => {
                setInputValue(newInputValue);
            }}
            options={regions}
            renderInput={(params: JSX.IntrinsicAttributes) => (
                <TextField {...params} label="Regio" variant="outlined" fullWidth/>
            )}
        />
    );
};

export default RegionAutocomplete;
