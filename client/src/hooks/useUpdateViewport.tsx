import { Dispatch, SetStateAction, useEffect } from "react"; 

export default function useUpdateViewport (setter: Dispatch<SetStateAction<any>>, dalay: number) {
    useEffect(() => {
        const updateViewPortWidth = () => {
            setTimeout(() => {
                setter({width: window.innerWidth, height: window.innerHeight});
            }, dalay); 
        }
        
        window.addEventListener("resize", updateViewPortWidth);
        return () => window.removeEventListener("resize", updateViewPortWidth);
    }, []);
}