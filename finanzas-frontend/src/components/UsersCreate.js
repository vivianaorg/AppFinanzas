import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import UsersCreateForm from "./react/UsersCreateForm";

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
        <UsersCreateForm
            username={username}
            email={email}
            password={password}
            error={error}
            success={success}
            loading={false}
            onUsernameChange={(e) => setUsername(e.target.value)}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleSubmit}
        />

    );
};

export default UsersCreate;
