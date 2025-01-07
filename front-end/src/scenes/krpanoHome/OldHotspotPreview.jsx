import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, TextField } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info'; // Importing the info icon
import { Box } from "@mui/material";
import Axios from "../../components/Axios";
import Notification from "../../components/Notification";
import showAlertDialog from "../../components/ShowAlertDialog"; // Import AlertDialog

const OldHotspotPreview = ({ parkCode, points, onClose, onCloseFormDialog, oldHotspot, sceneName }) => {
    let token = localStorage.getItem("authToken") || "";
    const [listOldHotspot, setListOldHotspot] = useState(oldHotspot);

    // State to manage the dialog visibility and info content
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogContent, setDialogContent] = useState("");
    const handleSelectData = async (hotspot) => {
        const confirmDelete = await showAlertDialog("Bạn có chắc chắn muốn dùng thông tin này cho hotspot hiện tại?");
        if (!confirmDelete) return;
        SendAddHotspot(hotspot);
    }
    const [searchTerm, setSearchTerm] = useState("");
    const handleSearchName = (searchTerm) => {
        setSearchTerm(searchTerm);
        fetchDataOldHotspot(searchTerm);
    }

    const fetchDataOldHotspot = async (name) => {
        const requestData = {
            sceneName: sceneName,
            name: name || ""
        }
        try {
            const url = `/hotspot/get-all-old-hotspot`;
            const response = await Axios.post(url, requestData, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });

            const responseData = response.data;
            setListOldHotspot(responseData.data);

        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    };

    const SendAddHotspot = async (hotspot) => { // Use async/await for cleaner error handling
        try {

            const krpano = document.getElementById("krpanoSWFObject");
            let currentScene = krpano.get("scene[get(xml.scene)]");
            let scene = currentScene.name;
            console.log(hotspot);

            const requestData = {
                industrialParkCode: parkCode,
                hotspotType: points.length > 1 ? "POLYGONAL" : "MARK",
                resource: hotspot.resource,
                scene: scene,
                color: hotspot.color,
                points: points,
                // action: {
                //     clickType: hotspot.action.clickType,
                //     showInfoType: hotspot.action.showInfoType,
                //     infoName: hotspot.action.infoName,
                //     infoDetail: hotspot.action.infoDetail,
                //     linkedCode: hotspot.action.linkScene?.sceneName || hotspot.action.area?.code
                // }
                oldHotspotName: hotspot.code
            };

            const apiEndpoint = '/hotspot/create-hotspot-with-old-hotspot';
            console.log(requestData);

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await Axios.post(apiEndpoint, requestData, { headers });

            if (response.data.code !== 200) {
                // Handle non-200 responses appropriately
                console.error('API request failed:', response.data);
                Notification(response.data.message, "WARNING");
                return; // Early exit if necessary
            }
            Notification(response.data.message, "SUCCESS");
            console.log(response.data);
            onCloseFormDialog();

            setTimeout(function () {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Error sending API request:', error);
            // Handle errors gracefully, e.g., display an error message to the user
        }

    };

    const handleShowDetail = (hotspotAction) => {
        let content = "";

        if (hotspotAction.area.id) {
            const { name, code, square, state, description } = hotspotAction.area;
            content = (
                <Box className="w-2/3">
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Loại hiển thị</TableCell>
                                    <TableCell>Khu đất</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Tên</TableCell>
                                    <TableCell>{name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Mã khu đất</TableCell>
                                    <TableCell>{code}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Diện tích</TableCell>
                                    <TableCell>{square} (hec-ta)</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell>{state === "IDLE" ? "Chưa cho thuê" : "Đã cho thuê"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Miêu tả</TableCell>
                                    <TableCell>{description} </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            );
        }
        // 2. Check if linkScene is not null
        else if (hotspotAction.linkScene.sceneName) {
            const { sceneName, thumbUrl } = hotspotAction.linkScene;
            const infoName = hotspotAction.infoName;
            content = (
                <Box className="w-2/3">
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Thông tin ảnh đích đến</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Miêu tả</TableCell>
                                    <TableCell>{infoName}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Ảnh thu nhỏ</TableCell>
                                    <TableCell><Box component="img" src={thumbUrl} alt="Thumbnail" style={{ width: '40%', marginTop: '10px' }} /></TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

            );
        }
        // 3. Check if showInfoType is 'other'
        else if (hotspotAction.showInfoType === 'OTHER') {
            const { infoName, infoDetail } = hotspotAction;
            content = (
                <Box className="w-2/3">
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Loại hiển thị</TableCell>
                                    <TableCell>Thông tin khác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Tiêu đề</TableCell>
                                    <TableCell>{infoName}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Miêu tả</TableCell>
                                    <TableCell>{infoDetail}</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            );
        } else {
            content = "Không có thông tin gì để hiển thị";
        }

        setDialogContent(content);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setDialogContent(""); // Clear content when closing
    };

    return (
        <>
            <DialogTitle className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Các hotspot trong ảnh đã chỉnh sửa</h2>
                <button
                    onClick={onClose}
                    className="px-4 py-2  border-red-600 rounded hover:bg-red-600 hover:text-white transition duration-300"
                >
                    X
                </button>
            </DialogTitle>
            <TextField
                label="Tìm kiếm theo tên"
                className="w-1/3"
                value={searchTerm}
                onChange={(e) => handleSearchName(e.target.value)}
                margin="none"
                sx={{ marginLeft: '7px' }}

            />
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Kiểu</TableCell>
                            <TableCell>Hành động</TableCell>
                            <TableCell>Tên</TableCell>
                            <TableCell>Màu</TableCell>
                            <TableCell>Icon/video</TableCell>
                            <TableCell>Chi tiết</TableCell>
                            <TableCell>Chọn dữ liệu này</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listOldHotspot.map((hotspot) => (
                            <TableRow key={hotspot.name}>
                                <TableCell>{hotspot.type === "MARK" ? "Điểm" : "Hình vẽ"}</TableCell>
                                <TableCell>
                                    {hotspot.action.clickType === "LOAD_SCENE" ? "Chuyển ảnh" : hotspot.action.clickType === "LOAD_VIDEO" ? "Phát video" : "Hiển thị thông tin"}
                                </TableCell>

                                <TableCell>
                                    {hotspot.name}
                                </TableCell>

                                <TableCell>
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: `#${hotspot.color?.substring(2)} `,
                                            borderRadius: '4px',
                                            marginRight: '8px'
                                        }}
                                    ></span>
                                </TableCell>

                                <TableCell>
                                    {hotspot.resource ? (
                                        <Box
                                            component={hotspot.action.clickType === "LOAD_VIDEO" ? "video" : "img"}
                                            src={hotspot.resource}
                                            alt="Icon"
                                            sx={{
                                                width: '50px',
                                                height: '30px',
                                                marginRight: '10px',
                                            }}
                                        />
                                    ) : (
                                        <span>Không có icon/video</span>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <InfoIcon onClick={() => handleShowDetail(hotspot.action)} className="cursor-pointer" titleAccess="Show Info" />
                                </TableCell>
                                <TableCell>
                                    <Button variant="outlined" color="primary" onClick={() => handleSelectData(hotspot)}>
                                        Chọn dữ liệu này
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog for displaying hotspot details */}
            <Dialog maxWidth="md" fullWidth open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Thông tin Hotspot</DialogTitle>
                <DialogContent>
                    <>
                        <pre>{dialogContent}</pre> {/* Using <pre> to preserve formatting */}
                    </>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default OldHotspotPreview;
