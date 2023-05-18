import AdminHeader from "@/components/header/adminHeader";
import { withAuthorisation } from "@/components/withAuthorisation";
import { Schedule, School } from "@mui/icons-material";
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
            title: "Rondes",
            description: "Overzicht van een student op een ronde",
            icon: <School fontSize="large" />,
            url: "/admin/tour",
        },
        {
            id: 2,
            title: "Gewerkte uren",
            description: "Overzicht gewerkte tijden per student",
            icon: <Schedule fontSize="large" />,
            url: "/admin/analysis/working-hours",
        },
    ];

    return (
        <>
            <>
                <AdminHeader />
                <Container>
                    <Row xs={1} sm={2} md={3}>
                        {cardData.map((data) => (
                            <Col key={data.id}>
                                <Link href={data.url}>
                                    <Card>
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