import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = ({
    username,
    password,
    error,
    loading,
    onUsernameChange,
    onPasswordChange,
    onSubmit,
}) => {
    return (
        <div className="login-background">
            <div className="login-card">
            <img src="/moneda.png" alt="Logo" className="login-logo" />
            <h2 className="login-title">BIENVENIDO</h2>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="USUARIO"
                            value={username}
                            onChange={onUsernameChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="CONTRASEÑA"
                            value={password}
                            onChange={onPasswordChange}
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="login-button">
                        {loading ? "Iniciando sesión..." : "INICIAR SESIÓN"}
                    </button>
                </form>

                <div className="login-links">
                    <p>¿No tienes una cuenta? <Link to="/users-create" className="link-bold">CREAR CUENTA</Link></p>
                    <p><Link to="/forgot-password" className="link-bold">¿Olvidaste tu contraseña?</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
