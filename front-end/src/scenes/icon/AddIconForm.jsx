import { Box, Button, TextField, Typography, DialogActions, Dialog, DialogContent, DialogTitle, FormControlLabel, FormHelperText, Checkbox } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Axios from "../../components/Axios";
import { useState } from "react";
import Notification from "../../components/Notification";
import { LoadingButton } from "@mui/lab";
import SpriteAnimation from "./SpriteAniamtion";

const AddIconForm = ({ refresh, onCloseForm, type }) => {
    const isNonMobile = useMediaQuery("(min-width:600px)");
    const token = localStorage.getItem("authToken") || "";
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorFile, setErrorFile] = useState(null);
    const [frameWidth, setFrameWidth] = useState(120);
    const [frameHeight, setFrameHeight] = useState(112);
    const [frameRate, setFrameRate] = useState(4);
    const acceptTypes = type === "VIDEO" ? ".mp4" : ".jpeg, .png, .jpg";

    const AddIcon = async (values) => {
        if (!selectedFile) {
            setErrorFile("Phải nhập trường này");
            return
        }
        setIsLoading(true);
        const formData = new FormData();
        const data = {
            name: values.name,
            type: type,
            iconType: type === "ICON" ? values.moving ? "DYNAMIC" : "STATIC" : null
        };
        if (values.moving) {
            data["frameWidth"] = frameWidth;
            data["frameHeight"] = frameHeight;
            data["frameRate"] = frameRate;
        }
        console.log(data);

        formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

        // Append the file to formData if selected
        formData.append('file', selectedFile);


        const apiEndpoint = `/hotspot-resource/create?type=${type}`;
        const headers = { 'Authorization': `Bearer ${token}` };


        try {
            const response = await Axios.post(apiEndpoint, formData, { headers });
            const responseData = response.data;
            console.log(responseData);

            if (responseData.code !== 200) {
                Notification(responseData.message, "WARNING");
                return;
            }
            Notification(responseData.message, "SUCCESS");
            refresh();
            onCloseForm();
        } catch (error) {
            console.error('Error:', error);
            Notification(error.response?.data?.message, "WARNING");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        const validVideoTypes = ["video/mp4"];
        const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];

        if (selectedFile) {
            const isValidFile = type === "VIDEO"
                ? validVideoTypes.includes(selectedFile.type)
                : validImageTypes.includes(selectedFile.type);

            if (!isValidFile) {
                setSelectedFile(null);
                setPreview(null);
                setErrorFile("File không đúng định dạng");
                Notification("File không đúng định dạng", "WARNING");
                return;
            }
            setErrorFile(null);
            setSelectedFile(selectedFile);
            const fileUrl = URL.createObjectURL(selectedFile);
            setPreview(fileUrl);
        }
    };

    return (
        <Dialog open={true} onClose={onCloseForm} maxWidth="md" fullWidth>
            <DialogTitle>{type === "VIDEO" ? "Thêm video" : "Thêm icon"}</DialogTitle>
            <Formik
                onSubmit={AddIcon}  // Formik will trigger this on submit
                initialValues={initialValues}
                validationSchema={checkoutSchema}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleBlur,
                    handleChange,
                    handleSubmit,
                }) => (
                    <form onSubmit={handleSubmit}>

                        <DialogContent>

                            <Header title={type === "VIDEO" ? "Thêm video" : "Thêm icon"} />


                            <Box
                                display="grid"
                                gap="30px"
                                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                                sx={{ "& > div": { gridColumn: isNonMobile ? undefined : "span 4" } }}
                            >
                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="text"
                                    label={
                                        <span>
                                            Tên<span style={{ color: 'red' }}>(*)</span>
                                        </span>
                                    }
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.name}
                                    name="name"
                                    error={!!touched.name && !!errors.name}
                                    helperText={touched.name && errors.name}
                                    sx={{ gridColumn: "span 4" }}
                                />


                                {type === "ICON" &&
                                    <>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={values.moving}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    name="moving"
                                                />
                                            }
                                            label="Ảnh động"
                                        />
                                        <FormHelperText error={!!touched.moving && !!errors.moving}>
                                            {touched.moving && errors.moving}
                                        </FormHelperText>
                                        {values.moving &&
                                            (<>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    type="number"
                                                    label={
                                                        <span>
                                                            Độ rộng khung hình<span style={{ color: 'red' }}>(*)</span>
                                                        </span>
                                                    }
                                                    onChange={(e) => setFrameWidth(e.target.value !== "" ? e.target.value : "1")}
                                                    value={frameWidth}
                                                    name="frameWidth"
                                                    sx={{ gridColumn: "span 4" }}
                                                    inputProps={{
                                                        min: 1,
                                                        max: 10000
                                                    }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    type="number"
                                                    label={
                                                        <span>
                                                            Độ cao khung hình<span style={{ color: 'red' }}>(*)</span>
                                                        </span>
                                                    }
                                                    onChange={(e) => setFrameHeight(e.target.value !== "" ? e.target.value : "1")}
                                                    value={frameHeight}
                                                    name="frameHeight"
                                                    sx={{ gridColumn: "span 4" }}
                                                    inputProps={{
                                                        min: 1,
                                                        max: 10000
                                                    }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    type="number"
                                                    label={
                                                        <span>
                                                            Số khung hình trên giây<span style={{ color: 'red' }}>(*)</span>
                                                        </span>
                                                    }
                                                    onChange={(e) => setFrameRate(e.target.value !== "" ? e.target.value : "1")}
                                                    value={frameRate}
                                                    name="frameRate"
                                                    sx={{ gridColumn: "span 4" }}
                                                    inputProps={{
                                                        min: 1,
                                                        max: 10000
                                                    }}
                                                />
                                            </>)
                                        }
                                    </>
                                }




                                <TextField
                                    fullWidth
                                    variant="filled"
                                    type="file"
                                    onBlur={handleBlur}
                                    onChange={handleFileChange}
                                    name="file"
                                    sx={{ gridColumn: "span 4" }}
                                    accept={acceptTypes}
                                />
                                {errorFile &&
                                    <span style={{ color: '#E4080A' }}>{errorFile}</span>
                                }

                                {preview && (
                                    <>
                                        <Typography variant="subtitle1">Bản xem trước:</Typography>
                                        <Box sx={{ width: '250px', mt: 2, display: 'flex', flexDirection: 'column' }}>
                                            {type === "VIDEO" ? (
                                                <video
                                                    src={preview}
                                                    controls
                                                    style={{ width: '100%', maxHeight: '500px', marginTop: '8px' }}
                                                />
                                            ) : (
                                                values.moving ?
                                                    (
                                                        <Box sx={{ backgroundColor: "gray" }}>
                                                    <SpriteAnimation
                                                        imageUrl={preview}
                                                        frameWidth={frameWidth}
                                                        frameHeight={frameHeight}
                                                        frameRate={frameRate}
                                                    />
                                                </Box>
                                                    ): ( <img
                                                        src={preview}
                                                        alt="Preview"
                                                        style={{ width: '100%', maxHeight: '400px', marginTop: '8px', backgroundColor: "gray" }}
                                                    />
                                                )
                                            )}
                                        </Box>
                                    </>
                                )}
                            </Box>

                        </DialogContent>
                        <DialogActions>
                            <LoadingButton
                                type="submit"
                                color="secondary"
                                variant="contained"
                                loading={isLoading}
                                onClick={handleSubmit} // Triggers form submit
                            >
                                {type === "VIDEO" ? "Thêm video" : "Thêm icon"}
                            </LoadingButton>
                            <Button onClick={onCloseForm} color="primary">
                                Hủy
                            </Button>
                        </DialogActions>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

const checkoutSchema = yup.object().shape({
    name: yup.string().required("Phải nhập trường này").max(255, "Tên không được vượt quá 255 ký tự"),
});

const initialValues = {
    name: "",
    moving: false,
    file: null, // Add file to initial values
};

export default AddIconForm;
