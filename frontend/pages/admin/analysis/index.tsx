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
            <AdminHeader />
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh", // Adjust the height based on your needs
                }}
            >
                <Container>
                    <Row>
                        {cardData.map((data) => (
                            <Col key={data.id}>
                                <Link href={data.url}>
                                    <Card>
                                        <Card.Body>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {data.icon}
                                            </div>
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
        </>
    );
}

export default withAuthorisation(AdminAnalysis, ["Admin", "Superstudent"]);
