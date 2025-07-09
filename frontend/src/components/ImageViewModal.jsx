import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { FaSearchPlus, FaSearchMinus, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../assets/css/imageViewModal.css";

const ImageViewModal = ({ show, handleClose, images, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.3, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.3, 1));
    if (zoomLevel <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetZoom();
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetZoom();
    }
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleModalClose = () => {
    resetZoom();
    handleClose();
  };

  if (!images || images.length === 0) return null;

  return (
    <Modal 
      show={show} 
      onHide={handleModalClose} 
      centered 
      size="xl" 
      className="image-view-modal"
      backdrop="static"
    >
      <Modal.Header className="d-flex justify-content-between align-items-center border-0">
        <div className="d-flex align-items-center">
          <span className="image-counter">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button 
            className="zoom-btn" 
            onClick={zoomOut}
            disabled={zoomLevel <= 1}
          >
            <FaSearchMinus />
          </button>
          <button 
            className="zoom-btn" 
            onClick={zoomIn}
            disabled={zoomLevel >= 3}
          >
            <FaSearchPlus />
          </button>
          <button className="close-btn" onClick={handleModalClose}>
            <FaTimes />
          </button>
        </div>
      </Modal.Header>
      
      <Modal.Body className="p-0 d-flex flex-column" style={{height: 'calc(95vh - 60px)', background: '#000'}}>
        <div className="image-container">
          {images.length > 1 && currentIndex > 0 && (
            <button className="nav-btn nav-btn-prev" onClick={prevImage}>
              <FaChevronLeft />
            </button>
          )}
          
          <div 
            className="image-wrapper"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={images[currentIndex]}
              alt={`Review image ${currentIndex + 1}`}
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                transition: isDragging ? 'none' : 'transform 0.2s ease'
              }}
              onDoubleClick={() => zoomLevel === 1 ? zoomIn() : resetZoom()}
              draggable={false}
            />
          </div>
          
          {images.length > 1 && currentIndex < images.length - 1 && (
            <button className="nav-btn nav-btn-next" onClick={nextImage}>
              <FaChevronRight />
            </button>
          )}
        </div>
        
        {images.length > 1 && (
          <div className="thumbnail-strip">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentIndex(index);
                  resetZoom();
                }}
              />
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ImageViewModal;
