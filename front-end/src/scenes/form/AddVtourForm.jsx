import { Box, Button, FormLabel, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Axios from "../../components/Axios";
import Notification from "../../components/Notification";
import FileChoosing from "../../components/FileChoosing";
import { LoadingButton } from "@mui/lab";

const AddVtourForm = ({ rowData, type, parkId, refresh, onCloseForm, disableCancel,formikRef,setIsLoading }) => {
    const isNonMobile = useMediaQuery("(min-width:600px)");
    let token = localStorage.getItem("authToken") || "";
    const [files, setFiles] = useState([]);

    if (type === "TOUR") {
        parkId = rowData.code;
        rowData = null;
    }

    if (rowData) {
        rowData["code"] = parkId;
    }

    const initialValues = {
        code: parkId,
        files: []
    };


    const checkoutSchema = yup.object().shape({
        code: yup.string().required("Bắt buộc phải điền"),
        files: yup.array().of(yup.mixed().required("Bắt buộc phải điền")).nullable(),
    });

    const handleFilesChange = (newFiles) => {
        setFiles(newFiles);
    };

    const fetchDataAddVtour = async (values) => {
        
        const formData = new FormData();
        // Append each file to the formData object
        Array.from(files).forEach((file, index) => {
            console.log('Appending file:', file); // Debugging: Log each file
            formData.append("files", file, file.name); // Change names dynamically
        });

        const apiEndpoint = type === 'IMAGE'
            ? `/vtour/add-image/${values.code}`
            : `/vtour/create-vtour/${values.code}`;

        const headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        };

        await Axios.post(apiEndpoint, formData, { headers })
            .then(response => {
                let responseData = response.data;

                if (responseData.code !== 200) {
                    Notification(responseData.message, "WARNING");
                    return;
                }
                Notification(responseData.message, "SUCCESS");
                onCloseForm();
            })
            .catch(error => {
                // message = response.message;
                console.error('Error:', error);
                Notification(error.response?.data?.message, "ERROR");
            });
    }
    const fetchDataUpdateVtour = async (values) => {

        const formData = new FormData();
        // Append each file to the formData object
        if (files && files.length > 0) {
            formData.append("image", files[0]); // Lấy file đầu tiên
        }

        let apiEndpoint = `/scene/update-scene/${values.code}/${values.sceneName}`;
        console.log(apiEndpoint);

        const headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        };

        await Axios.post(apiEndpoint, formData, { headers })
            .then(response => {
                let responseData = response.data;
                console.log(responseData);

                if (response.data.code !== 200) {
                    Notification(response.data.message, "WARNING");
                    return;
                }
                Notification(response.data.message, "SUCCESS");
                onCloseForm();
            })
            .catch(error => {
                // message = response.message;
                console.error('Error:', error);
                Notification(error.response.data.message, "ERROR");
            });
    }


    const handleFormSubmit = async (values) => {
        // debugger;
        if (disableCancel) {
            disableCancel(true);
        }
        setIsLoading(true);
        if (rowData) {
            await fetchDataUpdateVtour(values);
        } else {

            await fetchDataAddVtour(values);
        }
        setIsLoading(false);
        if (disableCancel) {
            disableCancel(false);
        }
        refresh();
    };

    return (
        <Box m="20px">
            <Header
                title={rowData ? "Chỉnh sửa ảnh 360" : "Thêm ảnh 360"}
                subtitle={rowData ? "Chỉnh sửa ảnh 360 của khu công nghiệp" : "Thêm ảnh vào khu công nghiệp"}
            />

            <Formik
                innerRef={formikRef}
                onSubmit={handleFormSubmit}
                initialValues={rowData || initialValues} // Nếu có rowData, form sẽ tự động điền
                validationSchema={checkoutSchema}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleBlur,
                    handleChange,
                    handleSubmit,
                    setFieldValue,
                }) => (
                    <form onSubmit={handleSubmit}>
                        <Box
                            display="grid"
                            gap="30px"
                            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
                            sx={{
                                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                            }}
                        >
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Mã khu công nghiệp"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.code || parkId}
                                name="code"
                                error={!!touched.name && !!errors.name}
                                helperText={touched.name && errors.name}
                                sx={{ gridColumn: "span 4" }}
                                disabled
                            />
                            {rowData ? (
                                <>
                                    <Box fullWidth>
                                        <FormLabel>
                                            Ảnh hiện tại
                                        </FormLabel>
                                        <img src={rowData.thumbUrl} alt="Ảnh hiện tại" style={{ maxWidth: '100%', height: 'auto' }} />
                                    </Box>

                                    <Box fullWidth>
                                        <FormLabel>Ảnh chỉnh sửa</FormLabel><br/>
                                        <FileChoosing
                                            setFieldValue={setFieldValue}
                                            multiple={false}
                                            onFilesChange={handleFilesChange}
                                        />
                                    </Box>
                                </>
                            ) :
                                <Box fullWidth>
                                    <FormLabel sx={{ fontWeight: 'bold', color: 'black' ,width:"200px"}}>Ảnh thêm mới </FormLabel> <span>(chỉ hỗ trợ thêm ảnh)</span>
                                    <FileChoosing
                                        setFieldValue={setFieldValue}
                                        multiple={true}
                                        onFilesChange={handleFilesChange}
                                    />
                                </Box>
                            }

                            {touched.files && errors.files && (
                                <Box sx={{ color: "red", gridColumn: "span 4" }}>
                                    {errors.files}
                                </Box>
                            )}
                        </Box>
                    </form>
                )}
            </Formik>

        </Box>
    );
};

export default AddVtourForm;
