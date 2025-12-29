"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Upload, X, Building2, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClientNewClaim({ onSuccess }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [claimType, setClaimType] = useState("particular");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState();

  useEffect(() => {
    if (user) {
      const userVehicles = db.getVehiclesByClient(user.id);
      setVehicles(userVehicles);
    }
  }, [user]);

  const handlePhotoUpload = (e) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !selectedVehicle || !appointmentDate) return;
    db.createClaim({
      clientId: user.id,
      vehicleId: selectedVehicle,
      type: claimType,
      companyName: claimType === "company" ? companyName : undefined,
      description,
      photos,
      status: "pending",
      appointmentDate: appointmentDate.toISOString(),
    });
    // Reset form
    setClaimType("particular");
    setSelectedVehicle("");
    setCompanyName("");
    setDescription("");
    setPhotos([]);
    setAppointmentDate(undefined);
    onSuccess();
  };

  const isFormValid =
    selectedVehicle &&
    description &&
    photos.length > 0 &&
    appointmentDate &&
    (claimType === "particular" || companyName);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Nuevo Reclamo</h2>
        <p className="text-muted-foreground">Solicita un servicio de reparación para tu vehículo</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Reclamo</CardTitle>
            <CardDescription>Selecciona si es particular o contra una compañía de seguros</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={claimType} onValueChange={(value) => setClaimType(value)}>
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <RadioGroupItem value="particular" id="particular" />
                <Label htmlFor="particular" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-[#1a4d6d]" />
                    <div>
                      <div className="font-medium">Particular</div>
                      <div className="text-sm text-muted-foreground">Pago directo sin intermediarios</div>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#1a4d6d]" />
                    <div>
                      <div className="font-medium">Compañía de Seguros</div>
                      <div className="text-sm text-muted-foreground">Reclamo contra una aseguradora</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        {claimType === "company" && (
          <Card>
            <CardHeader>
              <CardTitle>Información de la Compañía</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de la Compañía de Seguros</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej: Federación Patronal, etc."
                  required={claimType === "company"}
                />
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Información del Vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Selecciona tu vehículo</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} {vehicle.year} - {vehicle.plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {vehicles.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Primero debes agregar un vehículo en la sección "Mis Vehículos"
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Descripción del Daño</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Describe el problema o daño</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe detalladamente los daños o el trabajo que necesitas..."
                rows={5}
                required
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fotos del Daño</CardTitle>
            <CardDescription>Sube fotos claras de los daños (mínimo 1 foto requerida)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="photos" className="cursor-pointer">
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click para subir fotos</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG (máx. 5MB cada una)</p>
                  </div>
                </div>
              </Label>
              <Input id="photos" type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fecha de Turno</CardTitle>
            <CardDescription>
              Solo se puede atender un cliente por día. Elige una fecha disponible para tu turno.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !appointmentDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {appointmentDate ? format(appointmentDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={appointmentDate}
                  onSelect={setAppointmentDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
        <Button type="submit" className="w-full bg-[#1a4d6d] hover:bg-[#2d6a8f]" disabled={!isFormValid}>
          Enviar Reclamo
        </Button>
      </form>
    </div>
  );
}

