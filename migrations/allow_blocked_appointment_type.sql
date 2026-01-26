ALTER TABLE appointments
  DROP CONSTRAINT IF EXISTS appointments_appointment_type_check;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_appointment_type_check
  CHECK (appointment_type IN ('inspection','repair','delivery','follow_up','blocked'));
