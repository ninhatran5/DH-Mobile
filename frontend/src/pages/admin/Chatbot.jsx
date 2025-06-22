import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatbots } from '../../slices/ChatSlice';
import '../../assets/admin/ChatbotAdmin.css';

const ChatBotAdmin = () => {
    const dispatch = useDispatch();
    const { chatbots, loading, error } = useSelector((state) => state.adminChat || { chatbots: [], loading: false, error: null });

    useEffect(() => {
        dispatch(fetchChatbots());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="admin-chatbot-container">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải danh sách chatbot...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-chatbot-container">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Có lỗi xảy ra!</h4>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!chatbots || chatbots.length === 0) {
        return (
            <div className="admin-chatbot-container">
                <div className="alert alert-info" role="alert">
                    Chưa có chatbot nào được tạo.
                </div>
            </div>
        );
    }

    return (
        <div className="admin-chatbot-container">
            <h2 className="admin-chatbot-heading">Quản lý Chatbot</h2>
            <div className="row">
                {chatbots.map((chatbot) => (
                    <div key={chatbot.chatbot_id} className="col-12 mb-4">
                        <div className="admin-chatbot-card">
                            <div className="admin-chatbot-card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="admin-chatbot-title">{chatbot.name}</h4>
                                    <p className="admin-chatbot-text">{chatbot.description}</p>
                                </div>
                                <div className="admin-chatbot-toggle-container">
                                    <label className="admin-chatbot-toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={chatbot.is_active === 1}
                                            readOnly
                                        />
                                        <span className="admin-chatbot-toggle-slider"></span>
                                    </label>
                                    <span className={`admin-chatbot-status-label ${chatbot.is_active === 1 ? 'active' : ''}`}>
                                        {chatbot.is_active === 1 ? 'Đang hoạt động' : 'Không hoạt động'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatBotAdmin;