import axios from 'axios';
import { refreshToken } from '../components/RefreshToken'; // Adjust this path to where `refreshToken` is located



// Create an Axios instance with the base URL
const Axios = axios.create({
  baseURL: 'http://localhost:8080/api', // replace with your actual API base URL
});

// Refresh token logic
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

Axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return Axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      return new Promise((resolve, reject) => {

        refreshToken()
          .then(success => {
            if (success) {
              const newToken = localStorage.getItem("authToken"); // Get the new access token from localStorage
              Axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
              originalRequest.headers['Authorization'] = 'Bearer ' + newToken;

              processQueue(null, newToken);
              resolve(Axios(originalRequest));
            } else {
              processQueue(new Error("Refresh token expired"), null);
              clearTokens();
              window.location.href = "/login";
              dispatchLogoutEvent();
              reject(error);
            }
          })
          .catch(err => {
            processQueue(err, null);
            clearTokens();
            window.location.href = "/login";
            dispatchLogoutEvent();
            reject(err);

          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export const clearTokens = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
};
const dispatchLogoutEvent = () => {
  const event = new CustomEvent("logoutToken");
  window.dispatchEvent(event);
};


export default Axios;
