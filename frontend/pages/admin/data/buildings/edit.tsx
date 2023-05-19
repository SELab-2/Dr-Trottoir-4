import React, { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Form } from "react-bootstrap";
import {
    deleteBuildingComment,
    getBuildingComment,
    getBuildingInfo,
    getDurationFromMinutes,
    patchBuilding,
    patchBuildingComment,
    postBuilding,
    postBuildingComment,
} from "@/lib/building";
import { getRegion } from "@/lib/region";
import { getUserInfo } from "@/lib/user";
import AdminHeader from "@/components/header/adminHeader";
import { withAuthorisation } from "@/components/withAuthorisation";
import RegionAutocomplete from "@/components/autocompleteComponents/regionAutocomplete";
import PDFUploader from "@/components/pdfUploader";
import styles from "@/styles/AdminDataBuildingsEdit.module.css";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import ConfirmationMessage from "@/components/confirmMessage";
import SyndicAutocomplete from "@/components/autocompleteComponents/syndicAutocomplete";
import { handleError } from "@/lib/error";
import { postManual } from "@/lib/building-manual";

function AdminDataBuildingsEdit() {
    const requiredFieldsNotFilledMessage = "Gelieve alle verplichte velden (*) in te vullen.";
    const [name, setName] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [houseNumber, setHouseNumber] = useState<string>("");
    const [busNumber, setBusNumber] = useState<string>("");
    const [postalCode, setPostalCode] = useState<string>("");
    const [street, setStreet] = useState<string>("");
    const [clientNumber, setClientNumber] = useState<string>("");
    const [regionId, setRegionId] = useState<number>(-1); //used for collecting the right id to post/patch
    const [syndicId, setSyndicId] = useState<number>(-1); //used for collecting the right id to post/patch
    const [manual, setManual] = useState<File | null>(null);
    const [duration, setDuration] = useState<string>("00:00");
    const [publicId, setPublicId] = useState<string>("");
    const [validated, setValidated] = useState<boolean>(false);
    const [durationInMinutes, setDurationInMinutes] = useState<number>(0);
    const [buildingComments, setBuildingComments] = useState<string>("");
    const [buildingCommentsId, setBuildingCommentsId] = useState<number>(-1);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

    const router = useRouter();

    const handleSubmit = async () => {
        const form = document.getElementById("buildingForm") as HTMLFormElement;
        if (form.checkValidity()) {
            const building = {
                syndic: syndicId,
                name: name,
                city: city,
                postal_code: postalCode,
                street: street,
                house_number: houseNumber,
                bus: busNumber,
                client_number: clientNumber,
                duration: getDurationFromMinutes(durationInMinutes),
                region: regionId,
                public_id: publicId,
            };
            try {
                let buildingId = Number(router.query.building);
                if (router.query.building) {
                    await patchBuilding(building, Number(router.query.building));
                    if (buildingCommentsId >= 0) {
                        if (buildingComments) {
                            await patchBuildingComment(
                                {
                                    building: Number(router.query.building),
                                    comment: buildingComments,
                                },
                                buildingCommentsId
                            );
                        } else {
                            await deleteBuildingComment(buildingCommentsId);
                            setBuildingCommentsId(-1);
                        }
                    } else {
                        if (buildingComments) {
                            await postBuildingComment({
                                building: Number(router.query.building),
                                comment: buildingComments,
                            });
                        }
                    }
                } else {
                    const res = await postBuilding(building);
                    buildingId = res.data.id;
                    if (buildingComments) {
                        await postBuildingComment({
                            building: buildingId,
                            comment: buildingComments,
                        });
                    }
                }
                if (manual) {
                    await postManual({ building: buildingId, file: manual });
                }
                setShowConfirmation(true);
            } catch (error: any) {
                setShowConfirmation(false);
                setErrorMessages(handleError(error));
            }
        } else {
            setErrorMessages([requiredFieldsNotFilledMessage]);
        }
    };

    const goBack = () => {
        setShowConfirmation(false);
        router.back();
    };

    useEffect(() => {
        if (router.query.building) {
            getBuildingInfo(Number(router.query.building)).then(async (res) => {
                setStreet(res.data.street);
                setHouseNumber(res.data.house_number);
                setBusNumber(res.data.bus ? res.data.bus : "");
                setPostalCode(res.data.postal_code);
                setCity(res.data.city);
                setName(res.data.name ? res.data.name : "");
                setDuration(res.data.duration);
                setPublicId(res.data.public_id ?? "");
                const region = await getRegion(res.data.region);
                setRegionId(region.data.id);
                const syndic = await getUserInfo(res.data.syndic);
                setSyndicId(syndic.data.id);
                const comments = await getBuildingComment(Number(router.query.building));
                if (comments.data) {
                    setBuildingComments(comments.data.comment);
                    setBuildingCommentsId(comments.data.id);
                }
                setPublicId(res.data.public_id);
                return true;
            });
        }
    }, [router.isReady]);

    useEffect(() => {
        if (errorMessages.length > 0) {
            setShowConfirmation(false);
        } else if (showConfirmation) {
            setErrorMessages([]);
        }
    });

    return (
        <>
            <AdminHeader />
            <div className={styles.container}>
                <ConfirmationMessage
                    showConfirm={showConfirmation}
                    confirmMessage={"De informatie voor dit gebouw is opgeslagen!"}
                    onClose={setShowConfirmation}
                />
                <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
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
                        <Form.Control.Feedback type="invalid">Please provide a postal code.</Form.Control.Feedback>
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

                    <Form.Group controlId="publicId">
                        <Form.Label>Publieke identificatie (voor bewoners)</Form.Label>
                        <Form.Control
                            type="text"
                            value={publicId}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPublicId(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="duration">
                        <Form.Label>Duur van een ronde (in minuten)*</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            value={durationInMinutes}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setDurationInMinutes(e.target.value === "" ? 0 : parseInt(e.target.value))
                            }
                        />
                    </Form.Group>
                    <Form.Group controlId="opmerkingen">
                        <Form.Label>Opmerkingen</Form.Label>
                        <Form.Control
                            as="textarea"
                            value={buildingComments}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setBuildingComments(e.target.value)}
                        />
                    </Form.Group>
                    <RegionAutocomplete
                        initialId={regionId}
                        setObjectId={setRegionId}
                        required={true}
                    />
                    <SyndicAutocomplete
                        initialId={syndicId}
                        setObjectId={setSyndicId}
                        required={true}
                    />
                    <PDFUploader onUpload={setManual}/>
                </Form>
                <Button variant="secondary" className="btn-light" onClick={goBack}>
                    Terug
                </Button>
                <Button variant="primary" className="btn-dark" onClick={handleSubmit}>
                    Opslaan
                </Button>
            </div>
        </>
    );
}

export default withAuthorisation(AdminDataBuildingsEdit, ["Admin", "Superstudent"]);
