import React, {useEffect, useState, ChangeEvent, FormEvent, MouseEventHandler} from "react";
import {useRouter} from "next/router";
import {Button, Form, Dropdown, InputGroup} from "react-bootstrap";
import {
    BuildingPostInterface,
    getBuildingInfo,
    getDurationFromMinutes,
    patchBuilding,
    postBuilding
} from "@/lib/building";
import {Region, getAllRegions, getRegion} from "@/lib/region";
import {User, getUserInfo, getAllUsers, userSearchString} from "@/lib/user";
import AdminHeader from "@/components/header/adminHeader";
import {withAuthorisation} from "@/components/withAuthorisation";
import RegionAutocomplete from "@/components/autocompleteComponents/regionAutocomplete";
import SyndicAutoCompleteComponent from "@/components/autocompleteComponents/syndicAutoCompleteComponent";
import PDFUploader from "@/components/pdfUploader";
import styles from "@/styles/AdminDataBuildingsEdit.module.css";
import DurationInput from "@/components/DurationInput";

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
    const [validated, setValidated] = useState(false);
    const [formErrors, setFormErrors] = useState(false);
    const [durationInMinutes, setDurationInMinutes] = useState(0);

    const router = useRouter();

    const handleSubmit = () => {
        const form = document.getElementById("buildingForm") as HTMLFormElement;
        console.log(form.checkValidity());
        if (!form.checkValidity()) {
            setFormErrors(true);
        } else {
            setFormErrors(false);
        }
        // if (form.checkValidity()) {
        //     const building = {
        //         syndic: syndicId,
        //         name: name,
        //         city: city,
        //         postal_code: postalCode,
        //         street: street,
        //         house_number: houseNumber,
        //         bus: busNumber,
        //         client_number: clientNumber,
        //         duration: getDurationFromMinutes(durationInMinutes),
        //         region: regionId,
        //         public_id: public_id,
        //     };
        //     console.log("postpatch");
        //     if (router.query.building) {
        //         patchBuilding(building, Number(router.query.building)).then(res => console.log(res));
        //     } else {
        //         postBuilding(building).then();
        //     }
        // }
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
                {formErrors && (
                    <div className="alert alert-danger" role="alert">
                        Gelieve alle verplichte velden (*) in te vullen.
                    </div>
                )}
                <Form id="buildingForm" className={styles.form} noValidate validated={validated}>
                    <Form.Group controlId="buildingName">
                        <Form.Label>Gebouw naam</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="postalCode">
                        <Form.Label>Postcode*</Form.Label>
                        <Form.Control
                            type="text"
                            value={postalCode}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPostalCode(e.target.value)}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a postal code.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="city">
                        <Form.Label>Gemeente*</Form.Label>
                        <Form.Control
                            type="text"
                            value={city}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="street">
                        <Form.Label>Straat*</Form.Label>
                        <Form.Control
                            type="text"
                            value={street}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setStreet(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="houseNumber">
                        <Form.Label>Huisnummer*</Form.Label>
                        <Form.Control
                            type="text"
                            value={houseNumber}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setHouseNumber(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="busNumber">
                        <Form.Label>Busnummer</Form.Label>
                        <Form.Control
                            type="text"
                            value={busNumber}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setBusNumber(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="clientId">
                        <Form.Label>Klantennummer afvalophaaldienst</Form.Label>
                        <Form.Control
                            type="text"
                            value={clientNumber}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setClientNumber(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="duration">
                        <Form.Label>Duur van een ronde (in minuten)*</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            value={durationInMinutes}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setDurationInMinutes(
                                    e.target.value === "" ? 0 : parseInt(e.target.value)
                                )
                            }
                        />
                    </Form.Group>
                    <RegionAutocomplete value={region}
                                        onChange={setRegion}
                                        setObjectId={setRegionId}
                                        required={true}></RegionAutocomplete>
                    <SyndicAutoCompleteComponent value={syndic}
                                                 onChange={setSyndic}
                                                 setObjectId={setSyndicId}
                                                 required={true}></SyndicAutoCompleteComponent>
                    {!router.query.building && <PDFUploader onUpload={setManual}></PDFUploader>}
                </Form>
                <button onClick={handleSubmit} type="button">
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
