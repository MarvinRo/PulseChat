/* eslint-disable import/no-unresolved */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { icons } from "@/components/SVG";

export default function LoginScreen() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState("");

    const handleLogin = async () => {

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:3001/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);
                navigate("/home");
            } else {
                setError(data.error || "Erro ao tentar Logar no sistema.");
            }
        } catch (err) {
            setError("Erro de conexão com o servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#131313] items-center justify-center flex-col">
            <img src="../../public/assets/logo.png" alt="Logo do Pulse Chat" className="w-28 mb-2" />
            <div className="flex items-center justify-center flex-col">
                <h1 className="text-white text-[40px]">Pulse</h1>
                <p className="text-white mb-8">Bem-vindo de volta. Por favor, faça login para continuar.</p>
            </div>
            <div className="bg-neutral-900 min-w-[45%] p-8 rounded-lg shadow-lg border-[#2c2c2c] border">
                <Label className="text-white mb-2">Email</Label>
                <div className="relative mb-4">
                    <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]"
                        dangerouslySetInnerHTML={{ __html: icons.email }}
                    />
                    <Input 
                    placeholder="Email" 
                    type="email" 
                    value={email} 
                    className="w-full pl-12 border-[#2f3134] border bg-[#2a2a2a] text-white" 
                    onChange={(e)=>setEmail(e.target.value)}/>
                </div>
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">Senha</Label>
                    <span className="text-[#5865f2] cursor-pointer" onClick={() => navigate('/forgot_password')}>Esqueceu sua senha?</span>
                </div>

                <div className="relative mb-4">
                    <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]"
                        dangerouslySetInnerHTML={{ __html: icons.key }}
                    />
                    <Input
                        placeholder="Senha"
                        type={showPassword ? "text" : "password"}
                        className="w-full pl-12 border-[#2f3134] border bg-[#2a2a2a] text-white"
                        onChange={(e)=>setPassword(e.target.value)}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#9aa0a6] hover:text-white cursor-pointer"
                    >
                        {showPassword ? <span dangerouslySetInnerHTML={{ __html: icons.open_eye }} /> : <span dangerouslySetInnerHTML={{ __html: icons.close_eye }} />}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                <Button 
                    className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white cursor-pointer disabled:opacity-50" 
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? "Entrando..." : "Entrar"}
                </Button>
                <div className="flex mt-8 items-center justify-center flex-row">
                    <div className="border border-[#2f3134] w-[20%]"></div>
                    <p className="text-white mx-2">Ou continue com</p>
                    <div className="border border-[#2f3134] w-[20%]"></div>
                </div>
                <Button className="w-full mt-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white flex items-center justify-center gap-2 cursor-pointer">
                    <span dangerouslySetInnerHTML={{ __html: icons.google }} className="flex items-center" />
                    Google
                </Button>
            </div>

            <div>
                <p className="text-white mt-4">Não tem uma conta? <span onClick={() => navigate('/register')} className="text-[#5865f2] cursor-pointer hover:underline">Registrar-se</span></p>
            </div>
        </div>
    );
}