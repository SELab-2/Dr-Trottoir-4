import React, {useEffect, useState, ChangeEvent, FormEvent, MouseEventHandler} from "react";
import {useRouter} from "next/router";
import {Button, Form, Dropdown, InputGroup} from "react-bootstrap";
import {BuildingPostInterface, getBuildingInfo, patchBuilding, postBuilding} from "@/lib/building";
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
    const [clientNumber, setClientNumber] = useState("");
    const [region, setRegion] = useState(""); //used for displaying the correct data
    const [regionId, setRegionId] = useState(""); //used for collecting the right id to post/patch
    const [syndic, setSyndic] = useState(""); //used for displaying the correct data
    const [syndicId, setSyndicId] = useState(""); //used for collecting the right id to post/patch
    const [manual, setManual] = useState<File | null>(null);
    const [duration, setDuration] = useState("00:00");
    const [public_id, setPublicId] = useState("");

    const router = useRouter();

    const handleSubmit = () => {
        const building = {
                syndic: syndicId,
                name: name,
                city: city,
                postal_code: postalCode,
                street: street,
                house_number: houseNumber,
                bus: busNumber,
                client_number: clientNumber,
                duration: duration,
                region: regionId,
                public_id: public_id,
            };
        if (router.query.building) {
            patchBuilding(building, Number(router.query.building)).then();
        } else {
            postBuilding(building).then();
        }
    };

    const goBack = () => {
        router.back();
    };

    useEffect(() => {
        if (router.query.building) {
            getBuildingInfo(Number(router.query.building)).then(async res => {
                setStreet(res.data.street);
                setHouseNumber(res.data.house_number);
                setBusNumber(res.data.bus ? res.data.bus : "");
                setPostalCode(res.data.postal_code);
                setCity(res.data.city);
                setName(res.data.name ? res.data.name : "");
                setDuration(res.data.duration);
                setPublicId(res.data.public_id ?? "");
                const region = await getRegion(res.data.region);
                setRegion(region.data.region);
                setRegionId(region.data.id);
                const syndic = await getUserInfo(res.data.syndic);
                setSyndic(userSearchString(syndic.data));
                setSyndicId(syndic.data.id);
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
                            value={clientNumber}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setClientNumber(e.target.value)}
                        />
                    </Form.Group>


                    <Form.Group controlId="duration">
                        <Form.Label>Duration (HH:MM)</Form.Label>
                        <InputGroup>
                            <Form.Select
                                value={duration.split(':')[0]}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                    setDuration(`${e.target.value}:${duration.split(':')[1]}`);
                                }}
                            >
                                {Array.from({length: 24}, (_, i) => (
                                    <option key={i} value={i.toString().padStart(2, '0')}>
                                        {i.toString().padStart(2, '0')}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                value={duration.split(':')[1]}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                    setDuration(`${duration.split(':')[0]}:${e.target.value}`);
                                }}
                            >
                                {Array.from({length: 60}, (_, i) => (
                                    <option key={i} value={i.toString().padStart(2, '0')}>
                                        {i.toString().padStart(2, '0')}
                                    </option>
                                ))}
                            </Form.Select>
                        </InputGroup>
                    </Form.Group>

                </Form>
                <RegionAutocomplete value={region} onChange={setRegion} setObjectId={setRegionId}></RegionAutocomplete>
                <SyndicAutoCompleteComponent value={syndic} onChange={setSyndic}
                                             setObjectId={setSyndicId}></SyndicAutoCompleteComponent>
                <PDFUploader onUpload={setManual}></PDFUploader>
                <button onClick={handleSubmit} type="submit">
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
