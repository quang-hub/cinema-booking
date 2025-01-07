import React from "react";
import { useNavigate } from "react-router-dom";

const Error404 = () => {
    const navigate = useNavigate()
    const gotToHomePage=()=>{
        navigate("/login");
      }
    return (
        <div className="flex items-center flex-col justify-center lg:flex-row py-28 px-6 md:px-24 md:py-20 lg:py-32 gap-16 lg:gap-28">
            <div className="w-full lg:w-1/2">
                <img className="hidden lg:block" src="https://cdn.dribbble.com/userupload/8726278/file/original-ab1bde6f9c74de5c8961f7fe84990cd4.gif" alt="" />
                <img className="hidden md:block lg:hidden" src="https://i.ibb.co/c1ggfn2/Group-193.png" alt="" />
                <img className="md:hidden" src="https://i.ibb.co/8gTVH2Y/Group-198.png" alt="" />
            </div>
            <div className="w-full lg:w-1/2">
                <h1 className="py-4 text-3xl lg:text-4xl font-extrabold text-gray-800">Trang không tồn tại !</h1>
                <p className="py-4 text-base text-gray-800">Nội dung bạn đang tìm kiếm không tồn tại. Hoặc là nó đã bị xóa, hoặc bạn đã nhập sai liên kết.</p>
                <p className="py-2 text-base text-gray-800">Rất tiếc về điều đó! Vui lòng truy cập trang chủ của chúng tôi để đến nơi bạn cần đến.</p>
                <button onClick={() => gotToHomePage()} className="w-full lg:w-auto my-4 border rounded-md px-1 sm:px-16 py-5 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-opacity-50">Về trang chủ</button>
            </div>
        </div>
    );
};

export default Error404;
