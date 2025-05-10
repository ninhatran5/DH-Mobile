import "../assets/css/guarantee.css";
const DeliveryPolicy = () => {
  return (
    <>
      <div className="container-fluid">
        <div className="guarantee">
          <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
            <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
              Chính Sách Giao Hàng
            </h1>
            <p className="text-des mb-4 text-gray-700">
              DH Mobile cam kết giao hàng nhanh chóng và an toàn đến tay khách
              hàng. Dưới đây là các điều khoản về chính sách giao hàng:
            </p>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              1. Phương Thức Giao Hàng
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>Giao hàng tận nơi qua dịch vụ chuyển phát nhanh.</li>
              <li>
                Giao hàng tại cửa hàng DH Mobile theo yêu cầu của khách hàng.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              2. Thời Gian Giao Hàng
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>
                Đơn hàng trong nội thành: Giao trong vòng 1-2 ngày làm việc.
              </li>
              <li>Đơn hàng ngoài thành: Giao trong vòng 3-5 ngày làm việc.</li>
              <li>
                Thời gian giao hàng có thể thay đổi tùy vào khu vực và tình
                trạng đơn hàng.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              3. Phí Giao Hàng
            </h2>
            <p className="text-gray-700 mb-4">
              Phí giao hàng sẽ được tính dựa trên khu vực và trọng lượng của đơn
              hàng. Phí giao hàng sẽ được thông báo rõ ràng trước khi khách hàng
              thanh toán.
            </p>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              4. Chính Sách Giao Hàng Miễn Phí
            </h2>
            <p className="text-gray-700 mb-4">
              DH Mobile miễn phí giao hàng cho đơn hàng có giá trị trên
              1,000,000 VNĐ hoặc khi có các chương trình khuyến mãi đặc biệt.
            </p>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              5. Trường Hợp Hủy Đơn Hàng
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>
                Khách hàng có thể hủy đơn hàng trước khi sản phẩm được giao đi.
              </li>
              <li>
                Đơn hàng đã giao không thể hủy trừ khi có lỗi từ phía DH Mobile.
              </li>
            </ul>

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
export default DeliveryPolicy;
