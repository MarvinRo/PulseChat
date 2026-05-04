import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import HomeScreen from "./screens/HomeScreen";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginScreen />} />
                <Route path="/register" element={<RegisterScreen />} />
                <Route path="/forgot_password" element={<ForgotPasswordScreen />} />
                <Route path="/home" element={<HomeScreen />} />
            </Routes>
        </Router>
    );
}