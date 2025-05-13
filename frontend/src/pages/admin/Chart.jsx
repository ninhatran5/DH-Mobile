import React from "react";
import '../../assets/admin/Chart.css'

const Chart = () => {
    return(
        <div className="container-fluid">
        <div className="row">
          <div className="col-md-3">
            <div className="card stat-card">
              <div className="card-body">
                <h5 className="card-title">Tổng Người Dùng</h5>
                <h2>1,234</h2>
                <p className="text-success"><i className="bi bi-arrow-up" /> 12.5%</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card">
              <div className="card-body">
                <h5 className="card-title">Doanh Thu</h5>
                <h2>45,678đ</h2>
                <p className="text-success"><i className="bi bi-arrow-up" /> 8.3%</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card">
              <div className="card-body">
                <h5 className="card-title">Đơn Hàng</h5>
                <h2>567</h2>
                <p style={{ color: '#dc3545' }}>
  <i className="bi bi-arrow-down" /> 3.2%
</p>

              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card">
              <div className="card-body">
                <h5 className="card-title">Sản Phẩm</h5>
                <h2>890</h2>
                <p className="text-success"><i className="bi bi-arrow-up" /> 5.7%</p>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">Giao Dịch Gần Đây</h5>
                  <div className="d-flex gap-2">
                    <button className="btn btn-light btn-sm">
                      <i className="bi bi-filter" /> Lọc
                    </button>
                    <button className="btn btn-light btn-sm">
                      <i className="bi bi-download" /> Xuất
                    </button>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Mã Giao Dịch</th>
                        <th>Khách Hàng</th>
                        <th>Sản Phẩm</th>
                        <th>Ngày</th>
                        <th>Số Tiền</th>
                        <th>Trạng Thái</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span className="text-primary">#GD-789</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-circle bg-primary-soft me-2">NV</div>
                            <div>
                              <div className="fw-medium">Nguyễn Văn A</div>
                              <small className="text-muted">nguyenvana@example.com</small>
                            </div>
                          </div>
                        </td>
                        <td>Gói Premium</td>
                        <td>20/02/2024</td>
                        <td>
                          <span className="fw-medium">299,000đ</span>
                        </td>
                        <td>
                          <span className="badge bg-success-soft text-success">Hoàn thành</span>
                        </td>
                        <td>
                          <div className="dropdown">
                            <button className="btn btn-light btn-sm" data-bs-toggle="dropdown">
                              <i className="bi bi-three-dots" />
                            </button>
                            <ul className="dropdown-menu">
                              <li><a className="dropdown-item" href="#"><i className="bi bi-eye me-2" />Xem Chi Tiết</a></li>
                              <li><a className="dropdown-item" href="#"><i className="bi bi-printer me-2" />In</a></li>
                              <li><hr className="dropdown-divider" /></li>
                              <li><a className="dropdown-item text-danger" href="#"><i className="bi bi-trash me-2" />Xóa</a></li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="text-primary">#GD-788</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-circle bg-success-soft me-2">TH</div>
                            <div>
                              <div className="fw-medium">Trần Thị B</div>
                              <small className="text-muted">tranthib@example.com</small>
                            </div>
                          </div>
                        </td>
                        <td>Gói Cơ Bản</td>
                        <td>19/02/2024</td>
                        <td>
                          <span className="fw-medium">199,000đ</span>
                        </td>
                        <td>
                          <span className="badge bg-warning-soft text-warning">Đang xử lý</span>
                        </td>
                        <td>
                          <div className="dropdown">
                            <button className="btn btn-light btn-sm" data-bs-toggle="dropdown">
                              <i className="bi bi-three-dots" />
                            </button>
                            <ul className="dropdown-menu">
                              <li><a className="dropdown-item" href="#"><i className="bi bi-eye me-2" />Xem Chi Tiết</a></li>
                              <li><a className="dropdown-item" href="#"><i className="bi bi-printer me-2" />In</a></li>
                              <li><hr className="dropdown-divider" /></li>
                              <li><a className="dropdown-item text-danger" href="#"><i className="bi bi-trash me-2" />Xóa</a></li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="text-primary">#GD-787</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-circle bg-info-soft me-2">LH</div>
                            <div>
                              <div className="fw-medium">Lê Hoàng C</div>
                              <small className="text-muted">lehoangc@example.com</small>
                            </div>
                          </div>
                        </td>
                        <td>Gói Pro</td>
                        <td>19/02/2024</td>
                        <td>
                          <span className="fw-medium">399,000đ</span>
                        </td>
                        <td>
                          <span className="badge bg-danger-soft text-danger">Thất bại</span>
                        </td>
                        <td>
                          <div className="dropdown">
                            <button className="btn btn-light btn-sm" data-bs-toggle="dropdown">
                              <i className="bi bi-three-dots" />
                            </button>
                            <ul className="dropdown-menu">
                              <li><a className="dropdown-item" href="#"><i className="bi bi-eye me-2" />Xem Chi Tiết</a></li>
                              <li><a className="dropdown-item" href="#"><i className="bi bi-printer me-2" />In</a></li>
                              <li><hr className="dropdown-divider" /></li>
                              <li><a className="dropdown-item text-danger" href="#"><i className="bi bi-trash me-2" />Xóa</a></li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted">
                    Hiển thị 1 đến 3 trong tổng số 100 mục
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className="page-item disabled">
                        <a className="page-link" href="#"><i className="bi bi-chevron-left" /></a>
                      </li>
                      <li className="page-item active"><a className="page-link" href="#">1</a></li>
                      <li className="page-item"><a className="page-link" href="#">2</a></li>
                      <li className="page-item"><a className="page-link" href="#">3</a></li>
                      <li className="page-item">
                        <a className="page-link" href="#"><i className="bi bi-chevron-right" /></a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}
export default Chart;