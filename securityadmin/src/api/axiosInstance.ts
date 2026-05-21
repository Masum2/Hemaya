import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://pechangatesthemaiya.azurewebsites.net',
    withCredentials: true,
    headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
    }
});

export default axiosInstance;