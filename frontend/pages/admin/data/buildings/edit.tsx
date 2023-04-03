import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Form, Dropdown, InputGroup } from "react-bootstrap";
import { BuildingInterface, getAddress } from "@/lib/building";
import { Region, getAllRegions } from "@/lib/region";
import { User, getUserInfo, getAllUsers } from "@/lib/user";
import AdminHeader from "@/components/header/adminHeader";
import { withAuthorisation } from "@/components/withAuthorisation";



export default function AdminDataBuildingsEdit() {
const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic
  };

  return (
    <>
      <AdminHeader />
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="buildingName">
          <Form.Label>Gebouw naam</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="city">
          <Form.Label>Gemeente</Form.Label>
          <Form.Control
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Form.Group>

          <Form.Group controlId="houseNumber">
          <Form.Label>Straat</Form.Label>
          <Form.Control
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="houseNumber">
          <Form.Label>Huisnummer</Form.Label>
          <Form.Control
            type="text"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="busNumber">
          <Form.Label>Busnummer (optioneel)</Form.Label>
          <Form.Control
            type="text"
            value={busNumber}
            onChange={(e) => setBusNumber(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="postalCode">
          <Form.Label>Postcode</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter postal code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </Form.Group>

        {/* Add other form fields and components */}

        <Button variant="primary" type="submit">
          Opslaan
        </Button>
      </Form>
    </>
  );
}
