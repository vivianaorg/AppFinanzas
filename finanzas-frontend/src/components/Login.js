import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { saveAuthTokens } from "./auth"; // Asegúrate de que la ruta sea correcta

const Login = ({ updateUser }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validación básica
        if (!username || !password) {
            setError("Todos los campos son obligatorios");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
                username,
                password,
            });

            if (response.data.access) {
                // Usar el servicio centralizado para guardar tokens
                saveAuthTokens(
                    response.data.access,
                    response.data.refresh,
                    username
                );
                
                // Actualizar el estado del usuario en el componente padre
                updateUser(username);
                
                // Redirigir al usuario
                navigate("/home");
            } else {
                setError("No se recibió un token de acceso válido.");
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 401) {
                    setError("Credenciales incorrectas. Inténtalo de nuevo.");
                } else {
                    setError(`Error (${err.response.status}): ${
                        err.response.data.detail || "Ha ocurrido un error durante el inicio de sesión."
                    }`);
                }
            } else {
                setError("No se pudo conectar con el servidor. Verifique su conexión a internet.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2 className="montserrat-font">Iniciar Sesión</h2>
                
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label htmlFor="username" className="form-label">Usuario:</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="form-group mb-3">
                        <label htmlFor="password" className="form-label">Contraseña:</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </button>
                </form>
                
                <p className="mt-3">¿No tienes una cuenta? <Link to="/users-create">Crear cuenta</Link></p>
            </div>
        </div>
    );
};

export default Login;