import React, { useState, useEffect, useRef } from 'react';
import '../../assets/admin/ChatbotAdmin.css';

const ChatBotAdmin = () => {
    const [message, setMessage] = useState('');
    const [activeContact, setActiveContact] = useState('Đinh Văn G');
    const [searchTerm, setSearchTerm] = useState('');
    const [showMessages, setShowMessages] = useState(window.innerWidth > 768); // Default to show messages on desktop, hide on mobile
    const [messages, setMessages] = useState([
        {
            id: 1, 
            sender: 'Đinh Văn G', 
            text: 'Xin chào, tôi muốn hỏi về đơn hàng DH12345 của mình. Tôi đã đặt từ hôm qua nhưng chưa nhận được phản hồi gì.',
            time: '12 phút trước',
            isAdmin: false
        },
        {
            id: 2,
            sender: 'Admin',
            text: 'Chào anh/chị, cảm ơn đã liên hệ với DH Mobile. Đơn hàng của anh/chị đang trong quá trình xử lý và dự kiến sẽ được giao trong 2-3 ngày tới.',
            time: '10 phút trước',
            isAdmin: true
        },
        {
            id: 3,
            sender: 'Đinh Văn G',
            text: 'Cảm ơn bạn. Vậy tôi có thể thay đổi địa chỉ giao hàng được không? Tôi muốn giao đến công ty thay vì nhà riêng.',
            time: '8 phút trước',
            isAdmin: false
        }
    ]);
    const [contacts, setContacts] = useState([
        {
            id: 1,
            name: 'Nguyễn Văn A',
            preview: 'Xin chào, bạn có đó không?',
            time: 'Vừa xong',
            avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-8.webp',
            unread: 1,
            active: false,
            online: true
        },
        {
            id: 2,
            name: 'Trần Thị B',
            preview: 'Tôi muốn hỏi về sản phẩm...',
            time: '5 phút trước',
            avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-1.webp',
            unread: 0,
            active: false,
            online: true
        },
        {
            id: 3,
            name: 'Lê Văn C',
            preview: 'Khi nào có hàng mới?',
            time: 'Hôm qua',
            avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-2.webp',
            unread: 0,
            active: false,
            online: false
        },
        {
            id: 4,
            name: 'Phạm Thị D',
            preview: 'Cảm ơn bạn rất nhiều.',
            time: 'Hôm qua',
            avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-3.webp',
            unread: 0,
            active: false,
            online: true
        },
        {
            id: 5,
            name: 'Hoàng Văn E',
            preview: 'Tôi cần trợ giúp gấp.',
            time: 'Hôm qua',
            avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-4.webp',
            unread: 0,
            active: false,
            online: false
        },
        {
            id: 6,
            name: 'Trương Thị F',
            preview: 'Đơn hàng của tôi thế nào rồi?',
            time: 'Hôm qua',
            avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-5.webp',
            unread: 0,
            active: false,
            online: true
        },
        {
            id: 7,
            name: 'Đinh Văn G',
            preview: 'Khi nào giao hàng vậy bạn?',
            time: '5 phút trước',
            avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-6.webp',
            unread: 0,
            active: true,
            online: true
        }
    ]);
    
    const messagesEndRef = useRef(null);
    
    useEffect(() => {
        // Handle window resize
        const handleResize = () => {
            setShowMessages(window.innerWidth > 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const handleMessageChange = (e) => {
        setMessage(e.target.value);
        e.target.style.height = '48px';
        e.target.style.height = e.target.scrollHeight + 'px';
    };
    
    const handleSendMessage = () => {
        if (message.trim() === '') return;
        
        const newMessage = {
            id: messages.length + 1,
            sender: 'Admin',
            text: message,
            time: 'Vừa xong',
            isAdmin: true
        };
        
        setMessages([...messages, newMessage]);
        
        // Cập nhật tin nhắn mới nhất trong danh sách liên hệ
        const updatedContacts = contacts.map(contact => {
            if (contact.name === activeContact) {
                return {
                    ...contact,
                    preview: `Admin: ${message.substring(0, 25)}${message.length > 25 ? '...' : ''}`
                };
            }
            return contact;
        });
        
        setContacts(updatedContacts);
        setMessage('');
        
        // Giả lập phản hồi tự động sau 1-2 giây
        setTimeout(() => {
            const autoReply = {
                id: messages.length + 2,
                sender: activeContact,
                text: getRandomReply(),
                time: 'Vừa xong',
                isAdmin: false
            };
            
            setMessages(prev => [...prev, autoReply]);
            
            // Cập nhật tin nhắn mới nhất
            const updatedContactsWithReply = contacts.map(contact => {
                if (contact.name === activeContact) {
                    return {
                        ...contact,
                        preview: autoReply.text.substring(0, 25) + (autoReply.text.length > 25 ? '...' : '')
                    };
                }
                return contact;
            });
            
            setContacts(updatedContactsWithReply);
            
        }, Math.random() * 1000 + 1000); // 1-2 giây delay
    };
    
    const getRandomReply = () => {
        const replies = [
            'Cảm ơn bạn đã hỗ trợ!',
            'Vâng, tôi đã hiểu rồi.',
            'Tôi sẽ đợi thông tin từ bạn.',
            'Bạn có thể tư vấn thêm về sản phẩm khác không?',
            'Tôi muốn biết thêm về chính sách đổi trả.',
            'Mình sẽ liên hệ lại sau nhé!'
        ];
        return replies[Math.floor(Math.random() * replies.length)];
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    const selectContact = (contactName) => {
        setActiveContact(contactName);
        
        // Show messages on mobile when a contact is selected
        setShowMessages(true);
        
        // Đánh dấu đã đọc
        const updatedContacts = contacts.map(contact => {
            if (contact.name === contactName) {
                return {
                    ...contact,
                    unread: 0,
                    active: true
                };
            }
            return {
                ...contact,
                active: false
            };
        });
        
        setContacts(updatedContacts);
        
        // Tải tin nhắn của người liên hệ được chọn (giả lập)
        if (contactName !== 'Đinh Văn G') {
            const newContactMessages = [
                {
                    id: 1,
                    sender: contactName,
                    text: `Xin chào Admin, tôi là ${contactName}. Tôi cần hỗ trợ về sản phẩm của DH Mobile.`,
                    time: '15 phút trước',
                    isAdmin: false
                },
                {
                    id: 2,
                    sender: 'Admin',
                    text: `Chào ${contactName}, tôi có thể giúp gì cho bạn?`,
                    time: '13 phút trước',
                    isAdmin: true
                },
                {
                    id: 3,
                    sender: contactName,
                    text: 'Tôi muốn biết thêm thông tin về iPhone 15 và các chương trình khuyến mãi hiện tại.',
                    time: '10 phút trước',
                    isAdmin: false
                }
            ];
            setMessages(newContactMessages);
        } else {
            // Nếu quay lại Đinh Văn G thì hiển thị tin nhắn ban đầu
            setMessages([
                {
                    id: 1, 
                    sender: 'Đinh Văn G', 
                    text: 'Xin chào, tôi muốn hỏi về đơn hàng DH12345 của mình. Tôi đã đặt từ hôm qua nhưng chưa nhận được phản hồi gì.',
                    time: '12 phút trước',
                    isAdmin: false
                },
                {
                    id: 2,
                    sender: 'Admin',
                    text: 'Chào anh/chị, cảm ơn đã liên hệ với DH Mobile. Đơn hàng của anh/chị đang trong quá trình xử lý và dự kiến sẽ được giao trong 2-3 ngày tới.',
                    time: '10 phút trước',
                    isAdmin: true
                },
                {
                    id: 3,
                    sender: 'Đinh Văn G',
                    text: 'Cảm ơn bạn. Vậy tôi có thể thay đổi địa chỉ giao hàng được không? Tôi muốn giao đến công ty thay vì nhà riêng.',
                    time: '8 phút trước',
                    isAdmin: false
                }
            ]);
        }
    };
    
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    
    // Lọc danh sách liên hệ theo từ khóa tìm kiếm
    const filteredContacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.preview.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Lấy thông tin người dùng đang chat
    const activeContactInfo = contacts.find(contact => contact.name === activeContact);
    
    // Function to go back to contact list on mobile
    const goBackToContacts = () => {
        setShowMessages(false);
    };
    
    return(
       <section className="admin_chatbot-container">
  <div className="container py-5">
    <div className="row">
      <div className={`col-md-6 col-lg-5 col-xl-4 mb-4 mb-md-0 ${showMessages ? 'd-none d-md-block' : ''}`}>
        <div className="admin_chatbot-search-container">
          <div className="admin_chatbot-search-input">
            <i className="bi bi-search" style={{ color: '#0071e3' }}></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm liên hệ..." 
              value={searchTerm}
              onChange={handleSearch}
              className="admin_chatbot-search"
            />
          </div>
        </div>
        <div className="admin_chatbot-contacts">
          {filteredContacts.map((contact) => (
            <div 
              key={contact.id}
              className={`admin_chatbot-contact-item ${contact.active ? 'admin_chatbot-contact-active' : ''}`}
              onClick={() => selectContact(contact.name)}
            >
              <div className="d-flex flex-row">
                <div className="admin_chatbot-avatar-container">
                  <img src={contact.avatar} alt="avatar" className="admin_chatbot-avatar me-3" />
                  {contact.online && <span className="admin_chatbot-online-indicator"></span>}
                </div>
                <div className="admin_chatbot-contact-info">
                  <p className="admin_chatbot-contact-name">{contact.name}</p>
                  <p className="admin_chatbot-contact-preview">{contact.preview}</p>
                </div>
              </div>
              <div className="pt-1">
                <p className="admin_chatbot-timestamp">{contact.time}</p>
                {contact.unread > 0 && (
                  <span className="admin_chatbot-badge">{contact.unread}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={`col-md-6 col-lg-7 col-xl-8 ${!showMessages ? 'd-none d-md-block' : ''}`}>
        <div className="admin_chatbot-header-info">
          {activeContactInfo && (
            <>
              <div className="d-flex align-items-center">
                {/* Back button for mobile */}
                <button 
                  className="admin_chatbot-back-btn d-md-none" 
                  onClick={goBackToContacts}
                >
                  <i className="bi bi-arrow-left" style={{ color: '#0071e3' }}></i>
                </button>
                <div className="admin_chatbot-avatar-container">
                  <img src={activeContactInfo.avatar} alt="avatar" className="admin_chatbot-avatar me-3" />
                  {activeContactInfo.online && <span className="admin_chatbot-online-indicator"></span>}
                </div>
                <div>
                  <h5 className="admin_chatbot-active-name mb-0">{activeContactInfo.name}</h5>
                  <p className="admin_chatbot-status">
                    {activeContactInfo.online ? "Đang trực tuyến" : "Ngoại tuyến"}
                  </p>
                </div>
              </div>
              <div className="admin_chatbot-actions">
                <button className="admin_chatbot-action-btn">
                  <i className="bi bi-telephone" style={{ color: '#5ac8fa' }}></i>
                </button>
                <button className="admin_chatbot-action-btn">
                  <i className="bi bi-camera-video" style={{ color: '#5ac8fa' }}></i>
                </button>
                <button className="admin_chatbot-action-btn">
                  <i className="bi bi-info-circle" style={{ color: '#5ac8fa' }}></i>
                </button>
              </div>
            </>
          )}
        </div>
        <div className="admin_chatbot-messages">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`admin_chatbot-message-item ${msg.isAdmin ? 'admin_chatbot-message-sent' : 'admin_chatbot-message-received'}`}
            >
              {!msg.isAdmin && (
                <img src={contacts.find(c => c.name === msg.sender)?.avatar || 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-6.webp'} 
                     alt="avatar" 
                     className="admin_chatbot-avatar me-3" />
              )}
              <div className="admin_chatbot-message-bubble">
                <div className="admin_chatbot-message-header">
                  <p className="admin_chatbot-message-sender">{msg.sender}</p>
                  <p className="admin_chatbot-message-time">{msg.time}</p>
                </div>
                <div className="admin_chatbot-message-body">
                  <p className="admin_chatbot-message-text">
                    {msg.text}
                  </p>
                </div>
              </div>
              {msg.isAdmin && (
                <img src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-5.webp" 
                     alt="avatar" 
                     className="admin_chatbot-avatar ms-3" />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="admin_chatbot-input-container">
          <textarea 
            className="admin_chatbot-textarea" 
            rows={1} 
            placeholder="Nhập tin nhắn của bạn..." 
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
          ></textarea>
          <button 
            type="button" 
            className="admin_chatbot-send-btn"
            onClick={handleSendMessage}
          >
            <i className="bi bi-send-fill" style={{ color: '#ffffff' }}></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
    )
}

export default ChatBotAdmin;