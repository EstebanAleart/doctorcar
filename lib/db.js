// Sistema de base de datos simulado con localStorage
class Database {
  getItem(key) {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  setItem(key, value) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Users
  getUsers() {
    return this.getItem("users") || [];
  }

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find((u) => u.email === email) || null;
  }

  getUserByAuth0Id(auth0Id) {
    const users = this.getUsers();
    return users.find((u) => u.auth0Id === auth0Id) || null;
  }

  createUser(user) {
    const users = this.getUsers();
    const newUser = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.setItem("users", users);
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    this.setItem("users", users);
    return users[index];
  }

  deleteUser(id) {
    const users = this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    this.setItem("users", filtered);
    return true;
  }

  // Vehicles
  getVehicles() {
    return this.getItem("vehicles") || [];
  }

  getVehiclesByClient(clientId) {
    return this.getVehicles().filter((v) => v.clientId === clientId);
  }

  createVehicle(vehicle) {
    const vehicles = this.getVehicles();
    const newVehicle = {
      ...vehicle,
      id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    vehicles.push(newVehicle);
    this.setItem("vehicles", vehicles);
    return newVehicle;
  }

  updateVehicle(id, updates) {
    const vehicles = this.getVehicles();
    const index = vehicles.findIndex((v) => v.id === id);
    if (index === -1) return null;
    vehicles[index] = { ...vehicles[index], ...updates };
    this.setItem("vehicles", vehicles);
    return vehicles[index];
  }

  deleteVehicle(id) {
    const vehicles = this.getVehicles();
    const filtered = vehicles.filter((v) => v.id !== id);
    if (filtered.length === vehicles.length) return false;
    this.setItem("vehicles", filtered);
    return true;
  }

  // Claims
  getClaims() {
    return this.getItem("claims") || [];
  }

  getClaimsByClient(clientId) {
    return this.getClaims().filter((c) => c.clientId === clientId);
  }

  getClaimsByEmployee(employeeId) {
    return this.getClaims().filter((c) => c.employeeId === employeeId);
  }

  createClaim(claim) {
    const claims = this.getClaims();
    const newClaim = {
      ...claim,
      id: `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    claims.push(newClaim);
    this.setItem("claims", claims);
    return newClaim;
  }

  updateClaim(id, updates) {
    const claims = this.getClaims();
    const index = claims.findIndex((c) => c.id === id);
    if (index === -1) return null;
    claims[index] = {
      ...claims[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setItem("claims", claims);
    return claims[index];
  }

  // Workshop
  getWorkshop() {
    return (
      this.getItem("workshop") || {
        id: "workshop_1",
        name: "DOCTORCAR Rosario",
        address: "Rosario, Santa Fe, Argentina",
        phone: "+54 341 XXX XXXX",
        email: "info@doctorcar.com.ar",
      }
    );
  }

  updateWorkshop(workshop) {
    this.setItem("workshop", workshop);
  }

  // Initialize with demo data
  initialize() {
    if (this.getUsers().length === 0) {
      this.createUser({
        email: "admin@doctorcar.com",
        name: "Administrador",
        role: "admin",
        phone: "+54 341 XXX XXXX",
      });
      this.createUser({
        email: "empleado@doctorcar.com",
        name: "Juan Pérez",
        role: "employee",
        phone: "+54 341 XXX XXXX",
      });
    }
  }
}

export const db = new Database();