import {withAuthorisation} from "@/components/withAuthorisation";
import router from "next/router";
import {BuildingInterface, getBuildingsFromOwner} from "@/lib/building";
import React, {useEffect, useState} from "react";
import {AxiosResponse} from "axios";
import SyndicFooter from "@/components/footer/syndicFooter";
import Loading from "@/components/loading";
import SyndicHeader from "@/components/header/syndicHeader";
import {Card, Col, Container, Form, Row} from "react-bootstrap";

function SyndicDashboard() {
    const [id, setId] = useState("");
    const [buildings, setBuildings] = useState([]);
    const [postalcodes, setPostalcodes] = useState([]);

    const [loading, setLoading] = useState<boolean>(true)
    const [streetNameFilter, setStreetNameFilter] = useState('');
    const [postalcodeFilter, setPostalcodeFilter] = useState('');


    useEffect(() => {
        setId(sessionStorage.getItem("id") || "");
    }, []);

    useEffect(() => {
        if (!id) {
            return;
        }

        async function fetchBuildings() {
            getBuildingsFromOwner(id)
                .then((res: AxiosResponse<any>) => {
                    setBuildings(res.data);
                    // Extract distinct region numbers
                    setPostalcodes(Array.from(new Set(res.data.map((building: BuildingInterface) => building.postal_code))));
                    setLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setLoading(false);
                });
        }

        fetchBuildings();
    }, [id]);

    // Filter buildings based on postal code, street name, and region
    const filteredBuildings = buildings.filter((building: BuildingInterface) =>
        building.street.toLowerCase().includes(streetNameFilter.toLowerCase()) &&
        (postalcodeFilter === '' || (building.postal_code && building.postal_code === postalcodeFilter))
    );

    return (
        <div className="tablepageContainer">
            <SyndicHeader/>
            {loading ? (
                <Loading/>
            ) : (
                <div className="tableContainer">
                    <Container>
                        <label className="title">Uw gebouwen</label>
                        <Card>
                            <Card.Body>
                                <Card.Title>Filters</Card.Title>
                                <Row>
                                    <Col md={10}>
                                        <Form.Group>
                                            <Form.Label>Straatnaam:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={streetNameFilter}
                                                onChange={(e) => setStreetNameFilter(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label>Postcode:</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={postalcodeFilter}
                                                onChange={(e) => setPostalcodeFilter(e.target.value)}
                                            >
                                                <option value="">Alle</option>
                                                {postalcodes.map((post) => (
                                                    <option key={post} value={post}>
                                                        {post}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        <div className="row"
                             style={{width: "99%", paddingTop: '10px', marginLeft: "auto", marginRight: "auto"}}>
                            {filteredBuildings.map((building: BuildingInterface) => {
                                return (
                                    <div
                                        className="col-md-4 mb-3 clickable"
                                        key={building.id}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.push({
                                                pathname: "building",
                                                query: {id: building.id},
                                            });
                                        }}
                                    >
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>
                                                    {building.street} {building.house_number}
                                                </Card.Title>
                                                <Card.Text>
                                                    {building.name} {building.postal_code} {building.city}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    </Container>
                </div>
            )}
            <SyndicFooter/>
        </div>
    );
}

export default withAuthorisation(SyndicDashboard, ["Syndic"]);
