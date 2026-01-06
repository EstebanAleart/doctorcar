"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Car, Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export function ClientVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const loadVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      } else {
        console.error('Error loading vehicles');
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingVehicle ? `/api/vehicles/${editingVehicle}` : '/api/vehicles';
      const method = editingVehicle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        resetForm(); // Cerrar dialog primero
        await Swal.fire({
          title: '¡Éxito!',
          text: editingVehicle ? 'Vehículo actualizado correctamente' : 'Vehículo agregado correctamente',
          icon: 'success',
          confirmButtonColor: '#1a4d6d',
          confirmButtonText: 'Aceptar',
        });
        loadVehicles();
      } else {
        const error = await response.json();
        resetForm(); // Cerrar dialog primero
        await Swal.fire({
          title: 'Error',
          text: error.error === 'Plate already exists' 
            ? 'Esta patente ya está registrada en el sistema' 
            : error.error || `Error al ${editingVehicle ? 'actualizar' : 'agregar'} vehículo`,
          icon: 'error',
          confirmButtonColor: '#1a4d6d',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      resetForm(); // Cerrar dialog primero
      await Swal.fire({
        title: 'Error',
        text: 'Error al conectar con el servidor',
        icon: 'error',
        confirmButtonColor: '#1a4d6d',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle.id);
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.toString(),
      plate: vehicle.plate,
      color: vehicle.color,
    });
    setShowDialog(true);
  };

  const handleDelete = async (vehicleId, vehicleName) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el vehículo ${vehicleName}. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#1a4d6d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          await Swal.fire({
            title: '¡Eliminado!',
            text: 'El vehículo ha sido eliminado correctamente',
            icon: 'success',
            confirmButtonColor: '#1a4d6d',
            confirmButtonText: 'Aceptar',
          });
          loadVehicles();
        } else {
          const error = await response.json();
          await Swal.fire({
            title: 'Error',
            text: error.error || 'Error al eliminar vehículo',
            icon: 'error',
            confirmButtonColor: '#1a4d6d',
            confirmButtonText: 'Aceptar',
          });
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        await Swal.fire({
          title: 'Error',
          text: 'Error al conectar con el servidor',
          icon: 'error',
          confirmButtonColor: '#1a4d6d',
          confirmButtonText: 'Aceptar',
        });
      }
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
    setEditingVehicle(null);
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-[#1a4d6d]" />
                  <div>
                    <CardTitle className="text-lg">
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription>Patente: {vehicle.plate}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(vehicle)}
                    className="h-8 w-8 text-[#1a4d6d] hover:bg-[#1a4d6d]/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(vehicle.id, `${vehicle.brand} ${vehicle.model}`)}
                    className="h-8 w-8 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
              <Button type="submit" className="flex-1 bg-[#1a4d6d] hover:bg-[#2d6a8f]" disabled={loading}>
                {loading ? 'Agregando...' : 'Agregar Vehículo'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 

