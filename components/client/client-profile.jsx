"use client";

import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone } from "lucide-react";
import Image from "next/image";

export function ClientProfile() {
  const user = useSelector((state) => state.user.data);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Actualizar Redux en tiempo real
    dispatch(updateUser({ [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user) {
      const updates = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };
      // Aquí guardarías en BD si lo deseas
      fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          dispatch(updateUser(data));
          setIsEditing(false);
        })
    }
  };

  // Generar foto de Gmail basada en email
  const getGmailAvatar = (email) => {
    if (!email) return null;
    return `https://www.gravatar.com/avatar/${email}?d=identicon&s=64`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mi Perfil</h2>
        <p className="text-muted-foreground">Administra tu información personal</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Datos de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center mb-4">
                <Image
                  src={getGmailAvatar(user?.email)}
                  alt="Foto de perfil"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-[#1a4d6d] hover:bg-[#2d6a8f]">
                  Guardar Cambios
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || "",
                      email: user?.email || "",
                      phone: user?.phone || "",
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <Image
                  src={getGmailAvatar(user?.email)}
                  alt="Foto de perfil"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{user?.phone || "No especificado"}</p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} className="w-full bg-[#1a4d6d] hover:bg-[#2d6a8f]">
                Editar Perfil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 

