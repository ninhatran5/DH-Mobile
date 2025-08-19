import { FaBan, FaCheck, FaTimes } from "react-icons/fa";
import { IoCloudUploadSharp } from "react-icons/io5";
import "../assets/admin/invoiceModal1.css";
import { useState, useEffect } from "react";

const InvoiceUploadModal = ({
  show,
  onClose,
  onSubmit,
  uploading,
  invoiceFile,
  setInvoiceFile,
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (invoiceFile) {
      const url = URL.createObjectURL(invoiceFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [invoiceFile]);

  if (!show) return null;
  return (
    <div className="invoice-modal-overlay" onClick={onClose}>
      <div className="invoice-modal" onClick={e => e.stopPropagation()}>
        <div className="invoice-modal-header">
          <div className="modal-header-content">
            <div className="modal-icon">
              <IoCloudUploadSharp  size={24} />
            </div>
            <div className="modal-title-section">
              <h3 className="modal-title">Tải lên hóa đơn thanh toán</h3>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes size={18} />
          </button>
        </div>
        <div className="invoice-modal-body">
          <label htmlFor="invoice-file" className="custom-file-upload1">
            {invoiceFile ? 'Đổi file' : 'Chọn file'}
          </label>
          <input
            id="invoice-file"
            type="file"
            accept="image/*"
            onChange={e => setInvoiceFile(e.target.files[0])}
            className="invoice-file-input"
            style={{ display: 'none' }}
          />
          {previewUrl && (
            <div className="invoice-preview-outer">
              <div className="invoice-preview-imgbox">
                <img
                  src={previewUrl}
                  alt="Invoice Preview"
                  className="invoice-preview-img"
                />
              </div>
            </div>
          )}
        </div>
        <div className="invoice-modal-footer">
          <button
            className="modal-action-btn secondary"
            onClick={onClose}
            disabled={uploading}
          >
            <FaBan size={14} />
            <span>Hủy</span>
          </button>
          <button
            className="modal-action-btn primary"
            onClick={onSubmit}
            disabled={uploading}
          >
            <FaCheck size={14} />
            <span>Xác nhận</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceUploadModal;
