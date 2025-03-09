import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const UsersCreate = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!username || !email || !password) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/register/", {
                username,
                email,
                password,
            });

            setSuccess("Usuario creado exitosamente. Redirigiendo a login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            if (err.response) {
                setError("Error al crear usuario: " + JSON.stringify(err.response.data));
            } else {
                setError("No se pudo conectar con el servidor.");
            }
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h2>Crear Cuenta</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email:</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password:</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-success">Registrarse</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <p>¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link></p>
            </div>
        </div>
    );
};

export default UsersCreate;
