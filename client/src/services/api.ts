import axios from 'axios';

const api = axios.create({ baseURL: ` http://localhost:3001/` });

// const api = axios.create({ baseURL: `https://noap-api.vercel.app/` });

api.interceptors.request.use(async config => {
    const token = localStorage.getItem('@NOAP:SYSTEM');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        const errorStatus = error?.response?.status;

        if ((errorStatus >= 500 && errorStatus <= 599)){
            console.log(error);
            //(500 - 599) = Server error responses
            return Promise.reject({ message: "Server error, please try again or later" });
        } 

        if(error?.code === "ERR_NETWORK")
            return Promise.reject({ message: "Connection to server failed, please verify your internet connection" });

        return Promise.reject(error?.response?.data);
    },
);

export default api;