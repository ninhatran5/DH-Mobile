import { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "../../assets/css/ckeditor.css";
import { useDispatch, useSelector } from "react-redux";
import { addBlog } from "../../slices/blogSlice";
import Swal from "sweetalert2";

export default function AddBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const dispatch = useDispatch();

  const { adminProfile } = useSelector((state) => state.adminProfile);
  const user = adminProfile?.user;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview("");
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await dispatch(
        addBlog({
          title: title,
          content: content,
          image_url: imageFile,
          user_id: user.id,
        })
      );
      if (result.meta && result.meta.requestStatus === "fulfilled") {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Thêm bài viết thành công!",
        });
        setTitle("");
        setContent("");
        setImageFile(null);
        setImagePreview("");
      } else {
        throw new Error(result.error?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: error.message || "Thêm bài viết thất bại!",
      });
    }
  };

  return (
    <div className="add-blog-container">
      <h2 className="add-blog-title">Thêm bài viết mới</h2>
      <div className="add-blog-form-group">
        <label htmlFor="title">
          <strong>Tiêu đề * :</strong>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề bài viết"
          className="add-blog-input"
        />
      </div>
      <div className="add-blog-form-group">
        <label htmlFor="imageUpload">
          <strong>Ảnh bài viết * : </strong>
        </label>
        <div className="image-upload-container">
          <label className="custom-file-upload">
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <div className="upload-button">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 8L12 3L7 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 3V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Chọn ảnh bài viết * </span>
            </div>
          </label>
          {imagePreview && (
            <div className="image-preview-single">
              <img src={imagePreview} alt="Preview" className="add-blog-img" />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview("");
                }}
              >
                ×
              </button>
            </div>
          )}
          <p className="upload-hint">Định dạng: JPG, PNG. Tối đa 2MB</p>
        </div>
      </div>
      <CKEditor
        editor={ClassicEditor}
        data={content}
        onChange={(event, editor) => {
          const data = editor.getData();
          setContent(data);
        }}
        config={{
          toolbar: [
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "bulletedList",
            "numberedList",
            "blockQuote",
            "undo",
            "redo",
          ],
          image: {
            toolbar: [
              "imageTextAlternative",
              "imageStyle:full",
              "imageStyle:side",
            ],
          },
        }}
      />
      <div style={{ marginTop: "20px" }}>
        <button className="add-blog-btn" onClick={handleSubmit}>
          Thêm bài viết
        </button>
      </div>
    </div>
  );
}
