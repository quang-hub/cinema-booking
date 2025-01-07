import React from "react";

const GuidePopup = ({ isOpen, closePopup }) => {
  if (!isOpen) return null; // Nếu popup không mở thì không render gì cả

  return (
    <div
      onClick={closePopup} // Đóng popup khi nhấn ngoài popup
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()} // Ngừng sự kiện khi nhấn vào popup, không đóng popup
        className="relative bg-white p-8 rounded-lg shadow-lg w-96 mt-64" // Đặt vị trí `relative` để dễ dàng định vị nút đóng
      >
        {/* Nút "X" đóng popup */}
        <button
          onClick={closePopup}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-xl font-semibold">Hướng Dẫn</h2>
    
        <p className="mt-4">
          {" "}
          1. Nhấp và giữ vào hình ảnh, sau đó kéo về hướng xem mong muốn.
        </p>
        <p className="mt-4">
          {" "}
           2. Di
          con trỏ chuột qua các điểm được đánh dấu để xem trước thông tin về các
          vị trí khác nhau, nhấp để điều hướng đến địa điểm tương ứng.
        </p>{" "}
        <p className="mt-4">
          {" "}
            3. Sử dụng
          thanh menu ở phía dưới để khám phá các tính năng khác.
        </p>
      </div>
    </div>
  );
};

export default GuidePopup;
