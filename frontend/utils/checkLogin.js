import { toast } from "react-toastify";

export default function checkLogin() {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.warn("Vui lòng đăng nhập để thực hiện chức năng này");
    window.location.href = "/login";
  }
  return token;
}
