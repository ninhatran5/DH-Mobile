import { Modal, Button } from "react-bootstrap";
import ChangeCheckout from "../pages/ChangeCheckout";
import { useRef } from "react";
import "../assets/css/changeAddress.css";

export default function AddAddressModal({ show, onHide, onAddAddress }) {
  const formRef = useRef();

  const handleComplete = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  return (
    <Modal size="xl" show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <h4 className="modal_change_address_title">Địa chỉ mới</h4>
      </Modal.Header>
      <Modal.Body>
        <ChangeCheckout ref={formRef} onSubmitExternal={onAddAddress} />
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn_save_address" onClick={handleComplete}>
          Hoàn thành
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
