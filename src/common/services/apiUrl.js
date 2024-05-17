import axios from "axios";

const http = axios.create({
  apiUrl: "http://localhost:8080",
});

http.interceptors.request.use(
  (config) => {
    if (config.url === "http://localhost:3000/") {
      return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default {
  get: (url, config) => http.get(url, config),
  post: (url, config) => http.post(url, config),
  put: (url, config) => http.put(url, config),
  delete: (url, config) => http.delete(url, config),
};
