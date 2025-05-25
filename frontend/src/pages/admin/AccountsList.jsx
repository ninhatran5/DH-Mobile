import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminAccounts,
  deleteAdminAccount,
} from "../../slices/adminAcccount";

const AdminAccountList = () => {
  const dispatch = useDispatch();
  const { accounts, loading, error } = useSelector((state) => state.adminAccount);

  useEffect(() => {
    dispatch(fetchAdminAccounts());
  }, [dispatch]);

  useEffect(() => {
    console.log("Dữ liệu server trả về:", accounts);
  }, [accounts]);

  const handleDelete = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xoá tài khoản này?")) {
      dispatch(deleteAdminAccount(id));
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Danh sách tài khoản Admin</h2>

      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Tên</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(accounts) && accounts.length > 0 ? (
            accounts.map((acc) => (
              <tr key={acc.user_id} className="text-center">
                <td className="p-2 border">{acc.user_id}</td>
                <td className="p-2 border">{acc.name}</td>
                <td className="p-2 border">{acc.email}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleDelete(acc.user_id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))
          ) : !loading ? (
            <tr>
              <td colSpan="4" className="p-2 border text-center text-gray-500">
                Không có tài khoản nào
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan="4" className="p-2 border text-center text-gray-500">
                Đang tải dữ liệu...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAccountList;
