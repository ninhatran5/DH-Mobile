export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) {
  if (totalPages <= 1) return null;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: "smooth" }); // cuộn lên đầu nếu muốn
    }
  };

  return (
    <div className={`d-flex justify-content-center my-4 mt-5 ${className}`}>
      <nav>
        <ul className="pagination">
          <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo;
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, i) => (
            <li
              key={i + 1}
              className={`page-item${currentPage === i + 1 ? " active" : ""}`}
            >
              <button className="page-link" onClick={() => goToPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}

          <li
            className={`page-item${
              currentPage === totalPages ? " disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
