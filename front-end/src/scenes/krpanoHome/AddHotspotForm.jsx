import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    RadioGroup,
    FormControlLabel,
    FormLabel,
    Radio,
    IconButton,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper

} from '@mui/material';
import Notification from '../../components/Notification';
import Axios from '../../components/Axios';
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link } from 'react-router-dom';
import OldHotspotPreview from './OldHotspotPreview';
import CloseIcon from "@mui/icons-material/Close"
import ReactQuill from 'react-quill';
import SpriteAnimation from "../icon/SpriteAniamtion";


const AddHotspotForm = ({ krpano, points, hotspotData, code, onClose }) => {

    let token = localStorage.getItem("authToken") || "";
    const [openFormDialog, setOpenFormDialog] = useState(true);
    let industrialParkCode = code;
    const [listIcon, setListIcon] = useState([]);
    const [listVideo, setListVideo] = useState([]);

    const [data, setData] = useState({
        hotspotType: hotspotData?.type || "MARK",
        resource: hotspotData?.resource || "http://localhost:8081/tour-direc/skin/vtourskin_hotspot.png",
        color1: hotspotData?.color
            ? `#${hotspotData.color.startsWith("0x") ? hotspotData.color.substring(2) : hotspotData.color}`
            : "#FFFFFF",
        name: hotspotData?.name || null,
        clickType: hotspotData?.action?.clickType || "LOAD_SCENE",
        showInfoType: hotspotData?.action?.showInfoType || "AREA",
        infoName: hotspotData?.action?.infoName || "",
        infoDetail: hotspotData?.action?.infoDetail || "",
        linkedCode: hotspotData?.action?.clickType === "LOAD_SCENE" ?
            hotspotData?.action?.linkScene?.sceneName || "" : hotspotData?.action?.area?.code || ""
    });

    const [iconShow, setIconShow] = useState(false);
    const [areas, setAreas] = useState([]);
    const [scenes, setScenes] = useState([]);

    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedArea, setSelectedArea] = useState(null);
    const [oldHotspot, setOldHotspot] = useState([]);
    const [openOldHotspotDialog, setOpenOldHotspotDialog] = useState(false);
    const [openVideoDialog, setOpenVideoDialog] = useState(false);

    const [sceneName, setSceneName] = useState([]);

    const handleShowOldHotspot = () => {
        setOpenOldHotspotDialog(true);
    }

    const handleCloseOldHotspot = () => {
        setOpenOldHotspotDialog(false);
    }

    const handleShowDetail = (item) => {
        setSelectedArea(item); // Lưu thông tin khu vực được chọn
        setOpenDetailDialog(true); // Mở modal
    };

    const handleShowVideo = (item) => {
        console.log(item);

        setSelectedArea(item);
        setOpenVideoDialog(true);
    };
    const handleCloseVideo = () => {
        setOpenVideoDialog(false);
        setSelectedArea(null);
    };
    const handleCloseDetailDialog = () => {
        setOpenDetailDialog(false); // Đóng modal
        setSelectedArea(null); // Xóa thông tin đã chọn
    };

    // Gọi hàm này khi bạn nhận được hotspotData
    const handleCloseFormDialog = () => {
        onClose();
        setOpenFormDialog(false);
    }

    const handleChangeClickType = (event) => {
        const newClickType = event.target.value;
        setData((prevData) => ({
            ...prevData,
            clickType: newClickType,
        }));
    };
    useEffect(() => {

        if (points.length === 1) {
            setData((prevData) => ({
                ...prevData,
                hotspotType: 'MARK',  // Setting hotspotType to 'MARK'
            }));
            setIconShow(true);
        } else {
            setData((prevData) => ({
                ...prevData,
                hotspotType: 'POLYGONAL',  // Setting hotspotType to 'MARK'
            }));
            setIconShow(false);
        }

        Promise.all([fetchDataScene(), fetchDataArea(), fetchDataOldHotspot(), fetchDataListIcon(), fetchDataListVideo()])
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const fetchDataListIcon = async () => {
        try {
            const url = `/hotspot-resource/get-all?type=ICON`;
            const response = await Axios.get(url, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });

            const responseData = response.data;
            setListIcon(responseData.data);

        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    };

    const fetchDataListVideo = async () => {
        try {
            const url = `/hotspot-resource/get-all?type=VIDEO`;
            const response = await Axios.get(url, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });

            const responseData = response.data;
            setListVideo(responseData.data);

        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    };

    const fetchDataOldHotspot = async () => {
        const currentScene = krpano.get("scene[get(xml.scene)]");
        const scene = currentScene.name;
        setSceneName(scene);

        const requestData = {
            sceneName: scene,
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
            setOldHotspot(responseData.data);

        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    };

    const fetchDataScene = async () => {
        try {
            const url = `/scene/get-all-scene?industrialParkCode=${industrialParkCode}`;
            const response = await Axios.get(url, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });
            const currentScene = krpano.get("scene[get(xml.scene)]");
            const scene = currentScene.name;
            const responseData = response.data;

            const removeCurrentScene = responseData.data.filter(s => s.sceneName !== scene);

            // setScenes(responseData.data);
            setScenes(removeCurrentScene);
        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    };

    const fetchDataArea = async () => {
        try {
            const url = `/area/get-all-area-not-in-hotspot?industrialParkCode=${industrialParkCode}`;
            const response = await Axios.get(url, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });
            const responseData = response.data;
            setAreas(hotspotData && hotspotData.action?.area ? [...responseData.data, hotspotData.action.area] : responseData.data);
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    };
    const [errors, setErrors] = useState([]);

    const validate = () => {
        let newErrors = [];
        // Name field validation
        if (!data.name || data.name.trim() === "") {
            newErrors.push("Tên không được để trống.");
        } else if (data.name.length > 100) {
            newErrors.push("Tên không được vượt quá 100 ký tự.");
        }

        // Resource validation
        if (
            (data.clickType === "LOAD_SCENE" || data.clickType === "SHOW_INFO") &&
            !data.resource
        ) {
            newErrors.push("Vui lòng chọn một icon.");
        } else if (data.clickType === "LOAD_VIDEO" && !data.resource) {
            newErrors.push("Vui lòng chọn một video.");
        }

        // Linked code validation for LOAD_SCENE
        if (data.clickType === "LOAD_SCENE" && !data.linkedCode) {
            newErrors.push("Vui lòng chọn màn hình để di chuyển đến.");
        }

        if (data.clickType === "SHOW_INFO" && data.showInfoType === "AREA" && !data.linkedCode) {
            newErrors.push("Vui lòng chọn khu đất.");
        }

        // Info Name validation for SHOW_INFO -> OTHER
        if (
            data.showInfoType === "OTHER" &&
            data.clickType === "SHOW_INFO" &&
            !data.infoName
        ) {


            newErrors.push("Vui lòng nhập tiêu đề thông tin.");
        }

        // Finalize errors
        setErrors(newErrors);
        return newErrors.length !== 0; // Return true if no errors
    };

    const SendAddHotspot = async () => { // Use async/await for cleaner error handling

        if (validate()) {
            Notification(errors[0], "WARNING");
            return;
        }
        try {

            let color = "0x" + data.color1.substring(1);
            let currentScene = krpano.get("scene[get(xml.scene)]");

            let scene = currentScene.name;

            let hotspotType = "";

            if (data.clickType === "LOAD_VIDEO") {
                hotspotType = "MARK";
            } else {
                hotspotType = data.hotspotType;
            }
            // Create request data object
            const requestData = {
                industrialParkCode: industrialParkCode,
                hotspotType: hotspotType,
                resource: data.resource,
                scene: scene,
                color: color,
                points: points,
                name: data.name,
                action: {
                    clickType: data.clickType,
                    showInfoType: data.showInfoType,
                    infoName: data.infoName,
                    infoDetail: data.infoDetail,
                    linkedCode: data.linkedCode
                }
            };

            let apiEndpoint = "";
            if (hotspotData) {
                requestData["code"] = hotspotData.hotspotInfo.name;
                if (hotspotData.hotspotInfo?.scale) {
                    requestData["scale"] = hotspotData.hotspotInfo.scale;
                    requestData["depth"] = hotspotData.hotspotInfo.depth;
                    requestData["tx"] = hotspotData.hotspotInfo.tx;
                    requestData["ty"] = hotspotData.hotspotInfo.ty;
                    requestData["tz"] = hotspotData.hotspotInfo.tz;
                }
                apiEndpoint = '/hotspot/edit';
            } else {
                apiEndpoint = '/hotspot/create';
            }
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
            setOpenFormDialog(false);
            sessionStorage.setItem('sceneName', scene);
            setTimeout(function () {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Error sending API request:', error);
            Notification(error.response?.data.message, "WARNING");
            // Handle errors gracefully, e.g., display an error message to the user
        }
    };

    return (
        <Dialog
            open={openFormDialog}
            onClose={handleCloseFormDialog}
            maxWidth="md"
            fullWidth
            sx={{
                zIndex: 98,
            }}
        >
            <DialogTitle>{hotspotData ? "Chỉnh sửa hotspot" : "Thêm hotspot"}</DialogTitle>
            <DialogContent>

                {!hotspotData && oldHotspot && oldHotspot.length !== 0 && (
                    <>
                        <Button className='border-solid border-blue-400 rounded-sm' onClick={() => handleShowOldHotspot()}>Sử dụng hotspot cũ</Button>

                        <Dialog open={openOldHotspotDialog} onClose={handleCloseOldHotspot} maxWidth="md" fullWidth>
                            <OldHotspotPreview parkCode={industrialParkCode} points={points} onClose={handleCloseOldHotspot} sceneName={sceneName} onCloseFormDialog={handleCloseFormDialog} oldHotspot={oldHotspot} />
                        </Dialog>

                    </>
                )}
                <form>
                    <FormControl fullWidth margin="normal">
                        <FormLabel id="hotspotType-label" sx={{ fontWeight: 'bold', color: 'black' }}>Kiểu</FormLabel>
                        <RadioGroup
                            aria-labelledby="hotspotType-label"
                            value={data.hotspotType}

                        >
                            <FormControlLabel value="MARK" control={<Radio />} label="Điểm" />
                            <FormControlLabel value="POLYGONAL" control={<Radio />} label="Hình vẽ" />
                        </RadioGroup>
                    </FormControl>

                    {data.hotspotType !== "MARK" && (
                        <>
                            <FormLabel id="hotspotType-label" sx={{ fontWeight: 'bold', color: 'black' }}>Số điểm đã vẽ :{points.length}</FormLabel>
                        </>
                    )
                    }
                    {/* clickingType */}
                    <FormControl fullWidth margin="normal">
                        <FormLabel id="hotspotType-label" sx={{ fontWeight: 'bold', color: 'black' }}>Hành động</FormLabel>
                        <RadioGroup
                            aria-labelledby="hotspotType-label"
                            value={data.clickType}
                            onChange={handleChangeClickType}
                        >
                            <FormControlLabel value="LOAD_SCENE" control={<Radio />} label="Chuyển ảnh" />
                            <FormControlLabel value="SHOW_INFO" control={<Radio />} label="Hiển thị thông tin" />
                            <FormControlLabel value="LOAD_VIDEO" control={<Radio />} label="Phát video" />
                        </RadioGroup>
                    </FormControl>

                    <TextField
                        label={
                            <span>
                                Tên<span style={{ color: 'red' }}>(*)</span>
                            </span>
                        }
                        fullWidth
                        margin="normal"
                        id="name1"
                        value={data.name}
                        onChange={(e) => setData((prevData) => ({ ...prevData, name: e.target.value }))}
                    />

                    {iconShow && (data.clickType === "LOAD_SCENE" || data.clickType === "SHOW_INFO") &&
                        (
                            <FormControl fullWidth margin="normal">
                                <FormLabel >
                                    {listIcon.length !== 0
                                        ? "Chọn icon"
                                        : <>
                                            Thêm icon &nbsp;
                                            <Link to={`/manage-icon`} style={{ textDecoration: 'none', color: 'blue', cursor: 'pointer' }}>
                                                tại đây
                                            </Link>
                                        </>
                                    }</FormLabel>
                                <Select
                                    labelId="icon-select-label"
                                    className='overflow-y'
                                    value={data.resource}
                                    label="Chọn một icon"
                                    onChange={(e) => setData((prevData) => ({ ...prevData, resource: e.target.value }))}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Set the maximum height for the dropdown menu
                                                overflowY: 'auto', // Enable vertical scrolling
                                            },
                                        },
                                    }}
                                >
                                    {listIcon.map((icon, index) => (
                                        <MenuItem key={index} value={icon.path || "Unnamed"} sx={{ backgroundColor: "#ECF0F1" }}>
                                            {icon.iconType === "STATIC" ?
                                                (<Box
                                                    component="img"
                                                    src={icon.path}
                                                    alt={icon.name || ""}
                                                    sx={{
                                                        width: '40px',
                                                        height: '40px',
                                                        marginRight: '10px',
                                                    }}
                                                />) :

                                                (
                                                    <Box sx={{
                                                        backgroundColor: "#BFBFBF",
                                                    }}><SpriteAnimation
                                                            imageUrl={icon.path}
                                                            frameWidth={icon.frameWidth}
                                                            frameHeight={icon.frameHeight}
                                                            frameRate={icon.frameRate}
                                                        /></Box>)
                                            }
                                            {icon.name || ""}

                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )
                    }
                    {data.clickType === "LOAD_VIDEO" && (
                        <FormControl fullWidth>
                            <FormLabel >
                                {listVideo.length !== 0
                                    ? <>
                                    Chọn video <span style={{ color: "red" }}>(*)</span>
                                  </>
                                    : <>
                                        Thêm Video &nbsp;
                                        <Link to={`/manage-video`} style={{ textDecoration: 'none', color: 'blue', cursor: 'pointer' }}>
                                            tại đây
                                        </Link>
                                    </>
                                }</FormLabel>
                            <Select
                                className='overflow-y-auto'
                                labelId="icon-select-label"
                                value={data.resource}
                                label="Chọn một video"
                                onChange={(e) => setData((prevData) => ({ ...prevData, resource: e.target.value }))}
                            >
                                {listVideo.map((item, index) => (
                                    <MenuItem key={index} value={item.path || "Unnamed"}>
                                        <Box
                                            component="video"
                                            src={item.path}
                                            alt={item.name || ""}
                                            sx={{
                                                width: '30px',
                                                height: '30px',
                                                marginRight: '10px',
                                            }}
                                        />
                                        {item.name || ""}
                                        <IconButton
                                            onClick={() => handleShowVideo(item)}
                                            color="secondary"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>

                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {data.clickType === "LOAD_SCENE" && (
                        <>
                            <FormControl require fullWidth margin="normal">
                                <InputLabel id="select-label" >Chọn màn được di chuyển đến<span style={{ color: "red" }}>(*)</span></InputLabel>
                                <Select
                                    className='overflow-y-auto'
                                    labelId="select-label"
                                    value={data.linkedCode}
                                    onChange={(e) => setData((prevData) => ({ ...prevData, linkedCode: e.target.value }))}
                                    label="Chọn ảnh đi đến"
                                >
                                    <MenuItem value="" disabled>
                                        <em>Chọn màn hình</em>
                                    </MenuItem>
                                    {scenes && scenes.map((item, index) => (
                                        <MenuItem key={index} value={item.sceneName}>
                                            <Box
                                                component="img"
                                                src={`${item.thumbUrl}`}
                                                alt="Hotspot"
                                                sx={{
                                                    objectFit: 'fill',
                                                    width: '50px',
                                                    height: '50px',
                                                    marginRight: '10px'
                                                }}
                                            />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                label="Miêu tả"
                                fullWidth
                                margin="normal"
                                id="sceneName"
                                value={data.infoName}
                                onChange={(e) => setData((prevData) => ({ ...prevData, infoName: e.target.value }))}
                            />
                        </>
                    )}


                    {data.clickType === "SHOW_INFO" && (
                        <>
                            <FormControl fullWidth margin="normal">
                                <FormLabel id="hotspotType-label" >Kiểu thông tin<span style={{ color: "red" }}>(*)</span></FormLabel>
                                <RadioGroup
                                    aria-labelledby="hotspotType-label"
                                    value={data.showInfoType}
                                    onChange={(e) => setData((prevData) => ({ ...prevData, showInfoType: e.target.value }))}
                                >
                                    <FormControlLabel value="AREA" control={<Radio />} label="Khu đất" />
                                    <FormControlLabel value="OTHER" control={<Radio />} label="Các loại khác" />
                                </RadioGroup>
                            </FormControl>
                        </>
                    )}

                    {data.showInfoType === "AREA" && data.clickType === "SHOW_INFO" && (
                        <>
                            <FormControl fullWidth margin="normal">
                                <FormLabel >{areas?.length !== 0
                                    ? <>Chọn vùng đất<span style={{ color: "red" }}>(*)</span></>
                                    : <>
                                        Thêm vùng đất &nbsp;
                                        <Link to={`/industrial-park/${industrialParkCode}/1`} style={{ textDecoration: 'none', color: 'blue', cursor: 'pointer' }}>
                                            tại đây
                                        </Link>
                                    </>
                                }</FormLabel>

                                <Select
                                    labelId="select-label"
                                    className='overflow-y-auto'
                                    value={data.linkedCode}
                                    onChange={(e) => setData((prevData) => ({ ...prevData, linkedCode: e.target.value }))}
                                    label="Chọn tùy chọn" // Gán nhãn cho Select
                                >
                                    <MenuItem value="" disabled>
                                        <em>Các lựa chọn</em>
                                    </MenuItem>
                                    {areas && areas !== null && areas.map((item, index) => {
                                        return <MenuItem key={item.code} value={item.code}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <span>{item.name}</span>

                                                <IconButton
                                                    onClick={() => handleShowDetail(item)}
                                                    color="secondary"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Box>
                                        </MenuItem>
                                    })
                                    }
                                </Select>
                            </FormControl>
                        </>
                    )}

                    {/* title for description */}
                    {(data.showInfoType === "OTHER" && data.clickType === "SHOW_INFO") && (
                        <>
                            <TextField
                                label={
                                    <span>
                                        Tiêu đề của thông tin<span style={{ color: 'red' }}>(*)</span>
                                    </span>
                                }
                                fullWidth
                                margin="normal"
                                id="sceneName"
                                value={data.infoName}
                                onChange={(e) =>
                                    setData((prevData) => ({ ...prevData, infoName: e.target.value }))
                                }
                            />
                            <ReactQuill
                                label="Nội dung của thông tin"
                                value={data.infoDetail}
                                onChange={(value) =>
                                    setData((prevData) => ({ ...prevData, infoDetail: value }))
                                }
                                theme="snow"
                                fullWidth
                                style={{ height: "150px" }}
                            />
                            <br /><br />
                        </>
                    )}
                    {data.hotspotType !== "MARK" && data.clickType !== "LOAD_VIDEO" && (
                        <>
                            <FormControl fullWidth margin="normal">
                                <div >
                                    Chọn màu vùng đất
                                </div>
                                <input
                                    type='color'
                                    value={data.color1}
                                    onChange={(e) =>
                                        setData((prevData) => ({ ...prevData, color1: e.target.value }))
                                    }
                                    style={{ width: '20%' }}
                                />
                            </FormControl>
                        </>
                    )
                    }

                </form>

                <Dialog
                    open={openDetailDialog}
                    onClose={handleCloseDetailDialog}
                    maxWidth="md"
                    fullWidth={false}
                >
                    <DialogTitle>Chi tiết khu vực</DialogTitle>
                    <DialogContent>
                        {selectedArea && (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Trường dữ liệu</TableCell>
                                            <TableCell>Giá trị</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Tên</TableCell>
                                            <TableCell>{selectedArea.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Mã</TableCell>
                                            <TableCell>{selectedArea.code}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Diện tích</TableCell>
                                            <TableCell>{selectedArea.square}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Mô tả</TableCell>
                                            <TableCell>{selectedArea.description}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDetailDialog} color="primary">
                            Đóng
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={openVideoDialog}
                    onClose={handleCloseVideo}
                    maxWidth="md"
                    fullWidth
                >
                    {selectedArea && (
                        <>
                            <DialogTitle>
                                {"Tên video: " + selectedArea.name || "Video"}
                                <IconButton
                                    aria-label="close"
                                    onClick={handleCloseVideo}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: 8,
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                <Box
                                    component="video"
                                    src={selectedArea.path}
                                    controls
                                    autoPlay
                                    sx={{
                                        width: '100%',
                                        height: 'auto',
                                    }}
                                />
                            </DialogContent>
                        </>
                    )}

                </Dialog>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={SendAddHotspot}
                    sx={{
                        backgroundColor: "#000000",
                        color: "#FFFFFF",
                        '&:hover': {
                            backgroundColor: "#7DDA58", // Set your desired hover color here
                            color: "#FFFFFF", // Optional: Change text color on hover
                        }
                    }}
                >
                    Lưu
                </Button>
                <Button
                    onClick={handleCloseFormDialog}
                >
                    Hủy
                </Button>
            </DialogActions>
        </Dialog >
    );
};

export default AddHotspotForm;
