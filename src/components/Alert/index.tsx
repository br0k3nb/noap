import Swal, { SweetAlertIcon, SweetAlertPosition } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import './index.css';

const MySwal = withReactContent(Swal);

type AlertProps = {
    icon?: SweetAlertIcon;
    iconColor?: string;
    title: string;
    text?: string;
    timer: number;
    confirmButton?: boolean;
    escape?: boolean;
    enter?: boolean;
    outClick?: boolean;
    position?: SweetAlertPosition;
}

export function alert ({ icon, iconColor, title, text, timer, confirmButton, escape, enter, outClick }: AlertProps) {

    return (
        MySwal.fire({
            icon: icon,
            iconColor: iconColor,
            title: title,
            text: text,
            showConfirmButton: confirmButton === undefined ? (false) : confirmButton,
            timer: timer,
            timerProgressBar: true,
            hideClass: { popup: "animate__animated animate__fadeOutUp" },
            allowEscapeKey: escape === undefined ? (false) : escape,
            allowEnterKey: enter === undefined ? (false) : enter,
            allowOutsideClick: outClick === undefined ? (false) : outClick,
        })
    )
}

export function toastAlert ({ icon, title, text, timer, confirmButton, position }: AlertProps) {
    return (
        MySwal.fire({
            icon: icon,
            title: title,
            text: text,
            toast: true,
            showConfirmButton: confirmButton === undefined ? (false) : confirmButton,
            position: position !== undefined ? (position): 'bottom-right',
            customClass: { 
                popup: 'colored-toast dark:!bg-[#181818] !bg-[#eaeaea] dark:!text-white !text-gray-900 xxs:!w-80 xxs:!text-sm',
            },
            timer: timer,
            timerProgressBar: true
        })
    )
}