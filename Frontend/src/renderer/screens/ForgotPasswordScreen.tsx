import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { icons } from "@/components/SVG";


export default function LoginScreen() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="flex h-screen w-full bg-[#131313] items-center justify-center flex-col">
            <img src="../../public/assets/logo.png" alt="Logo do Pulse Chat" className="w-28 mb-2" />
            <div className="flex items-center justify-center flex-col">
                <h1 className="text-white text-[40px]">Pulse</h1>
                <p className="text-white mb-8">Welcome back. Please sign in to continue.</p>
            </div>
            <div className="bg-neutral-900 min-w-[45%] p-8 rounded-lg shadow-lg border-[#2c2c2c] border">
                <Label className="text-white mb-2">Email</Label>
                <div className="relative mb-4">
                    <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]"
                        dangerouslySetInnerHTML={{ __html: icons.email }}
                    />
                    <Input placeholder="Email" type="email" className="w-full pl-12 border-[#2f3134] border bg-[#2a2a2a] text-white" />
                </div>                
                <Button className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white cursor-pointer" onClick={() => navigate('/home')}>Enviar</Button>
            </div>

            <div>
                <p className="text-white mt-4">Retorne para o <span onClick={() => navigate('/')} className="text-[#5865f2] cursor-pointer hover:underline">Login</span></p>
            </div>
        </div>
    );
}