import AdminHeader from "@/components/header/adminHeader";
import {withAuthorisation} from "@/components/withAuthorisation";
import {Schedule, School} from "@mui/icons-material";
import Link from "next/link";
import {Card, Col, Container, Row} from "react-bootstrap";
import {Divider} from "@mui/material";

function AdminAnalysis() {
    interface CardProps {
        id: number;
        title: string;
        description: string;
        icon: React.ReactNode;
        url: string;
    }

    const cardData: CardProps[] = [
        {
            id: 1,
            title: "Rondes",
            description: "Overzicht van een student op een ronde",
            icon: <School style={{fontSize: '100px'}}/>,
            url: "/admin/tour",
        },
        {
            id: 2,
            title: "Gewerkte uren",
            description: "Overzicht gewerkte tijden per student",
            icon: <Schedule  style={{fontSize: '100px'}}/>,
            url: "/admin/analysis/working-hours",
        },
    ];

    return (
        <div className="tablepageContainer">
            <AdminHeader/>
            <div className="tableContainer" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Container style={{flex: '1'}} className="center_container">
                    <Row>
                        {cardData.map((data) => (
                            <Col key={data.id}>
                                <Link href={data.url} style={{color: 'black'}} passHref>
                                    <Card style={{height: '300px'}}>
                                        <Card.Body>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '10px',
                                                    color: 'black'
                                                }}
                                            >
                                                {data.icon}
                                            </div>
                                            <Divider/>
                                            <div style={{padding: '10px'}}/>
                                            <Card.Title>{data.title}</Card.Title>
                                            <Card.Text>{data.description}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>
        </div>
    );
}

export default withAuthorisation(AdminAnalysis, ["Admin", "Superstudent"]);