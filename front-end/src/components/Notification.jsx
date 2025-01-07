
import { toast } from "react-toastify";

export default function Notification(message, type) {
    if (type === "SUCCESS") {
        toast.success(message, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover:
                true,
            draggable: true,
            theme:
                "light",
        });
    } else if (type === "ERROR") {
        toast.error(message, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover:
                true,
            draggable: true,
            theme: "light",
        });
    } else
        if (type === "WARNING") {
            toast.warning(message, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover:
                    true,
                draggable: true,
                theme: "light",
            });
        }
}