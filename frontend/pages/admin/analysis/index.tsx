import AdminHeader from "@/components/header/adminHeader";
import { withAuthorisation } from "@/components/withAuthorisation";
import { LocationOn, Schedule, School } from "@mui/icons-material";
import Link from "next/link";
import { Card, Col, Container, Row } from "react-bootstrap";

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
            title: "Students",
            description: "Overzicht gewerkte tijden per ronde en per gebouw",
            icon: <School fontSize="large" />,
            url: "analysis/students",
        },
        {
            id: 2,
            title: "Tours",
            description: "Overzicht gespendeerde tijd versus gebudgeteerde tijd",
            icon: <LocationOn fontSize="large" />,
            url: "analysis/tours",
        },
        {
            id: 3,
            title: "Working Hours",
            description: "Overzicht gewerkte tijden per student per week",
            icon: <Schedule fontSize="large" />,
            url: "analysis/working-hours",
        },
    ];

    return (
        <>
            <>
                <AdminHeader />
                <p className="title">Dashboard.</p>
                <Container fluid className="mt-3">
                    <Row xs={1} sm={2} md={3} className="g-3">
                        {cardData.map((data) => (
                            <Col key={data.id}>
                                <Link href={data.url}>
                                    <Card className="h-100" style={{ width: "100%", height: "100%", margin: "0 auto" }}>
                                        <Card.Body>
                                            <div
                                                className="d-flex justify-content-center align-items-center mb-3"
                                                style={{ height: "50%", background: "#303030" }}
                                            >
                                                {data.icon}
                                            </div>
                                            <Card.Title className="h5">{data.title}</Card.Title>
                                            <Card.Text className="text-muted fs-6">{data.description}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </>
        </>
    );
}

export default withAuthorisation(AdminAnalysis, ["Admin", "Superstudent"]);
