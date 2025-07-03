import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addAttribute } from "../../slices/Attribute";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function AddAttributePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.trim()) {
      dispatch(addAttribute({ name }))
        .unwrap()
        .then(() => {
          toast.success("Thêm thành công!");
          setTimeout(() => {
            navigate("/admin/attribute");
          }, 500);
        })
        .catch((err) => {
          toast.error(err || "Lỗi khi thêm attribute!");
        });
    }
  };

  return (
    <div className="adminattributes">
      <ToastContainer />
      <h1>Thêm mới thuộc tính </h1>

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontWeight: "500", display: "block", marginBottom: "0.4rem" }}>
            Tên thuộc tính:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.8rem" }}>
          <button
            type="submit"
            className="btn-add"
            style={{ flex: "0 0 auto" }}
          >
            Thêm
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/attribute")}
            style={{
              backgroundColor: "#888",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Huỷ
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAttributePage;
