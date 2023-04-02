import React, { useState } from "react";
import { logout } from "@/lib/logout";
import { useRouter } from "next/router";
import { Modal, Button } from "react-bootstrap";

function Logout() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    logout().then(
      async (res) => {
        if (res.status === 200) {
          sessionStorage.removeItem("id");
          sessionStorage.removeItem("role");
          await router.push("/login");
        }
      },
      (err) => {
        console.error(err);
      }
    );
    setShowModal(false);
  };

  return (
    <>
      <a
        className="dropdown-item"
        onClick={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}
      >
        Log out
      </a>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Log out</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to log out?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="btn-light" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" className="btn-dark" onClick={handleLogout}>
            Log out
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Logout;