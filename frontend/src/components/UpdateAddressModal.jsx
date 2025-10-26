import Swal from "sweetalert2";
import { Modal, Button } from "react-bootstrap";
import UpdateAddressForm from "./UpdateAddressForm";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

export default function UpdateAddressModal({
  show,
  onHide,
  onUpdateAddress,
  defaultValues,
}) {
  const formRef = useRef();
  const { t } = useTranslation();

  const handleClose = async () => {
    const result = await Swal.fire({
      title: t("updateProfile.confirmCloseTitle"),
      text: t("updateProfile.confirmCloseText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("updateProfile.confirmCloseBtn"),
      cancelButtonText: t("updateProfile.cancelBtn"),
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      onHide();
    }
  };
  const handleComplete = async () => {
    const result = await Swal.fire({
      title: t("updateProfile.confirmUpdateTitle"),
      text: t("updateProfile.confirmUpdateText"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("updateProfile.updateBtn"),
      cancelButtonText: t("updateProfile.cancelBtn"),
      reverseButtons: true,
    });
    if (result.isConfirmed && formRef.current) {
      formRef.current.submit();
      Swal.fire({
        icon: "success",
        title: t("updateProfile.successTitle"),
        text: t("updateProfile.successText"),
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  return (
    <Modal size="xl" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <h4 className="modal_change_address_title">
          {t("updateProfile.updateAddressTitle")}
        </h4>
      </Modal.Header>
      <Modal.Body>
        <UpdateAddressForm
          ref={formRef}
          onSubmitExternal={onUpdateAddress}
          defaultValues={defaultValues}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn_save_address" onClick={handleComplete}>
          {t("updateProfile.updateBtn")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
