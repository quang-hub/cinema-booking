//home
import React, { useEffect, useState } from "react";
import { Panos } from "./Panos";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Axios from "../../components/Axios";
import { motion, AnimatePresence } from "framer-motion";
import KcnInfoModal from "./KcnInfoModal";
import AreaListPanel from "./AreaListPanel";
import GuidePopup from "./Guide";

const Home = () => {
  let token = localStorage.getItem("authToken") || "";
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State để điều khiển popup

  const openPopup = () => setIsPopupOpen(true);  // Mở popup
  const closePopup = () => setIsPopupOpen(false); // Đóng popup

  const [isVideoPlaying, setIsVideoPlaying] = useState(false); // Điều khiển video hiển thị
  const toggleVideo = () => setIsVideoPlaying(!isVideoPlaying);

  const navigate = useNavigate();
  const location = useLocation();


  // Get the code from URL search params
  const queryParams = new URLSearchParams(location.search);
  const codeFromParams = queryParams.get("code");
  const codeFromState = location.state ? location.state.code : null;

  const hotspot = location.state ? location.state.hotspot || "" : null;

  // Default to "KCN-100" if no code is provided
  const initialCode = codeFromParams || codeFromState || "";


  // Local state to hold the code
  const [code, setCode] = useState(initialCode);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [listKcn, setListKcn] = useState([]);
  const [kcnData, setkcnData] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAreaPanelOpen, setIsAreaPanelOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  const [kcnName, setKcnName] = useState("");


  useEffect(() => {

    const fetchData = async () => {
      try {
        const url = `/industrial-park/get-all-has-tour`;
        const response = await Axios.get(url, {
          headers: {
            accept: "*/*",
          },
        });
        const responseData = response.data;
        setListKcn(responseData.data);
        setKcnName(responseData.data.find(s => s.code === code)?.name || response.data.data[0].name || "");
        if (code === "") {
          setCode(response.data.data[0].code);
        }
        console.log(kcnName);


      } catch (error) {
        console.error("Error fetching scenes:", error);
      }
    };

    fetchData();
  }, []);
  const handleChangeXml = (item) => {
    setCode(item.code);
    setIsDropdownOpen(false);
    // Update the URL with the new code
    const newUrl = `/home?code=${item.code}&name=${item.name}`;
    navigate(newUrl);

    // Reload the page to reflect changes
    window.location.reload(); // This forces a full page reload
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const toggleAreaPanel = () => setIsAreaPanelOpen(!isAreaPanelOpen);



  useEffect(() => {
    fetchDataDetailIP(code);
  }, [code]);

  const fetchDataDetailIP = async (code) => {
    try {
      const url = `/industrial-park/get-detail/${code}`;
      const response = await Axios.get(url, {
        headers: {
          accept: "*/*",
        },
      });
      const responseData = response.data;
      console.log(responseData);

      // console.log(getUserCode());

      setCurrentUser(responseData.data.userCode);

      setkcnData(responseData.data);
    } catch (error) {
      console.error("Error fetching scenes:", error);
    }
  };



  return (
    <div className="vr360 h-full">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 transform -translate-x-1/2 w-full h-16 z-[95] bg-white/30 text-black font-medium py-2 px-6 backdrop-blur-lg shadow-lg rounded-b-2xl flex items-center justify-between space-x-6 border border-gray-400"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-lg hover:text-blue-700 transition-colors"
        >
          <a href="/industrial-park" className="flex items-center space-x-2">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>Quản lý KCN/CCN</span>
          </a>
        </motion.div>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-400 transition-all duration-300"
          >
            <span className="text-gray-700">{kcnName}</span>
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
              >
                {listKcn.map((item) => (
                  <motion.div
                    key={item.code}
                    whileHover={{ backgroundColor: "#f3f4f6" }}
                    onClick={() => handleChangeXml(item)}
                    className={`px-4 py-3 cursor-pointer transition-colors ${item.code === code
                      ? "bg-sky-200"
                      : "text-gray-700 hover:text-blue-600"
                      }`}
                  >
                    {item.name}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-lg hover:text-blue-600 transition-colors"
        >
          <a onClick={handleOpenModal} className="flex items-center space-x-2">
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
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
            <span>Thông tin</span>
          </a>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-lg hover:text-blue-600 transition-colors"
        >
          <a onClick={openPopup} className="flex items-center space-x-2">
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
                d="M4 4h16v16H4V4zm0 0l8 5 8-5"
              />
            </svg>
            <span>Hướng dẫn</span>
          </a>

        </motion.div>
        <GuidePopup isOpen={isPopupOpen} closePopup={closePopup} />

        {token === "" && (
          <motion.div whileHover={{ scale: 1.05 }} className="text-lg">
            <a
              href="/login"
              className="flex items-center space-x-2 text-blue-600"
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span>Đăng nhập</span>
            </a>
          </motion.div>
        )}
        <button
          onClick={toggleAreaPanel}
          className="fixed top-20 right-4 bg-white px-4 py-2 rounded-lg shadow-md border text-lg hover:text-blue-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m-6 6h12M9 11v2m-6 6h12M9 17v2"
            />
          </svg>
          {/* <span>Danh sách khu đất</span> */}
        </button>
      </motion.div>
      {/* <TransparentVideo videoSrc="http://localhost:8081/tour-direc/video.mp4" /> */}


      {isAreaPanelOpen && (
        <AreaListPanel
          areas={kcnData.areas}
          isOpen={isAreaPanelOpen}
          togglePanel={toggleAreaPanel}
          parkCode={code}
        />
      )}

      {/* Industrial Park Info Modal */}
      <KcnInfoModal
        open={isModalOpen}
        onClose={handleCloseModal}
        kcnData={kcnData}
      />

      {code !== "" && <Panos code={code} hotspot={hotspot} currentUser={currentUser} />}
    </div>
  );
};

export default Home;
