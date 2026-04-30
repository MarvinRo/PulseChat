import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LoginScreen from '../renderer/screens/LoginScreen';
import RegisterScreen from '../renderer/screens/RegisterScreen';
import HomeScreen from '../renderer/screens/HomeScreen';
import ForgotPasswordScreen from '../renderer/screens/ForgotPasswordScreen';

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/forgot_password" element={<ForgotPasswordScreen />} />
      </Routes>
    </HashRouter>
  );
}