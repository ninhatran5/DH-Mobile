import { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useDispatch, useSelector } from "react-redux";
import { fetchNewsById, updateNews } from "../../slices/newsSlice";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";

export default function UpdateBlog() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, loading, error } = useSelector((state) => state.adminNews);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    dispatch(fetchNewsById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (current && current.data) {
      setTitle(current.data.title || "");
      setContent(current.data.content || "");
      setImagePreview(current.data.image_url || "");
    }
  }, [current]);

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
      // eslint-disable-next-line no-unused-vars
      const result = await dispatch(
        updateNews({
          newsId: id,
          title,
          content,
          image_url: imageFile,
        })
      ).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Cập nhật bài viết thành công!",
        confirmButtonText: "OK",
      });
      navigate("/admin/articles");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: error || "Cập nhật bài viết thất bại!",
      });
    }
  };

  if (loading) return <Loading />;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="add-blog-container">
      <h2 className="add-blog-title">Cập nhật bài viết</h2>
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
          <strong>Ảnh bài viết:</strong>
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
              <span>Chọn ảnh bài viết</span>
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
      <div className="add-blog-form-group">
        <label
          htmlFor="ckeditor-content"
          style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
        >
          Nội dung:
        </label>
        <div
          className="ckeditor-wrapper"
          style={{
            border: "1px solid #d0d7de",
            borderRadius: 8,
            padding: 8,
            background: "#fafbfc",
          }}
        >
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
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <button className="add-blog-btn" onClick={handleSubmit}>
          Cập nhật bài viết
        </button>
      </div>
    </div>
  );
}
