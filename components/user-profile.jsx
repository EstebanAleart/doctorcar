"use client";

import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";

export function UserProfile() {
  const { user: authUser } = useAuth();
  const reduxUser = useSelector((state) => state.user?.data);
  const user = reduxUser || authUser;
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      await Swal.fire({
        title: "Campo requerido",
        text: "El nombre no puede estar vacío",
        icon: "warning",
        confirmButtonColor: "#1a4d6d",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(updateUser(data));
        await Swal.fire({
          title: "¡Actualizado!",
          text: "Tu perfil ha sido actualizado correctamente",
          icon: "success",
          confirmButtonColor: "#1a4d6d",
        });
        setIsEditing(false);
      } else {
        const error = await response.json();
        await Swal.fire({
          title: "Error",
          text: error.error || "Error al actualizar el perfil",
          icon: "error",
          confirmButtonColor: "#1a4d6d",
        });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      await Swal.fire({
        title: "Error",
        text: "Error al conectar con el servidor",
        icon: "error",
        confirmButtonColor: "#1a4d6d",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generar foto de avatar basada en email
  const getAvatar = (email) => {
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
                  src={getAvatar(user?.email)}
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
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-[#1a4d6d] hover:bg-[#2d6a8f]"
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
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
                  src={getAvatar(user?.email)}
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
                  <p className="font-medium">{user?.name || "Nombre no especificado"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || "Email no especificado"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{user?.phone || "No especificado"}</p>
                </div>
              </div>
              <Button 
                onClick={() => setIsEditing(true)} 
                className="w-full bg-[#1a4d6d] hover:bg-[#2d6a8f]"
              >
                Editar Perfil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
