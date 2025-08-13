import { Link } from "react-router-dom";

const Breadcrumb = ({
  title,
  linkMainItem,
  mainItem,
  mainItem2,
  linkMainItem2,
  secondaryItem,
  showMainItem2 = true,
}) => {
  return (
    <section className="breadcrumb-option mb-3" style={{ marginTop: "-10px" }}>
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="breadcrumb__text">
              <h4>{title}</h4>
              <div className="breadcrumb__links">
                <Link style={{ textDecoration: "none" }} to={linkMainItem}>
                  {mainItem}
                </Link>
                {showMainItem2 ? (
                  <Link style={{ textDecoration: "none" }} to={linkMainItem2}>
                    {mainItem2}
                  </Link>
                ) : (
                  ""
                )}
                <span>{secondaryItem}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Breadcrumb;
