import React, { useRef, useState, useEffect } from 'react'
import HTMLFlipBook from "react-pageflip";

// Trang 2 -> 33 (32 trang nội dung)
const pages = Array.from({ length: 32 }, (_, i) => i + 2);

// Lấy URL ảnh theo page index của flipbook
// index 0 = bìa, index 1 = WorkbookPage2, index 2 = WorkbookPage3, ...
const getImageUrl = (idx) => {
  if (idx === 0) return '/WorkbookTopic1.png';
  return `/WorkbookPage${idx + 1}.png`;
};

function Book() {
  const bookRef   = useRef(null);
  const audioRef  = useRef(new Audio('/858467__ym_the_cosmic__flipping-page-back.mp3'));
  const [isZoomed, setIsZoomed]       = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const isButtonFlip = useRef(false);

  const playFlipSound = () => {
    const audio = audioRef.current;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  // Nhấn nút: đánh dấu là button flip để onChangeState không phát âm thanh lần nữa
  const prevPage = () => {
    isButtonFlip.current = true;
    playFlipSound();
    bookRef.current?.pageFlip().flipPrev();
  };
  const nextPage = () => {
    isButtonFlip.current = true;
    playFlipSound();
    bookRef.current?.pageFlip().flipNext();
  };

  // Track trang hiện tại sau khi lật xong
  const onFlip = (e) => setCurrentPage(e.data);

  // Drag chuột: 'user_fold' = thời điểm bắt đầu kéo trang
  // Bỏ qua nếu là button flip (đã phát sound rồi)
  const onChangeState = (e) => {
    if (e.data === 'user_fold') {
      if (!isButtonFlip.current) {
        playFlipSound();
      }
      isButtonFlip.current = false;
    }
  };

  // Đóng modal bằng phím Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setIsZoomed(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Tính ảnh hiển thị trong zoom modal
  const isCover  = currentPage === 0;
  const leftImg  = getImageUrl(currentPage);
  const rightImg = !isCover && currentPage + 1 <= 32 ? getImageUrl(currentPage + 1) : null;

  return (
    <>
      {/* Nút zoom — cố định góc trên bên phải */}
      <button className="zoom-fab" onClick={() => setIsZoomed(true)} title="Phóng to">
        <i className="ri-zoom-in-line"></i>
      </button>

      <HTMLFlipBook
        ref={bookRef}
        width={460}
        height={651}
        maxShadowOpacity={0.5}
        drawShadow={true}
        showCover={true}
        size='fixed'
        onFlip={onFlip}
        onChangeState={onChangeState}
      >
        {/* Bìa trước */}
        <div className="page" style={{ background: 'transparent' }}>
          <div className="page-image cover">
            <img
              src="/WorkbookTopic1.png"
              alt="Workbook Topic 1 Cover"
              className="cover-image"
            />
          </div>
        </div>

        {/* Các trang nội dung */}
        {pages.map((pageNum) => (
          <div className="page" key={pageNum}>
            <div className="page-image">
              <img
                src={`/WorkbookPage${pageNum}.png`}
                alt={`Trang ${pageNum}`}
                className="cover-image"
              />
            </div>
          </div>
        ))}
      </HTMLFlipBook>

      {/* 2 nút điều hướng bên dưới sách */}
      <div className="flip-controls">
        <button className="flip-btn" onClick={prevPage}>
          <i className="ri-corner-up-left-fill"></i>
        </button>
        <button className="flip-btn" onClick={nextPage}>
          <i className="ri-corner-up-right-fill"></i>
        </button>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="zoom-overlay" onClick={() => setIsZoomed(false)}>
          {/* Nút đóng */}
          <button className="zoom-close" onClick={() => setIsZoomed(false)}>
            <i className="ri-close-line"></i>
          </button>

          {/* Nội dung ảnh — stopPropagation để không đóng khi click vào ảnh */}
          <div
            className={`zoom-content ${isCover ? 'zoom-single' : 'zoom-spread'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={leftImg} alt="Trang trái" className="zoom-page" />
            {rightImg && (
              <img src={rightImg} alt="Trang phải" className="zoom-page" />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Book