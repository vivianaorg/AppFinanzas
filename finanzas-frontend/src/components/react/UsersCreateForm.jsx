// UsersCreateForm.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Login.css"; // Puedes usar el mismo archivo CSS o crear uno nuevo si prefieres separarlo

const UsersCreateForm = ({
    username,
    email,
    password,
    error,
    success,
    loading,
    onUsernameChange,
    onEmailChange,
    onPasswordChange,
    onSubmit,
}) => {
    return (
        <div className="login-background">
            <div className="login-card">
                <img src="/moneda.png" alt="Logo" className="login-logo" />
                <h2 className="login-title">CREAR CUENTA</h2>

                {error && <div className="login-error">{error}</div>}
                {success && <div className="login-success">{success}</div>}

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
                            type="email"
                            placeholder="EMAIL"
                            value={email}
                            onChange={onEmailChange}
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
                        {loading ? "Registrando..." : "REGISTRARSE"}
                    </button>
                </form>

                <div className="login-links">
                    <p>¿Ya tienes una cuenta? <Link to="/login" className="link-bold">INICIAR SESIÓN</Link></p>
                </div>
            </div>
        </div>
    );
};

export default UsersCreateForm;
