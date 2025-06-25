import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Modal, Button } from "react-bootstrap";
import AddAddressForm from "./AddAddressForm";
import { useRef } from "react";
import "../assets/css/changeAddress.css";

const MySwal = withReactContent(Swal);

export default function AddAddressModal({ show, onHide, onAddAddress }) {
  const formRef = useRef();

  const handleComplete = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handleClose = async () => {
    const result = await MySwal.fire({
      title: "Bạn có chắc chắn muốn đóng?",
      text: "Địa chỉ chưa được lưu sẽ bị mất.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đóng",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      onHide();
    }
  };

  return (
    <Modal size="xl" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <h4 className="modal_change_address_title">Địa chỉ mới</h4>
      </Modal.Header>
      <Modal.Body>
        <AddAddressForm ref={formRef} onSubmitExternal={onAddAddress} />
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn_save_address" onClick={handleComplete}>
          Hoàn thành
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
