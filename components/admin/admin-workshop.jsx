"use client";

import React from "react";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, Phone, Mail } from "lucide-react";

export function AdminWorkshop() {
  const [workshop, setWorkshop] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    loadWorkshop();
  }, []);

  const loadWorkshop = () => {
    const data = db.getWorkshop();
    setWorkshop(data);
    setFormData({
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (workshop) {
      db.updateWorkshop({
        ...workshop,
        ...formData,
      });
      setIsEditing(false);
      loadWorkshop();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración del Taller</h2>
        <p className="text-muted-foreground">Información y configuración del taller</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Taller</CardTitle>
            <CardDescription>Datos generales del negocio</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Taller</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-[#1a4d6d] hover:bg-[#2d6a8f]">
                    Guardar Cambios
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{workshop?.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-medium">{workshop?.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{workshop?.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{workshop?.email}</p>
                  </div>
                </div>
                <Button onClick={() => setIsEditing(true)} className="w-full bg-[#1a4d6d] hover:bg-[#2d6a8f]">
                  Editar Información
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Turnos</CardTitle>
            <CardDescription>Gestión de citas y disponibilidad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">Capacidad</h4>
              <p className="text-sm text-muted-foreground">
                Actualmente el taller puede atender <strong>1 cliente por día</strong> ya que hay un solo chapero disponible.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">Tiempo de Trabajo</h4>
              <p className="text-sm text-muted-foreground">
                Cada trabajo tarda entre <strong>1 y 2 días</strong> en completarse.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 

