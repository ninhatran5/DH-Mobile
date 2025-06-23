import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatbots, toggleChatbot } from '../../slices/AdminChatSlice';
import { toast } from 'react-toastify';
import '../../assets/admin/ChatbotAdmin.css';

const ChatBotAdmin = () => {
    const dispatch = useDispatch();
    const { 
        chatbots, 
        loading, 
        error,
        toggleLoading,
        toggleError 
    } = useSelector((state) => state.adminChat || { 
        chatbots: [], 
        loading: false, 
        error: null,
        toggleLoading: false,
        toggleError: null 
    });

    useEffect(() => {
        dispatch(fetchChatbots())
            .unwrap()
            .catch((err) => {
                toast.error(err || 'Có lỗi xảy ra khi tải danh sách chatbot');
            });
    }, [dispatch]);

    const handleToggle = async (chatbot) => {
        if (!toggleLoading) {
            try {
                await dispatch(toggleChatbot(chatbot.chatbot_id)).unwrap();
                toast.success(`${chatbot.name} đã được ${chatbot.is_active === 1 ? 'tắt' : 'bật'} thành công`);
            } catch (err) {
                toast.error(err || 'Có lỗi xảy ra khi thay đổi trạng thái chatbot');
            }
        }
    };

    if (loading) {
        return (
            <div className="admin-chatbot-container">
                <div className="admin-chatbot-text-center">
                    <div className="admin-chatbot-spinner admin-chatbot-text-primary" role="status">
                        <span className="admin-chatbot-visually-hidden">Đang tải...</span>
                    </div>
                    <p className="admin-chatbot-mt-2">Đang tải danh sách chatbot...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-chatbot-container">
                <div className="admin-chatbot-alert admin-chatbot-alert-danger" role="alert">
                    <h4 className="admin-chatbot-alert-heading">Có lỗi xảy ra!</h4>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!chatbots || chatbots.length === 0) {
        return (
            <div className="admin-chatbot-container">
                <div className="admin-chatbot-alert admin-chatbot-alert-info" role="alert">
                    Chưa có chatbot nào được tạo.
                </div>
            </div>
        );
    }

    return (
        <div className="admin-chatbot-container">
            <h2 className="admin-chatbot-heading">Quản lý Chatbot</h2>
            {toggleError && (
                <div className="admin-chatbot-alert admin-chatbot-alert-danger mb-4" role="alert">
                    {toggleError}
                </div>
            )}
            <div className="admin-chatbot-row">
                {chatbots.map((chatbot) => (
                    <div key={chatbot.chatbot_id} className="admin-chatbot-col-12 admin-chatbot-mb-4">
                        <div className="admin-chatbot-card">
                            <div className="admin-chatbot-card-body admin-chatbot-d-flex admin-chatbot-justify-content-between admin-chatbot-align-items-center">
                                <div>
                                    <h4 className="admin-chatbot-title">{chatbot.name}</h4>
                                    <p className="admin-chatbot-text">{chatbot.description}</p>
                                </div>
                                <div className="admin-chatbot-toggle-container">
                                    <label className="admin-chatbot-toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={chatbot.is_active === 1}
                                            onChange={() => handleToggle(chatbot)}
                                            disabled={toggleLoading}
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