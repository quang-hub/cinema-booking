// AreaListPanel.js
import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Notification from '../../components/Notification';
import ContractModal from './ContractModal';
import Axios from '../../components/Axios';
import Loader from '../../components/Loading';
import CloseIcon from '@mui/icons-material/Close';

const AreaListPanel = ({ parkCode, areas, isOpen, togglePanel }) => {

    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [selectedAreaId, setSelectedAreaId] = useState(null);
    const [listArea, setListArea] = useState(areas);
    const [isLoading, setIsLoading] = useState(false);

    const handldMoveToArea = (hotspot, areaId) => {
        if (!hotspot.hotspotName) {
            Notification("Chưa được gắn vào vr360", "WARNING");
            return;
        }
        const krpano = document.getElementById("krpanoSWFObject");
        krpano.call(`loadscene(${hotspot.sceneName});`);

        let ath = (krpano.get(`hotspot[${hotspot.hotspotName}].point[0].ath`));
        let atv = (krpano.get(`hotspot[${hotspot.hotspotName}].point[0].atv`));
        if (ath === null) {
            ath = krpano.get(`hotspot[${hotspot.hotspotName}].ath`);
            atv = krpano.get(`hotspot[${hotspot.hotspotName}].atv`);
        }

        // Log the values to ensure they are retrieved correctly
        console.log(`ATH: ${ath}, ATV: ${atv}`);

        krpano.call(`lookat(${ath}, ${atv});`);
        krpano.call("zoomto(60,'shortestway');");
        setSelectedAreaId(areaId);
    }

    const handleViewContract = async (contract) => {
        if (!contract.code) {
            Notification("Chưa có hợp đồng", "WARNING");
            return;
        }

        console.log(contract);
        await fetchDataDetailContract(contract);
        setIsContractModalOpen(true);
    }

    const handleSearchArea = async (name) => {
        setIsLoading(true);
        await fetchDataArea(name);
        setIsLoading(false);
    }

    const fetchDataArea = async (name) => {
        try {
            const url = `/area/search-area-marked/${parkCode}?name=${name}`;
            const response = await Axios.get(url, {
                headers: {
                    'accept': '*/*',
                }
            });
            const responseData = (response.data);
            setListArea(responseData.data);
        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    }

    const fetchDataDetailContract = async (contract) => {
        try {

            const url = `/contract/get-detail/${contract.code}`;
            const response = await Axios.get(url, {
                headers: {
                    'accept': '*/*',
                }
            });
            console.log(response.data.data);

            setSelectedContract(response.data.data);
        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    }

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: 300 }} // Start from the right (offscreen)
                        animate={{ x: 0 }} // Move to its position
                        exit={{ x: 300 }} // Exit to the right
                        transition={{ duration: 0.3 }} // Smooth transition
                        className="fixed top-0 right-0 w-1/3 bg-white shadow-lg rounded-xl z-[993] m-20 h-fit max-h-[80vh] p-4 overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Danh sách các khu đất</h3>
                            <button
                                onClick={togglePanel}
                                className="text-blue-600 hover:underline"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="relative w-full mb-4">
                            <input
                                type="text"
                                onChange={(e) => handleSearchArea(e.target.value)}
                                placeholder="Tìm kiếm..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <svg
                                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.293 16.293a8 8 0 111.414-1.414l4.243 4.243a1 1 0 01-1.414 1.414l-4.243-4.243zm-6.586 0a6 6 0 100-12 6 6 0 000 12z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        {isLoading ? (
                            <Loader />
                        ) : (
                            <>
                                {listArea?.length > 0 ? (
                                    listArea.map((area) => (
                                        <div
                                            key={area.id}
                                            className={`p-2 mb-2 border rounded ${selectedAreaId === area.id ? 'bg-blue-100' : ''
                                                }`}
                                        >
                                            <h4 className="font-semibold">Tên: {area.name}</h4>
                                            <p>Diện tích: {area.square} (hec-ta)</p>
                                            <p>Mô tả: {area.description}</p>
                                            <p>
                                                Trạng thái:{" "}
                                                <span>
                                                    {area.state === "IDLE" ? "Chưa cho thuê" : "Đã cho thuê"}
                                                </span>
                                            </p>
                                            <p
                                                className={
                                                    area.marked
                                                        ? "cursor-pointer text-green-500"
                                                        : "cursor-not-allowed text-red-600"
                                                }
                                                onClick={() => handldMoveToArea(area.hotspot, area.id)}
                                            >
                                                Di chuyển đến khu đất
                                            </p>
                                            {area.state === "LEASED" ? (
                                                <p>
                                                    Hợp đồng hiện tại:{" "}
                                                    <VisibilityIcon
                                                        className="cursor-pointer"
                                                        onClick={() => handleViewContract(area.contract)}
                                                    />
                                                </p>
                                            ) : null}
                                        </div>
                                    ))
                                ) : (
                                    <p>Hiện tại chưa có khu đất nào.</p>
                                )}
                            </>
                        )}


                    </motion.div>
                )}
            </AnimatePresence>


            <ContractModal
                open={isContractModalOpen}
                onClose={() => setIsContractModalOpen(false)}
                contract={selectedContract}
            />
        </>
    )
};

export default AreaListPanel;
