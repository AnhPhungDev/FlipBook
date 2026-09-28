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
  const [inputPage, setInputPage]     = useState('');
  const [isEditing, setIsEditing]     = useState(false);

  const isButtonFlip = useRef(false);

  // File pages: WorkbookTopic1 (bìa), WorkbookPage2 → WorkbookPage33
  // Flipbook children index: 0=bìa, 1=Page2, 2=Page3, ..., 32=Page33
  // onFlip.data trả về index trang TRÁI của spread đang hiển thị
  // Spread: (1,2), (3,4), (5,6), ... → mỗi lần nhảy 2

  const LAST_PAGE = 33;  // Số trang cuối cùng (WorkbookPage33)

  // Số trang trái & phải đang hiển thị (số in trên file)
  const leftFileNum  = currentPage === 0 ? null : currentPage + 1;          // index→fileNum: +1
  const rightFileNum = currentPage === 0 ? null : Math.min(currentPage + 2, LAST_PAGE);

  const displayPage = currentPage === 0
    ? 'Bìa'
    : leftFileNum === rightFileNum
      ? `${leftFileNum} / ${LAST_PAGE}`
      : `${leftFileNum} – ${rightFileNum} / ${LAST_PAGE}`;

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

  const debounceTimer = useRef(null);

  // Tự động lật trang khi nhập — debounce 400ms
  const onPageInputChange = (e) => {
    const val = e.target.value;
    setInputPage(val);

    // Xóa timer cũ
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 2 && num <= LAST_PAGE) {
      debounceTimer.current = setTimeout(() => {
        isButtonFlip.current = true;
        playFlipSound();
        bookRef.current?.pageFlip().flip(num - 1);
        setIsEditing(false);
        setInputPage('');
      }, 400);
    }
  };

  const onPageInputKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setIsEditing(false);
      setInputPage('');
    }
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

      {/* 2 nút điều hướng + số trang ở giữa */}
      <div className="flip-controls">
        <button className="flip-btn" onClick={prevPage}>
          <i className="ri-corner-up-left-fill"></i>
        </button>

        {/* Page indicator — click để nhập số trang */}
        {isEditing ? (
          <input
            className="page-input"
            type="number"
            min={2}
            max={LAST_PAGE}
            value={inputPage}
            autoFocus
            onChange={onPageInputChange}
            onKeyDown={onPageInputKeyDown}
            placeholder={currentPage === 0 ? '—' : String(currentPage + 1)}
          />
        ) : (
          <button
            className="page-indicator"
            onClick={() => { setIsEditing(true); setInputPage(''); }}
            title="Nhấn để nhập số trang"
          >
            {displayPage}
          </button>
        )}

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