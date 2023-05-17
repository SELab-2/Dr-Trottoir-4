import React, {useEffect, useState} from "react";
import {getCurrentUser, getUserRole, patchUser, User} from "@/lib/user";
import {useTranslation} from "react-i18next";
import {getAllRegions, RegionInterface} from "@/lib/region";
import AdminHeader from "@/components/header/adminHeader";
import StudentHeader from "@/components/header/studentHeader";
import SyndicHeader from "@/components/header/syndicHeader";
import {handleError} from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {Button, Card, Col, Container, Form, FormCheck, FormControl, InputGroup, Row} from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import PasswordInput from "@/components/password/passwordInput";
import {changePassword} from "@/lib/authentication";
import {Divider} from "@mui/material";
import { withAuthorisation } from "@/components/withAuthorisation";

function UserProfile() {
    const { t } = useTranslation();
    const [user, setUser] = useState<User | null>(null);
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [selectedRegions, setSelectedRegions] = useState<number[]>([]);
    const [allRegions, setAllRegions] = useState<RegionInterface[]>([]);
    const [role, setRole] = useState<string>("");
    const [newPassword1, setNewPassword1] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
    const [newPassword2, setNewPassword2] = useState<string>("");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [succesPatch, setSuccessPatch] = useState<boolean>(false);
    const [succesPass, setSuccessPass] = useState<boolean>(false);

    const handlePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleCurrentPasswordVisibility = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };


    useEffect(() => {
        getCurrentUser().then(
            (res) => {
                const u: User = res.data;
                if (getUserRole(u.role.toString()) != "Syndic") {
                    getAllRegions().then((res) => {
                        const regions: RegionInterface[] = res.data;
                        setAllRegions(regions);
                    });
                }
                setUserInfo(u);
            },
            (err) => {
                console.error(err);
            }
        );
    }, []);

    function setUserInfo(u: User) {
        setRole(getUserRole(u.role.toString()));
        setUser(u);
        setFirstName(u.first_name);
        setLastName(u.last_name);
        setEmail(u.email);
        setPhoneNumber(u.phone_number);
        setSelectedRegions(u.region);
    }

    function submit() {
        if (!user) {
            return;
        }
        const patchBody: { [name: string]: string | number | number[] } = {};
        if (firstName !== user?.first_name) {
            patchBody["first_name"] = firstName;
        }
        if (lastName !== user?.last_name) {
            patchBody["last_name"] = lastName;
        }
        if (email !== user?.email) {
            patchBody["email"] = email;
        }
        if (phoneNumber !== user?.phone_number) {
            patchBody["phone_number"] = phoneNumber;
        }
        if (selectedRegions !== user?.region) {
            patchBody["region"] = selectedRegions; // convert list to string
        }
        patchUser(user.id, patchBody).then(
            (res) => {
                const u: User = res.data;
                setUserInfo(u);
                setSuccessPatch(true);
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages(e);
            }
        );
    }

    function submitPasswordChange() {
        if (newPassword1 !== newPassword2) {
            setErrorMessages(["De ingevoerde wachtwoorden komen niet overeen."]);
            return;
        } else if (currentPassword == newPassword1 || currentPassword == newPassword2) {
            setErrorMessages(["Uw huidig wachtwoord en nieuw wachtwoord mogen niet overeenkomen"]);
        } else if (!newPassword1 || !currentPassword || !newPassword2) {
            setErrorMessages(["Gelieve alle velden in te vullen"]);
        } else {
            changePassword({
                old_password: currentPassword,
                new_password1: newPassword1,
                new_password2: newPassword2,
            }).then((_) => {
                    setSuccessPass(true);
                },
                (err) => {
                    const e = handleError(err)
                    setErrorMessages(e);
                });
        }
    }

    return (
        <>
            {["Admin", "Superstudent"].includes(role) && <AdminHeader/>}
            {"Student" === role && <StudentHeader/>}
            {"Syndic" === role && <SyndicHeader/>}
            <Container className="center_container">
                <Card className="padding" style={{maxWidth: '700px', width: '100%'}}>
                    <Row>
                        <Col md={6} className="column_padding">
                            <label className="title">Profiel</label> <br/>
                            <label className="normal_text">
                                   Rol : <strong> {`${user ? t(getUserRole(user.role.toString())) : ""}`}</strong>
                                </label>
                            <Divider style={{backgroundColor: 'black'}}/>
                            {succesPass && (
                                <div className={"visible alert alert-success alert-dismissible fade show"}>
                                    <strong>Succes!</strong> Uw wachtwoord werd met succes gewijzigd!
                                    <button type="button" className="btn-close"
                                            onClick={() => setSuccessPass(false)}/>
                                </div>
                            )}
                            {succesPatch && (
                                <div className={"visible alert alert-success alert-dismissible fade show"}>
                                    <strong>Succes!</strong> Uw profiel werd met succes gewijzigd!
                                    <button type="button" className="btn-close"
                                            onClick={() => setSuccessPatch(false)}/>
                                </div>
                            )}
                            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
                            <PasswordInput
                                value={currentPassword}
                                setPassword={setCurrentPassword}
                                handlePasswordVisibility={handleCurrentPasswordVisibility}
                                showPassword={showCurrentPassword}
                                label="Huidig wachtwoord:"
                                placeholder="Voer uw huidige wachtwoord in"
                                showIconButton={true}
                            />
                            <PasswordInput
                                value={newPassword1}
                                setPassword={setNewPassword1}
                                handlePasswordVisibility={handlePasswordVisibility}
                                showPassword={showPassword}
                                label="Nieuw wachtwoord:"
                                placeholder="Voer uw nieuwe wachtwoord in"
                                showIconButton={true}
                            />
                            <PasswordInput
                                value={newPassword2}
                                setPassword={setNewPassword2}
                                handlePasswordVisibility={() => null}
                                showPassword={false}
                                label="Bevestig nieuw wachtwoord:"
                                placeholder="Voer uw nieuwe wachtwoord opnieuw in"
                                showIconButton={false}
                            />
                            <div style={{paddingLeft: '10px'}}>
                                <Button
                                    className="wide_button"
                                    size="lg"
                                    onClick={() => {
                                        submitPasswordChange()
                                    }}>
                                    Wijzig wachtwoord
                                </Button>
                            </div>
                        </Col>
                        <Col md={6}>
                            <Form>
                                <div>
                                    <label className="normal_text"> </label>
                                    {allRegions.length > 0 && (
                                        <div>
                                            <label className="normal_text">Regio's waarin u wilt werken:</label>
                                            {allRegions?.map((r: RegionInterface) => {
                                                return (
                                                    <div key={r.id}>
                                                        <Row className="align-items-center">
                                                            <Col xs="auto">
                                                                <FormCheck
                                                                    value={r.id}
                                                                    id={r.id.toString()}
                                                                    style={{paddingLeft: '15px'}}
                                                                    checked={selectedRegions.some((n: number) => n === r.id)}
                                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                        const regionId = Number(e.target.value);
                                                                        const regions = [...selectedRegions];
                                                                        if (
                                                                            e.target.checked &&
                                                                            !selectedRegions.find((el: number) => el === regionId)
                                                                        ) {
                                                                            regions.push(regionId);
                                                                            setSelectedRegions(regions);
                                                                        } else if (
                                                                            !e.target.checked &&
                                                                            selectedRegions.find((el: number) => el === regionId)
                                                                        ) {
                                                                            const i = regions.indexOf(regionId);
                                                                            if (i > -1) {
                                                                                regions.splice(i, 1);
                                                                            }
                                                                            setSelectedRegions(regions);
                                                                        }
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col>
                                                                <label className="normal_text"
                                                                       htmlFor={r.id.toString()}>
                                                                    {r.region}
                                                                </label>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <Form.Label className="normal_text">Voornaam:</Form.Label>
                                    <InputGroup className="input">
                                        <FormControl
                                            className="form_control"
                                            type="text"
                                            value={firstName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setFirstName(e.target.value);
                                                e.target.setCustomValidity("");
                                            }}
                                            onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                e.target.setCustomValidity("Voornaam is verplicht.");
                                            }}
                                            required
                                        />
                                    </InputGroup>
                                </div>

                                <div>
                                    <Form.Label className="normal_text">Achternaam:</Form.Label>
                                    <InputGroup className="input">
                                        <FormControl
                                            className="form_control"
                                            type="text"
                                            value={lastName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setLastName(e.target.value);
                                                e.target.setCustomValidity("");
                                            }}
                                            onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                e.target.setCustomValidity("Achternaam is verplicht.");
                                            }}
                                            required
                                        />
                                    </InputGroup>
                                </div>

                                <div>
                                    <Form.Label className="normal_text">E-mailadres:</Form.Label>
                                    <InputGroup className="input">
                                        <FormControl
                                            className="form_control"
                                            type="email"
                                            value={email}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setEmail(e.target.value);
                                            }}
                                            required
                                        />
                                    </InputGroup>
                                </div>

                                <div>
                                    <InputGroup className="input">
                                        <PhoneInput
                                            country={"be"}
                                            value={phoneNumber}
                                            preferredCountries={["be", "nl"]}
                                            onChange={(phone) => setPhoneNumber("+" + phone)}
                                            inputClass="form_control"
                                            inputStyle={{
                                                height: '40px',
                                                background: '#f8f9fa',
                                                fontSize: '15px',
                                                width: '100%',
                                                maxWidth: '300px'
                                            }}
                                        />
                                    </InputGroup>
                                </div>
                                <div style={{paddingLeft: '15px'}}>
                                    <Button
                                        className="wide_button"
                                        size="lg"
                                        onClick={submit}>
                                        Pas aan
                                    </Button>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Card>
            </Container>
        </>
    );
}

export default withAuthorisation(UserProfile, ["Admin", "Superstudent", "Syndic", "Student", "Default"]);
