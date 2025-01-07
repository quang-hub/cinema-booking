// showAlertDialog.js
import React from 'react';
import ReactDOM from 'react-dom';
import AlertDialog from './AlertDialog';

const showAlertDialog = (message) => {
    return new Promise((resolve) => {
        const div = document.createElement('div');
        document.body.appendChild(div);

        const handleClose = (confirmed) => {
            resolve(confirmed);  // Resolves the promise with true/false based on user action
            ReactDOM.unmountComponentAtNode(div); // Clean up by unmounting the component
            div.remove(); // Remove the div from the DOM
        };

        ReactDOM.render(
            <AlertDialog
                open={true}
                message={message}
                onClose={handleClose}  // Pass handleClose function to AlertDialog
            />,
            div
        );
    });
};

export default showAlertDialog;
