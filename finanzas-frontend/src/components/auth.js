import axios from "axios";

// Nombres consistentes para las claves de localStorage
const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh";
const USERNAME_KEY = "username";

// Función para guardar tokens después del login
export const saveAuthTokens = (accessToken, refreshToken, username) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USERNAME_KEY, username);
    
    // Configurar axios para usar el token en futuras peticiones
    setAuthHeader(accessToken);
};

// Configurar el encabezado de autorización para axios
export const setAuthHeader = (token) => {
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common["Authorization"];
    }
};

// Obtener el token actual
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

// Obtener el refresh token
export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
    return !!getToken();
};

// Eliminar tokens (logout)
export const clearAuthTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    
    // Eliminar encabezado de autorización
    delete axios.defaults.headers.common["Authorization"];
};

// Refrescar el token expirado
export const refreshToken = async () => {
    try {
        const refresh = getRefreshToken();
        
        if (!refresh) {
            console.log("No refresh token available");
            return false;
        }
        
        // Importante: Asegúrate de que no se envíe el token de autorización
        // para la solicitud de refresh
        const axiosInstance = axios.create();
        delete axiosInstance.defaults.headers.common["Authorization"];
        
        const response = await axiosInstance.post("http://127.0.0.1:8000/api/token/refresh/", {
            refresh: refresh
        });
        
        if (response.data && response.data.access) {
            // Guardar nuevo token y configurar header
            localStorage.setItem(TOKEN_KEY, response.data.access);
            setAuthHeader(response.data.access);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error("Error refreshing token:", error);
        // Si el refresh token ha expirado o es inválido, limpiar tokens
        if (error.response && error.response.status === 401) {
            clearAuthTokens();
        }
        return false;
    }
};

// Interceptor para manejo automático de refresh token
export const setupAxiosInterceptors = () => {
    // Remover interceptores anteriores para evitar duplicados
    axios.interceptors.response.eject(
        axios.interceptors.response.handlers[0]
    );
    
    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            
            // Si el error es 401 (no autorizado) y no es un intento de refresh
            // y no es una solicitud a la ruta de refresh
            if (
                error.response && 
                error.response.status === 401 && 
                !originalRequest._retry &&
                !originalRequest.url.includes("api/token/refresh/")
            ) {
                originalRequest._retry = true;
                
                // Intentar refrescar el token
                const refreshSuccessful = await refreshToken();
                
                if (refreshSuccessful) {
                    // Actualizar el token en la solicitud original
                    const newToken = getToken();
                    originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                    
                    // Reintentarla
                    return axios(originalRequest);
                } else {
                    // Si el refresh falló, limpiar tokens y redirigir a login
                    clearAuthTokens();
                    // Aquí podrías redirigir al login si tienes acceso al router
                    return Promise.reject(new Error("Sesión expirada"));
                }
            }
            
            return Promise.reject(error);
        }
    );
};

// Llamar a setupAxiosInterceptors al importar este módulo
setupAxiosInterceptors();