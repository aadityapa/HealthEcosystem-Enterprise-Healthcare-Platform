-- Create PostgreSQL schemas
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS master;
CREATE SCHEMA IF NOT EXISTS patient;
CREATE SCHEMA IF NOT EXISTS lims;
CREATE SCHEMA IF NOT EXISTS device;
CREATE SCHEMA IF NOT EXISTS ehr;
CREATE SCHEMA IF NOT EXISTS pms;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS collection;
CREATE SCHEMA IF NOT EXISTS integration;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS audit;

-- Row Level Security helper functions
CREATE OR REPLACE FUNCTION core.current_tenant_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_tenant', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION core.current_organization_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_organization', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION core.current_branch_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_branch', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

-- Prevent audit log modifications
CREATE OR REPLACE FUNCTION audit.prevent_audit_modification() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable';
END;
$$ LANGUAGE plpgsql;

-- UHID generation function
CREATE OR REPLACE FUNCTION patient.generate_uhid(
  p_tenant_id UUID,
  p_branch_id UUID,
  p_branch_code VARCHAR
) RETURNS VARCHAR AS $$
DECLARE
  v_seq INT;
  v_uhid VARCHAR(32);
BEGIN
  UPDATE patient.uhid_sequences
  SET last_seq = last_seq + 1
  WHERE tenant_id = p_tenant_id AND branch_id = p_branch_id
  RETURNING last_seq INTO v_seq;

  IF NOT FOUND THEN
    INSERT INTO patient.uhid_sequences (id, tenant_id, branch_id, prefix, last_seq)
    VALUES (gen_random_uuid(), p_tenant_id, p_branch_id, p_branch_code, 1)
    RETURNING last_seq INTO v_seq;
  END IF;

  v_uhid := p_branch_code || TO_CHAR(NOW(), 'YYMM') || LPAD(v_seq::TEXT, 6, '0');
  RETURN v_uhid;
END;
$$ LANGUAGE plpgsql;

-- Order number generation
CREATE OR REPLACE FUNCTION lims.generate_order_number(
  p_tenant_id UUID,
  p_branch_id UUID,
  p_prefix VARCHAR
) RETURNS VARCHAR AS $$
DECLARE
  v_seq INT;
BEGIN
  UPDATE lims.order_sequences
  SET last_seq = last_seq + 1
  WHERE tenant_id = p_tenant_id AND branch_id = p_branch_id
  RETURNING last_seq INTO v_seq;

  IF NOT FOUND THEN
    INSERT INTO lims.order_sequences (id, tenant_id, branch_id, prefix, last_seq)
    VALUES (gen_random_uuid(), p_tenant_id, p_branch_id, p_prefix, 1)
    RETURNING last_seq INTO v_seq;
  END IF;

  RETURN p_prefix || '-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(v_seq::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Barcode generation
CREATE OR REPLACE FUNCTION lims.generate_barcode(
  p_tenant_id UUID,
  p_branch_code VARCHAR
) RETURNS VARCHAR AS $$
BEGIN
  RETURN 'BC-' || p_branch_code || '-' || TO_CHAR(NOW(), 'YYMMDD') || '-' ||
         LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
