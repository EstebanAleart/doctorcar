-- Script para limpiar la BD manteniendo solo users
-- Elimina todos los datos excepto users

BEGIN;

-- Eliminar en orden respetando foreign keys
DELETE FROM payments;
DELETE FROM billing_items;
DELETE FROM billing;
DELETE FROM budget_items;
DELETE FROM appointments;
DELETE FROM claims;
DELETE FROM vehicles;
DELETE FROM insurance_companies;

-- Resetear sequences si existen
-- (para que los IDs vuelvan a empezar desde 1 si es necesario)

COMMIT;

-- Verificar
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as vehicles_count FROM vehicles;
SELECT COUNT(*) as claims_count FROM claims;
SELECT COUNT(*) as appointments_count FROM appointments;
