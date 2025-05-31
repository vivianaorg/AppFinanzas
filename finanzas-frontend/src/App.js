import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/home";
import UsersCreate from "./components/UsersCreate";
import MovimientosMensuales from "./components/Movimientos";
import ListadoIngresos from "./components/ListadoIngresos";
import ListadoGastos from "./components/ListadoGastos";
import PaginaAgregarTransaccion from './components/AgregarTransaccion';
import CategoriasUsuario from "./components/Categoria";
import AgregarAhorros from "./components/Ahorros"
import { Navigate } from "react-router-dom";
import Sidebar from "./components/react/Menu";
import './App.css';


function App() {
    const [user, setUser] = useState(localStorage.getItem("username") || null);

    const updateUser = (username) => {
        setUser(username);
        console.log("Usuario actualizado en App:", username);
    };

    const handleLogout = () => {
        console.log("Cerrando sesión...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        setUser(null);
        console.log("Sesión cerrada, redirigiendo al login...");
        window.location.href = "/login";
    };

    const isAuthenticated = () => {
        return user !== null;
    };

    return (
        <div className="App">
            <BrowserRouter>
                {isAuthenticated() ? (
                    <div className="app-container">
                        <Sidebar user={user} handleLogout={handleLogout} />
                        <div className="main-content">
                            <Routes>
                                <Route path="/" element={<Navigate to="/home" replace />} />
                                <Route path="/home" element={<Home user={user} handleLogout={handleLogout} />} />
                                <Route path="/users-create" element={<UsersCreate />} />
                                <Route path="/movimientos-mensuales" element={<MovimientosMensuales />} />
                                <Route path="/listado-ingresos" element={<ListadoIngresos />} />
                                <Route path="/listado-gastos" element={<ListadoGastos />} />
                                <Route path="/agregar" element={<PaginaAgregarTransaccion />} />
                                <Route path="/categorias" element={<CategoriasUsuario />} />
                                <Route path="/ahorros" element={<AgregarAhorros />} />
                            </Routes>
                        </div>
                    </div>
                ) : (
                    <Routes>
                        <Route path="/login" element={<Login updateUser={updateUser} />} />
                        <Route path="/users-create" element={<UsersCreate />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>

                )}
            </BrowserRouter>

        </div>
    );
}

export default App;