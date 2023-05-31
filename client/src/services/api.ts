import axios from 'axios';

// const config =  { host: 'localhost', port: 3001 };
// const { host, port } = config;

// const api = axios.create({ baseURL: ` http://${host}:${port}/` });

const api = axios.create({ baseURL: `https://noap-typescript-api.vercel.app/` });

api.interceptors.request.use(async config => {
    const token = localStorage.getItem('user_token');

    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if(error.message === "Request aborted")
            return Promise.reject({ message: "Refetching error, please try again or later" });

        if (!error.response)
            return Promise.reject({ message: "Error, please try again or later" });

        return Promise.reject(error.response.data);
    },
);

export default api;