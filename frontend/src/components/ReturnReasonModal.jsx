import Modal from "react-bootstrap/Modal";
import { PiImageBroken } from "react-icons/pi";
import { SlSocialDropbox } from "react-icons/sl";
import { useTranslation } from "react-i18next";

const ReturnReasonModal = ({ show, handleClose, handleOpenSubModal }) => {
  const { t } = useTranslation();

  return (
    <Modal size="l" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <h4 className="modal_change_address_title">
            {t("returnReason.title")}
          </h4>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div
            className="d-flex justify-content-between align-items-center"
            onClick={() => handleOpenSubModal(1)}
            style={{ cursor: "pointer" }}
          >
            <div className="icon_return">
              <PiImageBroken />
            </div>
            <div>
              <p className="title_return">{t("returnReason.option1Title")}</p>
              <p className="title_description">
                {t("returnReason.option1Desc")}
              </p>
            </div>
          </div>
          <hr className="hr_return" />
          <div
            className="d-flex justify-content-between align-items-center"
            onClick={() => handleOpenSubModal(2)}
            style={{ cursor: "pointer" }}
          >
            <div className="icon_return_2">
              <SlSocialDropbox />
            </div>
            <div>
              <p className="title_return_2">{t("returnReason.option2Title")}</p>
              <p className="title_description2">
                {t("returnReason.option2Desc")}
              </p>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ReturnReasonModal;
