import React, { useState } from 'react';
import { Dropdown, DropdownButton, FormControl } from 'react-bootstrap';

interface ComboboxProps {
    options: string[];
    selectedOption: string;
    onSelect: (option: string) => void;
}

const Combobox = ({options, selectedOption, onSelect}: ComboboxProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = searchTerm.trim()
        ? options.filter(option =>
            option.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;

    const handleSelect = (eventKey: string | null)   => {
        onSelect(eventKey ? eventKey : "");
        setSearchTerm('');
    }

    
    return (
        <DropdownButton
          variant="secondary"
          title={selectedOption.length > 18 
            ? (selectedOption.slice(0,15) + '...')
            : (selectedOption || 'Kies')}
          onSelect={handleSelect}
        >
          <>
            <FormControl
              autoFocus
              placeholder="Zoeken..."
              onChange={e => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <Dropdown.Divider />
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <Dropdown.Item key={option} eventKey={option}>
                  {option}
                </Dropdown.Item>
              ))
            ) : (
              <Dropdown.Item disabled>Geen overeenkomende opties gevonden.</Dropdown.Item>
            )}
          </>
        </DropdownButton>
      );
}

export default Combobox;
