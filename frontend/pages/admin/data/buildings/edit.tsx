import React, {useEffect, useState, ChangeEvent} from "react";
import {useRouter} from "next/router";
import {Button, Form, Dropdown, InputGroup} from "react-bootstrap";
import {BuildingInterface, getAddress, getBuildingInfo} from "@/lib/building";
import {Region, getAllRegions} from "@/lib/region";
import {User, getUserInfo, getAllUsers} from "@/lib/user";
import AdminHeader from "@/components/header/adminHeader";
import {withAuthorisation} from "@/components/withAuthorisation";
import RegionAutocomplete from "@/components/autocompleteComponents/regionAutocomplete";


export default function AdminDataBuildingsEdit() {
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [houseNumber, setHouseNumber] = useState("");
    const [busNumber, setBusNumber] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [street, setStreet] = useState("");
    const [clientId, setClientId] = useState("");
    const router = useRouter();
    const [region, setRegion] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle form submission logic
    };

    useEffect(() => {
        if (router.query.building) {
            getBuildingInfo(Number(router.query.building)).then(res => {
                console.log(res.data);
                setStreet(res.data.street);
                setHouseNumber(res.data.house_number);
                setBusNumber(res.data.bus ? res.data.bus : "");
                setPostalCode(res.data.postal_code);
                setCity(res.data.city)
                setName(res.data.name ? res.data.name : "");
                return true;
            });
        }
    }, [router.isReady]);

    return (
        <>
            <AdminHeader/>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="buildingName">
                    <Form.Label>Gebouw naam</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="postalCode">
                    <Form.Label>Postcode</Form.Label>
                    <Form.Control
                        type="text"
                        value={postalCode}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPostalCode(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="city">
                    <Form.Label>Gemeente</Form.Label>
                    <Form.Control
                        type="text"
                        value={city}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="street">
                    <Form.Label>Straat</Form.Label>
                    <Form.Control
                        type="text"
                        value={street}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setStreet(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="houseNumber">
                    <Form.Label>Huisnummer</Form.Label>
                    <Form.Control
                        type="text"
                        value={houseNumber}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setHouseNumber(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="busNumber">
                    <Form.Label>Busnummer (optioneel)</Form.Label>
                    <Form.Control
                        type="text"
                        value={busNumber}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setBusNumber(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="clientId">
                    <Form.Label>Klantennummer afvalophaaldienst (optioneel)</Form.Label>
                    <Form.Control
                        type="text"
                        value={clientId}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setClientId(e.target.value)}
                    />
                </Form.Group>

                {/* Add other form fields and components */}

            </Form>
            <RegionAutocomplete value={region} onChange={setRegion}></RegionAutocomplete>

            <Button variant="primary" type="submit">
                Opslaan
            </Button>
        </>
    );
}
