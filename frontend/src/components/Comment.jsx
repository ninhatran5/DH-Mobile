import { FaStar, FaRegStar } from "react-icons/fa";
import "../assets/css/comment.css";
import dayjs from "dayjs";

const Comment = ({ reviews }) => {
  return (
    <section>
      <div className="container-fluid">
        <div className="row d-flex justify-content-center">
          <div className="col-md-12 col-lg-10">
            <div className="text-body">
              {reviews.map((item, index) => {
                const filledStars = Array.from(
                  { length: item.rating },
                  (_, i) => (
                    <FaStar
                      key={`filled-${index}-${i}`}
                      className="star-filled me-1"
                    />
                  )
                );
                const emptyStars = Array.from(
                  { length: item.maxStars - item.rating },
                  (_, i) => (
                    <FaRegStar
                      key={`empty-${index}-${i}`}
                      className="star-empty me-1"
                    />
                  )
                );

                return (
                  <div className="hr_comment p-4" key={index}>
                    <div className="d-flex flex-start">
                      <img
                        className="rounded-circle shadow-1-strong me-3"
                        src={
                          item?.user?.image_url ||
                          "https://bootdey.com/img/Content/avatar/avatar1.png"
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://bootdey.com/img/Content/avatar/avatar1.png";
                        }}
                        alt="avatar"
                        width={60}
                        height={60}
                      />
                      <div>
                        <h6 className="fw-bold">{item?.user?.full_name}</h6>
                        <p style={{ fontSize: 12 }}>
                          {dayjs(item?.created_at).format("HH:mm / DD-MM-YYYY")}
                        </p>
                        <div className="d-flex">
                          {filledStars}
                          {emptyStars}
                        </div>
                        <p className="mt-2">{item?.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comment;
