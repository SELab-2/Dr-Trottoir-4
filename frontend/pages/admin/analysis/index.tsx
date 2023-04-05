import AdminHeader from "@/components/header/adminHeader";
import { Business, LocationOn, Schedule, School } from "@mui/icons-material";
import { Grid, Paper, Typography } from "@mui/material";
import Link from "next/link";
import { Card, Col, Container, Row } from "react-bootstrap";

export default function AdminAnalysis() {
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
            icon: <School />,
            url: "analysis/students",
          },
          {
            id: 2,
            title: "Tours",
            description: "Overzicht gespendeerde tijd versus gebudgeteerde tijd",
            icon: <LocationOn />,
            url: "analysis/tours",
          },
          {
            id: 3,
            title: "Working Hours",
            description: "Overzicht gewerkte tijden per student per week",
            icon: <Schedule />,
            url: "analysis/working-hours",
          },
      ];

    return (
        <>
            <>
                <AdminHeader />
                <Container fluid className="mt-3">
                    <Row xs={1} sm={2} md={3} className="g-3">
                    {cardData.map((data) => (
                        <Col key={data.id}>
                        <Link href={data.url}>
                            <Card>
                            <Card.Body>
                                <div
                                className="d-flex justify-content-center align-items-center mb-3"
                                style={{ height: "60%", background: "#f1f1f1" }}
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
            </>
        </>
    );
}
