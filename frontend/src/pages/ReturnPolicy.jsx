import "../assets/css/guarantee.css";
const ReturnPolicy = () => {
  return (
    <>
      <div className="container-fluid">
        <div className="guarantee">
          <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
            <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
              Chính Sách Đổi Trả
            </h1>
            <p className="text-des mb-4 text-gray-700">
              DH Mobile cam kết đảm bảo quyền lợi của khách hàng với chính sách
              đổi trả linh hoạt. Dưới đây là các điều khoản về chính sách đổi
              trả:
            </p>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              1. Điều Kiện Đổi Trả
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>Sản phẩm còn nguyên vẹn, không có dấu hiệu đã sử dụng.</li>
              <li>Sản phẩm phải có hóa đơn mua hàng và tem bảo hành đi kèm.</li>
              <li>
                Sản phẩm phải được đổi trả trong vòng 7 ngày kể từ ngày mua.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              2. Quy Trình Đổi Trả
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>Liên hệ với DH Mobile qua hotline hoặc đến cửa hàng.</li>
              <li>Cung cấp hóa đơn mua hàng và lý do đổi trả.</li>
              <li>Chờ xử lý đổi trả trong vòng 3-5 ngày làm việc.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              3. Điều Kiện Không Được Đổi Trả
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>
                Sản phẩm đã qua sử dụng, bị trầy xước hoặc hư hỏng do lỗi của
                người sử dụng.
              </li>
              <li>Sản phẩm không có hóa đơn hoặc tem bảo hành.</li>
              <li>
                Sản phẩm bị lỗi do tác động ngoại lực (rơi vỡ, vào nước, v.v.).
              </li>
            </ul>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              4. Chính Sách Hoàn Tiền
            </h2>
            <p className="text-gray-700 mb-4">
              Nếu sản phẩm không thể đổi trả được, DH Mobile sẽ hoàn tiền theo
              hình thức chuyển khoản hoặc hoàn tiền tại cửa hàng.
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
export default ReturnPolicy;
