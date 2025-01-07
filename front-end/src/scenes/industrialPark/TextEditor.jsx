import React, { useState } from 'react';
import ReactQuill from 'react-quill'; // Import component ReactQuill
import 'react-quill/dist/quill.snow.css'; // Import stylesheet cho Quill
import Axios from '../../components/Axios';
import Notification from '../../components/Notification';

const TextEditor = ({ rowData, onClose }) => {
    const [editorHtml, setEditorHtml] = useState(rowData.description); // Trạng thái để lưu nội dung

    let token = localStorage.getItem("authToken") || "";

    const handleChange = (html) => {
        setEditorHtml(html); // Cập nhật nội dung khi có thay đổi
    };

    const handleSubmit = () => {
        console.log("Nội dung đã gửi:", editorHtml);
        fetchDataUpdateIndustrialPark(editorHtml);
    };

    const fetchDataUpdateIndustrialPark = async (editorHtml) => {

        const apiEndpoint = '/industrial-park/update';

        rowData["description"] = editorHtml;
        const postData = {
            ...rowData
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Replace with your authorization header
        };
        await Axios.post(apiEndpoint, postData, { headers })
            .then(response => {
                // console.log(response.data);

                // setMessage(response.data.message);
                if (response.data.code !== 200) {
                    Notification(response.data.message, "WARNING");
                    return;
                }
                Notification(response.data.message, "SUCCESS");
                onClose();
            })
            .catch(error => {
                // message = response.message;
                console.error('Error:', error);
                Notification(error.response?.data?.message, "WARNING");
            });
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Chỉnh sửa nội dung</h2>
            <ReactQuill
                value={editorHtml}
                onChange={handleChange}
                theme="snow"
                style={{ height: '400px' }} // Đặt chiều cao cho trình soạn thảo
            />
            <br />
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button className='border border-color-300 text-green-500' onClick={handleSubmit}>Gửi nội dung</button>
            </div>
        </div>
    );
};

export default TextEditor;
