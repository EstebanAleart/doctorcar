"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { signIn } from "next-auth/react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, FileCheck, Clock, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  useEffect(() => {
    // Initialize database with demo data
    db.initialize();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <Image
                src="/images/whatsapp-20image-202025-12-29-20at-2000.jpeg"
                alt="DOCTORCAR"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-[#1a4d6d]">DOCTORCAR</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-[#1a4d6d] hover:text-[#6cb4d8]"
              onClick={() => signIn("auth0")}
            >
              Iniciar Sesión
            </Button>
            <Button 
              className="bg-[#1a4d6d] hover:bg-[#6cb4d8]"
              onClick={() => signIn("auth0")}
            >
              Registrarse
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-balance md:text-6xl">
            Reparación y pintura de vehículos{" "}
            <span className="text-[#1a4d6d]">rápida y confiable</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl text-pretty">
            Gestioná tus reclamos de forma simple. Subí fotos, recibí presupuestos y seguí el
            estado de tu vehículo en tiempo real. Trabajamos con particulares y compañías de
            seguros.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="bg-[#1a4d6d] hover:bg-[#6cb4d8]"
              onClick={() => signIn("auth0")}
            >
              Empezar Ahora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#1a4d6d] text-[#1a4d6d] hover:bg-[#1a4d6d] hover:text-white bg-transparent"
              onClick={() => signIn("auth0")}
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-balance md:text-4xl">
              ¿Por qué elegir <span className="text-[#1a4d6d]">DOCTORCAR</span>?
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Ofrecemos un servicio completo de chapa y pintura con seguimiento en línea
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Wrench className="mb-2 h-10 w-10 text-[#1a4d6d]" />
                <CardTitle>Reclamos Simples</CardTitle>
                <CardDescription>
                  Cargá fotos y datos de tu vehículo en minutos. Nosotros nos encargamos del resto.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <FileCheck className="mb-2 h-10 w-10 text-[#6cb4d8]" />
                <CardTitle>Presupuestos Detallados</CardTitle>
                <CardDescription>
                  Recibí presupuestos completos en PDF con el detalle de cada trabajo a realizar.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="mb-2 h-10 w-10 text-[#1a4d6d]" />
                <CardTitle>Seguimiento en Tiempo Real</CardTitle>
                <CardDescription>
                  Mirá el estado de tu reclamo en cualquier momento desde tu panel personal.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="mb-2 h-10 w-10 text-[#6cb4d8]" />
                <CardTitle>Trabajo con Seguros</CardTitle>
                <CardDescription>
                  Aceptamos reclamos directos de compañías de seguros. Gestionamos todo por vos.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CheckCircle className="mb-2 h-10 w-10 text-[#1a4d6d]" />
                <CardTitle>Profesionales Calificados</CardTitle>
                <CardDescription>
                  Nuestro equipo cuenta con años de experiencia en chapa, pintura y mecánica.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="mb-2 h-10 w-10 text-[#6cb4d8]" />
                <CardTitle>Turnos Organizados</CardTitle>
                <CardDescription>
                  Sistema de turnos para garantizar atención dedicada. Un trabajo por día, calidad
                  asegurada.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-balance md:text-4xl">¿Cómo funciona?</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Tres simples pasos para reparar tu vehículo
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a4d6d] text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Registrate</h3>
              <p className="text-muted-foreground">
                Creá tu cuenta y cargá los datos de tu vehículo en el sistema
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#6cb4d8] text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Creá tu Reclamo</h3>
              <p className="text-muted-foreground">
                Subí fotos del daño, elegí fecha de turno y enviá tu solicitud
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a4d6d] text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Seguí tu Trabajo</h3>
              <p className="text-muted-foreground">
                Recibí presupuestos, aprobá el trabajo y seguí el progreso en tiempo real
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-[#1a4d6d] py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-balance md:text-4xl">
            ¿Listo para reparar tu vehículo?
          </h2>
          <p className="mb-8 text-lg text-[#6cb4d8] text-pretty">
            Unite a cientos de clientes satisfechos que confían en DOCTORCAR
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-[#1a4d6d] hover:bg-[#6cb4d8] hover:text-white"
            onClick={() => signIn("auth0")}
          >
            Comenzar Ahora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 DOCTORCAR Rosario. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}