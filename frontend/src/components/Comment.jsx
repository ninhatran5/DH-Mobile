import { FaStar, FaRegStar } from "react-icons/fa";
import "../assets/css/comment.css";

const Comment = () => {
  const comments = [
    {
      name: "Maggie Marsh",
      avatar: "https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(23).webp",
      rating: 3,
      maxStars: 5,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    },
    {
      name: "John Doe",
      avatar: "https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(24).webp",
      rating: 4,
      maxStars: 5,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    },
    // Thêm các người dùng khác tại đây
  ];

  return (
    <section>
      <div className="container-fluid">
        <div className="row d-flex justify-content-center">
          <div className="col-md-12 col-lg-10">
            <div className="text-body">
              {comments.map((item, index) => {
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
                        src={item.avatar}
                        alt="avatar"
                        width={60}
                        height={60}
                      />
                      <div>
                        <h6 className="fw-bold mb-1">{item.name}</h6>
                        <div className="mb-2 d-flex">
                          {filledStars}
                          {emptyStars}
                        </div>
                        <p className="mb-0">{item.description}</p>
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
