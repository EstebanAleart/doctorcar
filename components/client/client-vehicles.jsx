"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Car, Plus } from "lucide-react";

export function ClientVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    plate: "",
    color: "",
  });

  useEffect(() => {
    if (user) {
      loadVehicles();
    }
  }, [user]);

  const loadVehicles = () => {
    if (user) {
      const userVehicles = db.getVehiclesByClient(user.id);
      setVehicles(userVehicles);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user) {
      db.createVehicle({
        clientId: user.id,
        ...formData,
      });
      resetForm();
      loadVehicles();
    }
  };

  const resetForm = () => {
    setFormData({
      brand: "",
      model: "",
      year: "",
      plate: "",
      color: "",
    });
    setShowDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Vehículos</h2>
          <p className="text-muted-foreground">Gestiona los vehículos registrados</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-[#1a4d6d] hover:bg-[#2d6a8f]">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Vehículo
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-[#1a4d6d]" />
                {vehicle.brand} {vehicle.model}
              </CardTitle>
              <CardDescription>Patente: {vehicle.plate}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Año:</span>
                <span className="font-medium">{vehicle.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color:</span>
                <span className="font-medium">{vehicle.color}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {vehicles.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="flex flex-col h-32 items-center justify-center text-muted-foreground">
              <Car className="h-12 w-12 mb-2 text-muted-foreground/50" />
              <p>No tienes vehículos registrados</p>
            </CardContent>
          </Card>
        )}
      </div>
      <Dialog open={showDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Vehículo</DialogTitle>
            <DialogDescription>Registra un nuevo vehículo en tu cuenta</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ej: Chevrolet, Ford, Toyota"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Ej: Cruze, Focus, Corolla"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Input
                id="year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="Ej: 2020"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plate">Patente</Label>
              <Input
                id="plate"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                placeholder="Ej: ABC123"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Ej: Blanco, Negro, Rojo"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-[#1a4d6d] hover:bg-[#2d6a8f]">
                Agregar Vehículo
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 

