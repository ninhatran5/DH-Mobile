import { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "../../assets/css/ckeditor.css";
import { useDispatch } from "react-redux";
import { addBlog } from "../../slices/blogSlice";
import Swal from "sweetalert2";

export default function AddBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const dispatch = useDispatch();

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
        })
      );
      // Nếu addBlog là async thunk, kiểm tra result.meta.requestStatus
      if (result.meta && result.meta.requestStatus === "fulfilled") {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Thêm bài viết thành công!",
        });
        // Reset form nếu muốn
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
          <strong>Tiêu đề:</strong>
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
          <strong>Ảnh đại diện:</strong>
        </label>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="add-blog-input-file"
        />
        {imagePreview && (
          <div className="add-blog-image-preview">
            <img src={imagePreview} alt="Preview" className="add-blog-img" />
          </div>
        )}
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
