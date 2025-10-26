import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttributes, deleteAttribute } from "../../slices/Attribute";
import { fetchAttributeValues, deleteAttributeValue } from "../../slices/attributeValueSlice";
import { fetchAdminProductVariants } from "../../slices/AdminProductVariants";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import "../../assets/admin/Attributes.css";

function AttributePage() {
  const dispatch = useDispatch();
  const { attributes, loading, error } = useSelector((state) => state.attribute);
  const { attributeValues } = useSelector((state) => state.attributeValue);
  const { productVariants } = useSelector((state) => state.adminProductVariants);

  const [valueUsageMap, setValueUsageMap] = useState({});

  useEffect(() => {
    dispatch(fetchAttributes());
    dispatch(fetchAdminProductVariants());
  }, [dispatch]);

  useEffect(() => {
    attributes.forEach((attr) => {
      dispatch(fetchAttributeValues(attr.attribute_id));
    });
  }, [attributes, dispatch]);

  useEffect(() => {
    const usageMap = {};
    productVariants.forEach((variant) => {
      if (Array.isArray(variant.attributes)) {
        variant.attributes.forEach((attr) => {
          if (Array.isArray(attr.values)) {
            attr.values.forEach((val) => {
              if (val?.value_id) {
                usageMap[val.value_id] = (usageMap[val.value_id] || 0) + 1;
              }
            });
          }
        });
      }
    });
    setValueUsageMap(usageMap);
  }, [productVariants]);

  const handleDelete = async (id) => {
    const values = attributeValues[id] || [];
    if (values.length > 0) {
      toast.error("Không thể xoá thuộc tính này vì vẫn còn giá trị bên trong.");
      return;
    }
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xoá thuộc tính này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#e5e7eb",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      dispatch(deleteAttribute(id));
      Swal.fire({
        icon: "success",
        title: "Đã xoá thành công!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleDeleteValue = async (valueId) => {
    const isUsed = valueUsageMap[valueId] > 0;
    if (isUsed) {
      toast.error("Không thể xoá giá trị này vì đang được sử dụng trong biến thể sản phẩm.");
      return;
    }

    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xoá Value này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#e5e7eb",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteAttributeValue(valueId)).unwrap();
        Swal.fire({
          icon: "success",
          title: "Đã xoá Value thành công!",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (err) {
        toast.error("Lỗi khi xoá Value.");
      }
    }
  };

  return (
    <div className="AttributeList-adminattributes">
      <ToastContainer />
      <h1>Danh sách thuộc tính</h1>

      {error && <p className="AttributeList-error">{error}</p>}
      {loading && <p className="AttributeList-loading">Đang tải...</p>}

      <div className="AttributeList-header-actions" style={{ textAlign: "right", marginBottom: "1rem" }}>
        <Link to="/admin/Addattribute">
          <button className="AttributeList-btn-add">+ Thêm mới tên thuộc tính</button>
        </Link>
      </div>

      <ul className="AttributeList-attribute-list">
        {attributes.map((attr) => {
          const values = attributeValues[attr.attribute_id] || [];
          return (
            <li key={attr.attribute_id} className="AttributeList-attribute-item">
              <div className="AttributeList-attribute-row">
                <span className="AttributeList-attribute-label">Tên thuộc tính:</span>
                <span className="AttributeList-attribute-data">{attr.name}</span>
              </div>

              {values.length > 0 && (
                <div className="AttributeList-attribute-row">
                  <span className="AttributeList-attribute-label">Giá trị:</span>
                  <span className="AttributeList-attribute-data">
                    {values.map((value) => (
                      <div key={value.value_id} className="AttributeList-value-item">
                        <button
                          className="AttributeList-btn-delete-value"
                          title="Xoá Value"
                          onClick={() => handleDeleteValue(value.value_id)}
                        >
                          &#x2715;
                        </button>

                        <Link to={`/admin/EditAttributevalues/${value.value_id}`}>
                          <button className="AttributeList-btn-edit-value" title="Sửa Value" type="button">
                            &#9998;
                          </button>
                        </Link>

                        <span className="AttributeList-value-text">{value.value}</span>
                      </div>
                    ))}
                  </span>
                </div>
              )}

           <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
          <Link to={`/admin/Editattribute/${attr.attribute_id}`}>
            <button className="AttributeList-btn-action AttributeList-btn-edit">
              <i className="bi bi-pencil"></i>
              Cập nhật thuộc tính
            </button>
          </Link>

          <button
            className="AttributeList-deleteAttribute"
            onClick={() => handleDelete(attr.attribute_id)}
          >
            <i className="bi bi-trash"></i>
            Xoá thuộc tính
          </button>

          <Link to={`/admin/AddAttributevalues/${attr.attribute_id}`}>
            <button className="AttributeList-btn-action AttributeList-btn-add-value">
              <i className="bi bi-plus"></i>
              Thêm giá trị thuộc tính
            </button>
          </Link>
        </div>

            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default AttributePage;
