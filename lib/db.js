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

  // Appointments
  getAppointments() {
    return this.getItem("appointments") || [];
  }

  getAppointmentsByClaimId(claimId) {
    const appointments = this.getAppointments();
    return appointments.filter((a) => a.claimId === claimId);
  }

  createAppointment(appointment) {
    const appointments = this.getAppointments();
    const newAppointment = {
      ...appointment,
      id: `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: appointment.status || "scheduled",
      appointmentType: appointment.appointmentType || "inspection",
      durationMinutes: appointment.durationMinutes || 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    appointments.push(newAppointment);
    this.setItem("appointments", appointments);
    return newAppointment;
  }

  updateAppointment(id, updates) {
    const appointments = this.getAppointments();
    const index = appointments.findIndex((a) => a.id === id);
    if (index === -1) return null;
    appointments[index] = {
      ...appointments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setItem("appointments", appointments);
    return appointments[index];
  }

  deleteAppointment(id) {
    const appointments = this.getAppointments();
    const filtered = appointments.filter((a) => a.id !== id);
    this.setItem("appointments", filtered);
    return true;
  }

  // Billing
  getBillings() {
    return this.getItem("billings") || [];
  }

  getBillingByClaimId(claimId) {
    const billings = this.getBillings();
    return billings.find((b) => b.claimId === claimId) || null;
  }

  createBilling(billing) {
    const billings = this.getBillings();
    const newBilling = {
      ...billing,
      id: `billing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      billingNumber: billing.billingNumber || `B-${Date.now()}`,
      status: billing.status || "pending",
      paidAmount: 0,
      balance: billing.totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    billings.push(newBilling);
    this.setItem("billings", billings);
    return newBilling;
  }

  updateBilling(id, updates) {
    const billings = this.getBillings();
    const index = billings.findIndex((b) => b.id === id);
    if (index === -1) return null;
    billings[index] = {
      ...billings[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setItem("billings", billings);
    return billings[index];
  }

  deleteBilling(id) {
    const billings = this.getBillings();
    const filtered = billings.filter((b) => b.id !== id);
    this.setItem("billings", filtered);
    return true;
  }

  // Billing Items
  getBillingItems() {
    return this.getItem("billingItems") || [];
  }

  getBillingItemsByBillingId(billingId) {
    const items = this.getBillingItems();
    return items.filter((i) => i.billingId === billingId);
  }

  createBillingItem(item) {
    const items = this.getBillingItems();
    const newItem = {
      ...item,
      id: `billingItem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      quantity: item.quantity || 1,
      totalPrice: (item.quantity || 1) * item.unitPrice,
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    this.setItem("billingItems", items);
    return newItem;
  }

  updateBillingItem(id, updates) {
    const items = this.getBillingItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    const item = { ...items[index], ...updates };
    item.totalPrice = item.quantity * item.unitPrice;
    items[index] = item;
    this.setItem("billingItems", items);
    return items[index];
  }

  deleteBillingItem(id) {
    const items = this.getBillingItems();
    const filtered = items.filter((i) => i.id !== id);
    this.setItem("billingItems", filtered);
    return true;
  }

  // Payments
  getPayments() {
    return this.getItem("payments") || [];
  }

  getPaymentsByBillingId(billingId) {
    const payments = this.getPayments();
    return payments.filter((p) => p.billingId === billingId);
  }

  createPayment(payment) {
    const payments = this.getPayments();
    const newPayment = {
      ...payment,
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: payment.status || "completed",
      cardInstallments: payment.cardInstallments || 1,
      cardInterestRate: payment.cardInterestRate || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    payments.push(newPayment);
    this.setItem("payments", payments);

    // Update billing amounts
    if (newPayment.status === "completed") {
      const billing = this.getBillings().find((b) => b.id === payment.billingId);
      if (billing) {
        const allPayments = this.getPaymentsByBillingId(payment.billingId);
        const totalPaid = allPayments
          .filter((p) => p.status === "completed")
          .reduce((sum, p) => sum + p.amount, 0);
        
        this.updateBilling(payment.billingId, {
          paidAmount: totalPaid,
          balance: billing.totalAmount - totalPaid,
          status: totalPaid >= billing.totalAmount ? "paid" : totalPaid > 0 ? "partial" : "pending",
        });
      }
    }

    return newPayment;
  }

  updatePayment(id, updates) {
    const payments = this.getPayments();
    const index = payments.findIndex((p) => p.id === id);
    if (index === -1) return null;
    payments[index] = {
      ...payments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setItem("payments", payments);

    // Recalculate billing amounts
    const payment = payments[index];
    const billing = this.getBillings().find((b) => b.id === payment.billingId);
    if (billing) {
      const allPayments = this.getPaymentsByBillingId(payment.billingId);
      const totalPaid = allPayments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0);
      
      this.updateBilling(payment.billingId, {
        paidAmount: totalPaid,
        balance: billing.totalAmount - totalPaid,
        status: totalPaid >= billing.totalAmount ? "paid" : totalPaid > 0 ? "partial" : "pending",
      });
    }

    return payments[index];
  }

  deletePayment(id) {
    const payments = this.getPayments();
    const payment = payments.find((p) => p.id === id);
    if (!payment) return false;

    const filtered = payments.filter((p) => p.id !== id);
    this.setItem("payments", filtered);

    // Recalculate billing amounts
    const billing = this.getBillings().find((b) => b.id === payment.billingId);
    if (billing) {
      const allPayments = this.getPaymentsByBillingId(payment.billingId);
      const totalPaid = allPayments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0);
      
      this.updateBilling(payment.billingId, {
        paidAmount: totalPaid,
        balance: billing.totalAmount - totalPaid,
        status: totalPaid >= billing.totalAmount ? "paid" : totalPaid > 0 ? "partial" : "pending",
      });
    }

    return true;
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