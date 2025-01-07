import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the Quill stylesheet

const QuillViewer = ({ htmlContent }) => {
    return (
        <div style={{ padding: '10px' }}>
            <ReactQuill
                value={htmlContent}
                readOnly={true}
                theme="bubble"
                style={{ height: 'auto', overflow: 'hidden' }} // Adjust the height if needed
            />
            <style jsx>{`
                .ql-editor h2 {
                    font-size: 1.5rem; // Adjust font size for h2
                    font-weight: bold;
                    margin: 1rem 0;
                }
                .ql-editor h3 {
                    font-size: 1.25rem; // Adjust font size for h3
                    font-weight: bold;
                    margin: 1rem 0;
                }
                .ql-editor h1 {
                    font-size: 2rem; // Size for h1
                    font-weight: bold;
                    margin: 1rem 0;
                }
                // Add more styles for other elements as needed
            `}</style>
        </div>
    );
};

export default QuillViewer;
