import axios from 'axios';

const config =  { host: 'localhost', port: 3001 };
const { host, port } = config;

const api = axios.create({ baseURL: ` http://${host}:${port}/` });

// const api = axios.create({ baseURL: `https://noap-typescript-api.vercel.app/` });

api.interceptors.request.use(async config => {
    const token = localStorage.getItem('user_token');

    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        const errorStatus = error?.response?.status;

        if(error.message === "Request aborted")
            return Promise.reject({ message: "Refetching error, please try again or later" });

        if ((errorStatus >= 500 && errorStatus <= 599)) //(500 - 599) = Server error responses
            return Promise.reject({ message: "Server error, please try again or later" });

        if(error?.code === "ERR_NETWORK")
            return Promise.reject({ message: "Connection to server failed, please verify your internet connection" });

        return Promise.reject(error?.response?.data);
    },
);

export default api;