import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../assets/css/changeAddress.css";
import { TbEditCircle } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProfile } from "../slices/profileSlice";
import { MdAddCircleOutline } from "react-icons/md";
import Loading from "./Loading";
import AddAddressModal from "./AddAddressModal";
import { addAddresNew, fetchAddressNew } from "../slices/changeAddressSlice";
import AddressList from "./AddressList";

export default function ChangeAddressModal({ show, handleClose }) {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.profile);
  const { changeAddressNew: _ } = useSelector((state) => state.changeAddress);
  const { changeAddressNew } = useSelector((state) => state.changeAddress);
  const [showAddModal, setShowAddModal] = useState(false);
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchAddressNew());
  }, [dispatch]);

  const nagivateToAddAddress = () => {
    setShowAddModal(true);
    handleClose();
  };
  return (
    <>
      {loading && <Loading />}
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size="xl"
      >
        <Modal.Header closeButton>
          <h4 className="modal_change_address_title">Chọn địa chỉ nhận hàng</h4>
        </Modal.Header>
        <Modal.Body>
          <div className="container-fluid">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="radioDefault"
                id="radioDefault1"
                defaultChecked
              />
              <label className="form-check-label" htmlFor="radioDefault1">
                <div className="address-header">
                  <div className="name_address">
                    <p className="name_address_profile">
                      {profile?.user?.full_name || ""}
                    </p>
                    <p className="phone_address_profile">
                      {profile?.user?.phone || ""}
                    </p>
                  </div>
                  <button className="edit-address-btn" type="button">
                    <TbEditCircle />
                  </button>
                </div>
                <div className="full_address_profile">
                  <p className="address_profile">
                    {profile?.user?.address || ""}
                  </p>
                </div>
                <div className="default_address_profile">
                  <p>Mặc định</p>
                </div>
              </label>
            </div>
            <hr className="address-divider" />
            <AddressList addresses={changeAddressNew} />
            <div onClick={nagivateToAddAddress} className="add_address_new">
              <p className="icon_add_address">
                <MdAddCircleOutline />
              </p>
              <p className="text_add_address" onClick={nagivateToAddAddress}>
                Thêm địa chỉ mới
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleClose} className="btn_save_address">
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
      <AddAddressModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAddAddress={async (data) => {
          const fullAddress = `${data.addressDetail}, ${data.ward}, ${data.district}, ${data.city}`;
          await dispatch(
            addAddresNew({
              recipient_name: data.fullName,
              phone: data.phone,
              email: data.email,
              address: fullAddress,
            })
          );
          await dispatch(fetchAddressNew());
          setShowAddModal(false);
        }}
      />
    </>
  );
}
