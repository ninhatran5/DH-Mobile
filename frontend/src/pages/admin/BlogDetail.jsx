import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchNewsById } from "../../slices/newsSlice";
import dayjs from "dayjs";
import Loading from "../../components/Loading";

export default function BlogDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, loading, error } = useSelector((state) => state.adminNews);

  useEffect(() => {
    if (id) dispatch(fetchNewsById(id));
  }, [dispatch, id]);

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return (
      <div style={{ color: "#d32f2f", textAlign: "center", margin: 40 }}>
        {error}
      </div>
    );
  }
  if (!current) return null;

  return (
    <>
      <div style={{ margin: "0 auto", padding: "32px 0 0 0" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            padding: 28,
            marginBottom: 40,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "linear-gradient(90deg,#ff7e5f,#feb47b)",
              border: "none",
              borderRadius: 12,
              padding: "10px 28px",
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 32,
              color: "#fff",
              boxShadow: "0 4px 16px rgba(255,126,95,0.12)",
              cursor: "pointer",
              transition: "transform 0.2s",
              letterSpacing: 1,
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            ← Quay lại
          </button>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <img
                src={current?.data?.user?.image_url}
                alt={"Avatar"}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ff7e5f",
                  boxShadow: "0 2px 8px rgba(255,126,95,0.12)",
                }}
              />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 17,
                  color: "#ff7e5f",
                  textShadow: "0 2px 8px rgba(255,126,95,0.08)",
                }}
              >
                {current?.data?.user?.full_name}
              </span>
            </div>
            <h2
              style={{
                fontWeight: 700,
                fontSize: 26,
                marginBottom: 14,
                color: "#222",
              }}
            >
              {current?.data?.title}
            </h2>
            <ul
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 28,
                listStyle: "none",
                padding: 0,
                margin: 0,
                color: "#888",
                fontSize: 15,
              }}
            >
              <li>
                <span className="me-1">Ngày tạo</span>
                {dayjs(current?.data?.create).format("DD/MM/YYYY")}
              </li>
              <li>
                <span className="me-1">Ngày cập nhật</span>
                {dayjs(current?.data?.updated_at).format("DD/MM/YYYY")}
              </li>
            </ul>
          </div>
          <div style={{ textAlign: "center", margin: "24px 0" }}>
            <img
              src={current?.data?.image_url}
              alt={current?.data?.title}
              style={{
                maxWidth: "100%",
                borderRadius: 14,
                boxShadow: "0 8px 32px rgba(255,126,95,0.10)",
                maxHeight: 320,
                objectFit: "cover",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#333",
            }}
          >
            <div
              className="blog__details__text"
              dangerouslySetInnerHTML={{
                __html: current?.data?.content || "",
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}
