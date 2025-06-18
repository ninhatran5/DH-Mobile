import { Modal } from "react-bootstrap";
import ProductDetail from "../pages/ProductDetail";
import "../assets/css/productModal.css";

const ProductModal = ({ show, onHide, product }) => (
  <Modal
    show={show}
    onHide={onHide}
    fullscreen={true}
    className="product-modal"
    backdropClassName="product-modal-backdrop"
    centered
  >
    <Modal.Body className="product-modal-body">
      <button
        type="button"
        className="product-modal-btn-close"
        aria-label="Close"
        onClick={onHide}
      >
        <span>&times;</span>
      </button>
  
        <ProductDetail productId={product?.product_id} hideExtraInfo={true} />
    </Modal.Body>
  </Modal>
);

export default ProductModal;
