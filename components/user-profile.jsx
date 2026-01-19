"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Camera } from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";

export function UserProfile() {
  const { user: authUser } = useAuth();
  const reduxUserData = useSelector((state) => state.user?.data);
  // reduxUserData tiene estructura { user: {...}, isAuthenticated: true }
  const user = reduxUserData?.user || authUser;
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Update formData when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      await Swal.fire({
        title: "Archivo muy grande",
        text: "La imagen no puede superar los 5MB",
        icon: "warning",
        confirmButtonColor: "#1a4d6d",
      });
      return;
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      await Swal.fire({
        title: "Tipo inválido",
        text: "Solo se permiten imágenes",
        icon: "warning",
        confirmButtonColor: "#1a4d6d",
      });
      return;
    }

    try {
      setUploadingImage(true);

      // Crear FormData con el archivo
      const formData = new FormData();
      formData.append("file", file);

      // Subir a Cloudinary via API
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!uploadRes.ok) {
        throw new Error("Error al subir imagen");
      }

      const { secure_url } = await uploadRes.json();

      // Actualizar perfil con nueva URL
      const updateRes = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_image: secure_url }),
        credentials: "include",
      });

      if (updateRes.ok) {
        const updatedUser = await updateRes.json();
        dispatch(updateUser({ user: updatedUser }));
        await Swal.fire({
          title: "¡Imagen actualizada!",
          text: "Tu foto de perfil ha sido actualizada",
          icon: "success",
          confirmButtonColor: "#1a4d6d",
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: "No se pudo subir la imagen",
        icon: "error",
        confirmButtonColor: "#1a4d6d",
      });
    } finally {
      setUploadingImage(false);
    }
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
        const updatedUser = await response.json();
        // PATCH devuelve el usuario directamente, no { user: {...} }
        // Actualizar Redux con la estructura correcta
        dispatch(updateUser({ user: updatedUser }));
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

  // Generar foto de avatar basada en email o usar profile_image
  const getAvatar = (user) => {
    // Si tiene profile_image personalizada, usarla
    if (user?.profile_image) {
      return user.profile_image;
    }
    // Si no, usar Gravatar basado en email
    if (!user?.email) return null;
    return `https://www.gravatar.com/avatar/${user.email}?d=identicon&s=200`;
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
              <div className="relative flex justify-center mb-4">
                <Image
                  src={getAvatar(user)}
                  alt="Foto de perfil"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
                <label 
                  htmlFor="profile-image-input"
                  className="absolute bottom-0 right-[calc(50%-50px)] cursor-pointer"
                >
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    disabled={uploadingImage}
                    className="h-8 w-8 rounded-full"
                    asChild
                  >
                    <span>
                      <Camera className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
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
                  src={getAvatar(user)}
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
