// components/ReviewModal.jsx
import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetail } from "../slices/orderSlice";
import numberFormat from "../../utils/numberFormat";
import { commentsPost } from "../slices/reviewSlice";
import Swal from "sweetalert2";

const ReviewModal = ({ show, handleClose, orderId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState("");
  const maxLength = 50;
  const dispatch = useDispatch();
  const { orderDetail } = useSelector((state) => state.order);
  const confirmClose = () => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn đóng?",
      text: "Mọi nội dung bạn đã nhập sẽ bị mất",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đóng",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleClose();
      }
    });
  };
  const handleSubmit = () => {
    dispatch(
      commentsPost({
        product_id: orderId,
        rating,
        content: comment,
      })
    )
      .unwrap()
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Đanh giá thành công",
          text: "Cảm ơn bạn đã đánh giá sản phẩm!",
          showConfirmButton: false,
          timer: 1500,
        });
        handleClose();
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: error || "Không thể gửi đánh giá",
        });
      });
  };
  useEffect(() => {
    if (!orderId) return;
    dispatch(fetchOrderDetail(orderId));
  }, [orderId, dispatch]);

  return (
    <Modal size="lg" show={show} onHide={confirmClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <h4 className="modal_change_address_title">Đánh giá sản phẩm</h4>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container-fluid">
          {orderDetail?.products?.map((product, index) => (
            <div className="d-flex mt-3" key={index}>
              <div className="border_image_return">
                <img
                  className="image_return"
                  src={product.product_image || ""}
                  alt={product.product_name}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p className="title_return_product">{product.product_name}</p>
                <div className="color_return_product">
                  <p className="desc_return_product">
                    {product.variant_attributes?.find(
                      (attr) => attr.attribute_name.toLowerCase() === "màu sắc"
                    )?.attribute_value || "Không rõ"}
                  </p>
                  <p className="quantity_return_product">x{product.quantity}</p>
                </div>
                <p className="price_return_product">
                  {numberFormat(product.price || 0)}
                </p>
              </div>
            </div>
          ))}
          <hr className="hr_return" />
          <div>
            <p className="title_return">Đánh giá sản phẩm</p>
          </div>
          <div className="start_rating">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <FaStar
                  key={index}
                  size={28}
                  style={{ cursor: "pointer", marginRight: 5 }}
                  color={starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHover(starValue)}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })}
          </div>
          <hr className="hr_return" style={{ marginTop: "30px" }} />
          <Form.Group className="mb-3">
            <p className="title_return">Viết đánh giá</p>
            <Form.Control
              as="textarea"
              rows={4}
              value={comment}
              maxLength={maxLength}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này"
              className="textarea_review"
            />
            <p
              className="text-end text-muted mt-1"
              style={{ fontSize: "13px" }}
            >
              {comment.length}/{maxLength} ký tự
            </p>
          </Form.Group>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={confirmClose}>
          Đóng
        </Button>
        <Button
          className="btn_save_address"
          onClick={handleSubmit}
          disabled={rating === 0}
        >
          Gửi đánh giá
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReviewModal;
