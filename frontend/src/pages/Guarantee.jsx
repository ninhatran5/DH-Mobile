import "../assets/css/guarantee.css";
const Guarantee = () => {
  return (
    <>
      <div className="container-fluid">
        <div className="guarantee">
          <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
            <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
              Chính Sách Bảo Hành
            </h1>
            <p className="text-des mb-4 text-gray-700">
              DH Mobile cam kết mang đến cho khách hàng những sản phẩm chất
              lượng cùng dịch vụ hậu mãi uy tín. Dưới đây là các điều khoản về
              chính sách bảo hành:
            </p>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              1. Thời gian bảo hành
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>Điện thoại mới: Bảo hành chính hãng 12 tháng.</li>
              <li>Điện thoại likenew (99%): Bảo hành DH Mobile 6 tháng.</li>
              <li>Phụ kiện đi kèm: Bảo hành 1 tháng (nếu có).</li>
            </ul>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              2. Điều kiện bảo hành
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>Sản phẩm còn thời hạn bảo hành và có tem/phiếu bảo hành.</li>
              <li>
                Lỗi kỹ thuật do nhà sản xuất (không do tác động ngoại lực).
              </li>
              <li>
                Không bị can thiệp phần cứng, mở máy ngoài trung tâm ủy quyền.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              3. Trường hợp từ chối bảo hành
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>Sản phẩm bị rơi vỡ, vào nước, cháy nổ do dùng sai cách.</li>
              <li>
                Mất tem bảo hành, phiếu bảo hành hoặc serial không trùng khớp.
              </li>
              <li>Tự ý sửa chữa tại nơi không được DH Mobile ủy quyền.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              4. Hỗ trợ sau bảo hành
            </h2>
            <p className="text-gray-700 mb-2">
              Sau thời gian bảo hành, DH Mobile vẫn hỗ trợ sửa chữa với chi phí
              ưu đãi.
            </p>

            <p className="text-gray-700 font-medium">
              Mọi thắc mắc xin liên hệ hotline:{" "}
              <span className="text-blue-600">1900 1234</span> hoặc đến trực
              tiếp cửa hàng DH Mobile.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
export default Guarantee;
