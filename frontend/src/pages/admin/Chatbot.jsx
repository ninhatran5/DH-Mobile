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
            <div className="container py-5">
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
            <div className="container py-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Có lỗi xảy ra!</h4>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!chatbots || chatbots.length === 0) {
        return (
            <div className="container py-5">
                <div className="alert alert-info" role="alert">
                    Chưa có chatbot nào được tạo.
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Quản lý Chatbot</h2>
            </div>

            <div className="row">
                {chatbots.map((chatbot) => (
                    <div key={chatbot.chatbot_id} className="col-12 mb-4">
                        <div className="card">
                            <div className="card-body d-flex justify-content-between align-items-start">
                                <div>
                                    <h4 className="card-title mb-3">{chatbot.name}</h4>
                                    <p className="card-text text-muted mb-3">{chatbot.description}</p>
                                    <span 
                                        className={`badge ${chatbot.is_active === 1 ? 'bg-success' : 'bg-secondary'}`}
                                    >
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