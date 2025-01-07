import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Axios from '../../components/Axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TablePagination
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import QuillViewer from '../industrialPark/QuillViewer';
import UpdateBackUpDetailTable from '../industrialPark/UpdateBackupDetail';

const KcnInfoModal = ({ open, onClose, kcnData }) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [historyData, setHistoryData] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(3);
    const [totalPage, setTotalPage] = useState(0);
    const [selectedItem, setSelectedItem] = useState();
    const [openDialog, setOpenDialog] = useState(false);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleClickOpenVr360 = (value) => {
        // sessionStorage.setItem('tourData', xmlPath);
        // const url = `/backupScene`;
        // window.open(url, '_blank');

        setSelectedItem(value);
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedItem(null);
    };
    const handleChangeRowsPerPage = (event) => {
        setSize(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        if (activeTab === "history") {
            fetchHistoryData();
        }
    }, [activeTab, page, size]);

    const fetchHistoryData = async () => {
        try {
            const url = `/vtour/get-all-backup-tour?industrialParkCode=${kcnData.code}&page=${page + 1}&size=${size}`;

            const response = await Axios.get(url, {
                headers: {
                    'accept': '*/*'
                }
            });

            const responseData = response.data;
            console.log(responseData);
            setHistoryData(responseData.data.data);
            setTotalPage(responseData.data.totalElements);
        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    };

    if (!open || !kcnData) return null;

    return (<>
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[99]"
            >
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative overflow-y-auto max-h-[80vh]">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                    <h2 className="text-2xl font-semibold mb-4">Thông tin về khu công nghiệp</h2>

                    {/* Tab Navigation */}
                    <div className="flex space-x-4 border-b mb-4">
                        <button
                            className={`pb-2 ${activeTab === 'basic' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                            onClick={() => setActiveTab('basic')}
                        >
                            Thông tin cơ bản
                        </button>
                        <button
                            className={`pb-2 ${activeTab === 'attachment' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                            onClick={() => setActiveTab('attachment')}
                        >
                            Tệp đính kèm
                        </button>
                        <button
                            className={`pb-2 ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            Lịch sử thay đổi
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content-container h-full">
                        {activeTab === 'basic' && (
                            <div>
                                <h3 className="text-xl font-bold">Thông tin cơ bản</h3>
                                <p>Tên: {kcnData.name}</p>
                                <p>Diện tích: {kcnData.square} (hec-ta)</p>

                                Mô tả: <QuillViewer htmlContent={kcnData.description} />
                            </div>
                        )}
                        {activeTab === 'attachment' && (
                            <div>
                                <h3 className="text-xl font-bold">Tệp đính kèm</h3>
                                <ul>
                                    {kcnData.attachmentFiles?.map((file, index) => (
                                        <li key={index}>
                                            <AttachFileIcon />
                                            <a href={file.path} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                {file.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                                {kcnData.attachmentFiles.length === 0 && <div>Chưa có tệp dính kèm nào...</div>}
                            </div>
                        )}
                        {activeTab === "history" && (
                            <div>
                                <h3 className="text-xl font-bold">Lịch sử thay đổi của khu công nghiệp</h3>
                                {historyData.length > 0 ? (
                                    <>
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Ảnh đã thay đổi</TableCell>
                                                        <TableCell>Xem chi tiết</TableCell>
                                                        <TableCell>Ngày sửa cuối</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {historyData.map((row, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <img
                                                                    src={row.newScene}
                                                                    alt="Chưa có ảnh"
                                                                    style={{
                                                                        maxHeight: '100px',
                                                                        maxWidth: '100%',
                                                                        border: '2px solid lightgray',
                                                                        borderRadius: '8px',
                                                                    }} />
                                                            </TableCell>
                                                            <TableCell><Visibility onClick={() => handleClickOpenVr360(row.newSceneName)} /></TableCell>
                                                            <TableCell>{new Date(row.createdAt).toLocaleDateString("vi-VN", { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            <TablePagination
                                                rowsPerPageOptions={[3, 5, 10]}
                                                component="div"
                                                count={totalPage}
                                                rowsPerPage={size}
                                                page={page}
                                                onPageChange={handleChangePage}
                                                onRowsPerPageChange={handleChangeRowsPerPage}
                                            />
                                        </TableContainer>
                                    </>
                                ) : (
                                    <p>Chưa có thay đổi nào xảy ra...</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
        {openDialog &&
            <UpdateBackUpDetailTable handleClose={handleCloseDialog} selectedItem={selectedItem} />
        }
    </>
    );
};

export default KcnInfoModal;
