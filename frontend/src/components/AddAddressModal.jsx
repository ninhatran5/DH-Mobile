import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Modal, Button } from "react-bootstrap";
import AddAddressForm from "./AddAddressForm";
import { useRef } from "react";
import "../assets/css/changeAddress.css";
import { useTranslation } from "react-i18next";

const MySwal = withReactContent(Swal);

export default function AddAddressModal({ show, onHide, onAddAddress }) {
  const formRef = useRef();
  const { t } = useTranslation();

  const handleComplete = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handleClose = async () => {
    const result = await MySwal.fire({
      title: t("address_2.confirmCloseTitle"),
      text: t("address_2.confirmCloseText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("address_2.confirmCloseBtn"),
      cancelButtonText: t("address_2.cancelBtn"),
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      onHide();
    }
  };

  return (
    <Modal size="xl" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <h4 className="modal_change_address_title">
          {t("address_2.newAddressTitle")}
        </h4>
      </Modal.Header>
      <Modal.Body>
        <AddAddressForm ref={formRef} onSubmitExternal={onAddAddress} />
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn_save_address" onClick={handleComplete}>
          {t("address_2.completeBtn")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
