import React, {useEffect, useState, ChangeEvent} from "react";
import {useRouter} from "next/router";
import {Button, Form, Dropdown, InputGroup} from "react-bootstrap";
import {BuildingInterface, getAddress, getBuildingInfo} from "@/lib/building";
import {Region, getAllRegions, getRegion} from "@/lib/region";
import {User, getUserInfo, getAllUsers, userSearchString} from "@/lib/user";
import AdminHeader from "@/components/header/adminHeader";
import {withAuthorisation} from "@/components/withAuthorisation";
import RegionAutocomplete from "@/components/autocompleteComponents/regionAutocomplete";
import SyndicAutoCompleteComponent from "@/components/autocompleteComponents/syndicAutoCompleteComponent";
import PDFUploader from "@/components/pdfUploader";
import styles from "@/styles/AdminDataBuildingsEdit.module.css";

function AdminDataBuildingsEdit() {
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [houseNumber, setHouseNumber] = useState("");
    const [busNumber, setBusNumber] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [street, setStreet] = useState("");
    const [clientId, setClientId] = useState("");
    const [region, setRegion] = useState("");
    const [syndic, setSyndic] = useState("");
    const [manual, setManual] = useState<File | null>(null);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle form submission logic
    };

    const goBack = () => {
        router.back();
    };

    useEffect(() => {
        if (router.query.building) {
            getBuildingInfo(Number(router.query.building)).then(async res => {
                console.log(res.data);
                setStreet(res.data.street);
                setHouseNumber(res.data.house_number);
                setBusNumber(res.data.bus ? res.data.bus : "");
                setPostalCode(res.data.postal_code);
                setCity(res.data.city)
                setName(res.data.name ? res.data.name : "");
                const region = await getRegion(res.data.region);
                setRegion(region.data.region)
                const syndic = await getUserInfo(res.data.syndic);
                setSyndic(userSearchString(syndic.data))
                return true;
            });
        }
    }, [router.isReady]);

    return (
        <>
            <AdminHeader/>
            <div className={styles.container}>
                <Form className={styles.form} onSubmit={handleSubmit}>
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
                <SyndicAutoCompleteComponent value={syndic} onChange={setSyndic}></SyndicAutoCompleteComponent>
                <PDFUploader onUpload={setManual}></PDFUploader>
                <button type="submit">
                    Opslaan
                </button>
                <button onClick={goBack} className="ml-2">
                    Terug
                </button>
            </div>
        </>
    );
}

export default withAuthorisation(AdminDataBuildingsEdit, ["Admin", "Superstudent"]);
