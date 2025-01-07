import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useMaterialReactTable, MRT_TableContainer } from 'material-react-table';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    IconButton
} from "@mui/material";
import Axios from "../../components/Axios";
import { useNavigate } from 'react-router-dom';
import AddVtourForm from '../form/AddVtourForm'
import Loader from "../../components/Loading";
import Notification from "../../components/Notification";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { hasPermission } from "../login/DecodeToken";
import showAlertDialog from "../../components/ShowAlertDialog"; // Import AlertDialog
import { LoadingButton } from '@mui/lab';

const ManageImage = ({ parkId }) => {
    const navigate = useNavigate();
    let token = localStorage.getItem("authToken");
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [isLoading, setIsLoading] = useState(false);
    const [openUpdateTourDialog, setOpenUpdateTourDialog] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null); // Lưu trữ hàng đã chọn để chỉnh sửa
    const [openAddTourDialog, setOpenAddTourDialog] = useState(false);
    const initialData = useRef([]);
    const [data, setData] = useState([]);

    const formikRef = useRef();

    const [newOrder, setNewOrder] = useState([]);
    const handleClickOpenVr360 = (row) => {
        console.log(row.code);
        navigate('/home', { state: { code: parkId, hotspot: { sceneName: row.sceneName } } });
    }

    const handleOpenAddVtour = (rowData = null) => {
        setSelectedRow(rowData); // Lưu dữ liệu hàng được chọn (nếu có) vào state
        setOpenAddTourDialog(true);
    }
    const handleDeleteScene= async() => {
        const confirmDelete = await showAlertDialog("Hành động này sẽ xóa tất cả ảnh và lưu vào backups tour");
        if (!confirmDelete) return;

        setIsLoading(true);
        await DeleteVtour(parkId);
        setIsLoading(false);

    }
    const handleCloseAddVtour = (event, reason) => {
        if (reason !== 'backdropClick') {
            setOpenAddTourDialog(false);
        }
    }

    const handleOpenUpdateVtour = (rowData = null) => {
        setSelectedRow(rowData); // Lưu dữ liệu hàng được chọn (nếu có) vào state
        setOpenUpdateTourDialog(true);
    }

    const handleCloseUpdateVtour = (event, reason) => {
        if (reason !== 'backdropClick') {
            setOpenUpdateTourDialog(false);
        }
    }
    const handleDelete = async (id) => {
        const confirmDelete = await showAlertDialog("Bạn có chắc chắn muốn xóa ảnh này này?");
        if (!confirmDelete) return;

        setIsLoading(true);
        await DeleteImage(id);
        setIsLoading(false);
    };
    const sortingImage = async () => {
        setIsLoading(true);
        console.log('newOrder', newOrder);
        console.log('data', data);

        try {

            const sceneOrders = newOrder.reduce((acc, scene, index) => {
                acc[scene] = index + 1; // Using index + 1 for 1-based order
                return acc;
            }, {});

            const requestData = {
                industrialParkCode: parkId,
                sceneOrders: sceneOrders
            };

            console.log(requestData);

            const response = await Axios.post(`/scene/sort`, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const responseData = response.data;
            if (responseData.code !== 200) {
                Notification(responseData.message, "WARNING");
            } else {
                Notification(responseData.message, "SUCCESS");
            }
        } catch (error) {
            console.error('Error updating order:', error);
            Notification(error.response?.data?.message, "WARNING");
        } finally {

            await fetchDataImage();
            setIsLoading(false);
        }

    };
    const handleChangeOrder = async () => {
        const confirmDelete = await showAlertDialog("Bạn có chắc chắn muốn thay đổi thứ tự?");
        if (!confirmDelete) return;

        await sortingImage();
    }

    const fetchDataImage = async () => {

        const apiEndpoint = `/scene/get-all-scene?industrialParkCode=${parkId}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Replace with your authorization header
        };
        await Axios.get(apiEndpoint, { headers })
            .then(response => {
                let responeData = response.data.data;
                console.log(responeData);

                setData(responeData);
                // setNewOrder(responeData.map(item => item.sceneName));
                initialData.current = responeData;
            })
            .catch(error => {
                // message = response.message;
                console.error('Error:', error);
            });
    }
    const DeleteVtour = async (parkCode) => {
        try {
            
            const requestData = {
            };

            const response = await Axios.post(`/vtour/delete-tour/${parkCode}`, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            let responseData = response.data;
            console.log(responseData);

            if (responseData.code !== 200) {
                Notification(responseData.message, "WARNING");
                return;
            }
            Notification(responseData.message, "SUCCESS");


        } catch (error) {
            console.error('Error deleting area:', error);
            Notification(error.response?.data?.message, "WARNING");
        } finally {
            await fetchDataImage();
            
        }

    }

    const DeleteImage = async (sceneName) => {
        try {
            
            const postData = Array.isArray(sceneName) ? sceneName : [sceneName];
            const requestData = {
                listSceneName: postData
            };

            const response = await Axios.post(`/scene/delete`, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            let responseData = response.data;
            console.log(responseData);

            if (responseData.code !== 200) {
                Notification(responseData.message, "WARNING");
                return;
            }
            Notification(responseData.message, "SUCCESS");


        } catch (error) {
            console.error('Error deleting area:', error);
            Notification(error.response?.data?.message, "WARNING");
        } finally {
            await fetchDataImage();
        }

    }

    useEffect(() => {
        setIsLoading(true);
        fetchDataImage();
        setIsLoading(false);
    }, []);

    // Define your columns, assuming `Person` type with fields like `name`, `age`, etc.
    const columns = useMemo(() => [
        {
            accessorKey: 'thumbUrl', // This should match the key in your data
            header: 'Ảnh nền',
            Cell: ({ cell }) => (
                <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {cell.getValue() ? ( // Check if thumbUrl exists before rendering image
                        <img
                            src={cell.getValue()}
                            alt="no image"
                            style={{
                                maxHeight: '100px', // Set a max height for the image
                                maxWidth: '100%', // Set a max width for the image
                                border: '2px solid lightgray', // Add a 2px solid border with light gray color
                                borderRadius: '8px', // Optional: Add rounded corners
                            }}
                        />
                    ) : (
                        <span>No Image Available</span> // Display a message if no thumbUrl is provided
                    )}
                </div>
            ),
            // You can also define other properties like sorting and filtering here
        },
        {
            accessorKey: 'actions', // Name for the actions column
            header: 'Hành động',
            Cell: ({ row }) => (
                <Box>
                    {hasPermission("UPDATE_SCENE") &&
                        <IconButton
                            onClick={() => handleOpenUpdateVtour(row.original)} // Use row.original to get the complete row data
                            color="secondary"
                        >
                            <EditIcon />
                        </IconButton>
                    }

                    {hasPermission("DELETE_SCENE") &&
                        <IconButton
                            onClick={() => handleDelete(row.original.sceneName)} // Use row.original to get the complete row data
                            color="warning"
                        >
                            <DeleteIcon />
                        </IconButton>
                    }

                </Box>
            ),
        },
        {
            accessorKey: 'action', // Use this for your VR 360 view action
            header: 'Xem bằng VR 360',
            Cell: ({ row }) => (
                <Box>
                    <IconButton onClick={() => handleClickOpenVr360(row.original)}>
                        <VisibilityIcon />
                    </IconButton>
                </Box>
            ),
        },
        {
            accessorKey: 'order', // Field for order
            header: 'Thứ tự',
            // You can customize this cell if needed
        },
    ], []);



    const table = useMaterialReactTable({
        autoResetPageIndex: false, // Prevents resetting page on every action
        columns, // Column definitions
        data, // Data to be rendered in the table
        enableRowOrdering: true, // Enables drag-and-drop row reordering
        enableSorting: false,
        pageSize: data.length,
        enablePagination: false,
        muiRowDragHandleProps: ({ table }) => ({
            onDragEnd: () => {
                const { draggingRow, hoveredRow } = table.getState(); // Get the state of dragging and hovered rows
                if (hoveredRow && draggingRow) {
                    const updatedData = [...data];
                    const movedRow = updatedData.splice(draggingRow.index, 1)[0];
                    updatedData.splice(hoveredRow.index, 0, movedRow);
                    setData(updatedData); // Update the data state
                    setNewOrder(updatedData.map(item => item.sceneName));
                }
            },
        }),
    });

    // Render the table
    return (
        <div style={{ padding: '20px' }}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb="20px"
            >
                <Header
                    title="Quản lý ảnh"
                    subtitle="Quản lý ảnh của khu công nghiệp"
                />
                <Box display="flex" gap="10px">
                    {" "}
                    {/* Thêm Box với gap để điều chỉnh khoảng cách */}
                    {(hasPermission("CREATE_SCENE") || hasPermission("MANAGE_INDUSTRIAL_PARK")) && 
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ backgroundColor: colors.blueAccent[700] }}
                            onClick={() => handleOpenAddVtour(null)} // Mở form để tạo mới khi không có hàng được chọn
                        >
                            Thêm
                        </Button>
                    }
                    
                    {(hasPermission("DELETE_SCENE") || hasPermission("MANAGE_INDUSTRIAL_PARK")) && 
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ backgroundColor: colors.blueAccent[700] }}
                            onClick={() => handleDeleteScene()} // Mở form để tạo mới khi không có hàng được chọn
                        >
                            Xóa tour
                        </Button>
                    }

                    {(hasPermission("SAVE_ORDER_IMAGE_INDUSTRIAL_PARK") || hasPermission("MANAGE_INDUSTRIAL_PARK"))&&
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ backgroundColor: colors.blueAccent[700] }}
                            onClick={handleChangeOrder}
                            disabled={newOrder.length === 0}
                        >
                            Thay đổi thứ tự ảnh
                        </Button>
                    }

                </Box>
            </Box>

            {isLoading ? (
                <Loader /> // Display Loader while loading
            ) : (
                <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}> {/* Limit the height and enable scrolling */}
                    <MRT_TableContainer table={table} />
                </Box>
            )}

            <Dialog
                open={openAddTourDialog}
                onClose={handleCloseAddVtour}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Thêm ảnh 360 vào khu công nghiệp
                </DialogTitle>
                <DialogContent>
                    <AddVtourForm formikRef={formikRef} setIsLoading={setIsLoading} type="IMAGE" parkId={parkId} refresh={() => fetchDataImage(1, 10)} onCloseForm={handleCloseAddVtour} />
                    {/* Truyền dữ liệu hàng đã chọn vào form */}
                </DialogContent>
                <DialogActions>
                    <LoadingButton onClick={() => formikRef.current.submitForm()} color="secondary" variant="contained" loading={isLoading}>
                                {selectedRow ? "Chỉnh sửa ảnh" : "Thêm ảnh"} 
                    </LoadingButton>
                    <Button
                        onClick={handleCloseAddVtour}
                        color="primary"
                        sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}
                    >
                        Hủy
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openUpdateTourDialog}
                onClose={handleCloseUpdateVtour}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Thêm ảnh 360 vào khu công nghiệp
                </DialogTitle>
                <DialogContent>
                    <AddVtourForm formikRef={formikRef} setIsLoading={setIsLoading} rowData={selectedRow}  parkId={parkId} refresh={() => fetchDataImage(1, 10)} onCloseForm={handleCloseUpdateVtour} />
                    {/* Truyền dữ liệu hàng đã chọn vào form */}
                </DialogContent>
                <DialogActions>
                    <LoadingButton onClick={() => formikRef.current.submitForm()} color="secondary" variant="contained" loading={isLoading}>
                                {selectedRow ? "Chỉnh sửa ảnh" : "Thêm ảnh"} 
                    </LoadingButton>
                    <Button
                        onClick={handleCloseUpdateVtour}
                        color="primary"
                        sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}
                    >
                        Hủy
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
};

export default ManageImage;
