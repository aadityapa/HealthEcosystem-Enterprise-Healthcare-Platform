import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { code: 'patient.create', module: 'patient', action: 'create', description: 'Register new patient' },
  { code: 'patient.read', module: 'patient', action: 'read', description: 'View patient records' },
  { code: 'patient.update', module: 'patient', action: 'update', description: 'Update patient records' },
  { code: 'patient.delete', module: 'patient', action: 'delete', description: 'Delete patient records' },
  { code: 'patient.export', module: 'patient', action: 'export', description: 'Export patient data' },
  { code: 'lims.order.create', module: 'lims', action: 'create', description: 'Create lab order' },
  { code: 'lims.order.read', module: 'lims', action: 'read', description: 'View lab orders' },
  { code: 'lims.sample.collect', module: 'lims', action: 'collect', description: 'Collect sample' },
  { code: 'lims.sample.process', module: 'lims', action: 'process', description: 'Process sample' },
  { code: 'lims.result.verify', module: 'lims', action: 'verify', description: 'Verify results' },
  { code: 'lims.result.approve', module: 'lims', action: 'approve', description: 'Approve results' },
  { code: 'report.release', module: 'lims', action: 'release', description: 'Release report to patient' },
  { code: 'billing.create', module: 'billing', action: 'create', description: 'Create invoice' },
  { code: 'billing.read', module: 'billing', action: 'read', description: 'View billing records' },
  { code: 'billing.void', module: 'billing', action: 'void', description: 'Void invoice' },
  { code: 'billing.refund', module: 'billing', action: 'refund', description: 'Process refund' },
  { code: 'billing.claim.submit', module: 'billing', action: 'submit', description: 'Submit insurance claim' },
  { code: 'billing.settlement', module: 'billing', action: 'settlement', description: 'Manage franchise settlements' },
  { code: 'billing.gst.report', module: 'billing', action: 'report', description: 'View GST reports' },
  { code: 'billing.payment.collect', module: 'billing', action: 'collect', description: 'Collect payments' },
  { code: 'master.read', module: 'master', action: 'read', description: 'View master data' },
  { code: 'master.manage', module: 'master', action: 'manage', description: 'Manage master data' },
  { code: 'admin.user.manage', module: 'admin', action: 'manage', description: 'Manage users' },
  { code: 'admin.branch.manage', module: 'admin', action: 'manage', description: 'Manage branches' },
  { code: 'audit.log.read', module: 'audit', action: 'read', description: 'View audit logs' },
  { code: 'device.create', module: 'device', action: 'create', description: 'Register lab device' },
  { code: 'device.read', module: 'device', action: 'read', description: 'View devices' },
  { code: 'device.update', module: 'device', action: 'update', description: 'Update device config' },
  { code: 'device.configure', module: 'device', action: 'configure', description: 'Configure device adapters' },
  { code: 'device.monitor', module: 'device', action: 'monitor', description: 'Monitor device health' },
  { code: 'device.retry', module: 'device', action: 'retry', description: 'Retry failed messages' },
  { code: 'device.message.read', module: 'device', action: 'read', description: 'View device messages' },
  { code: 'inventory.read', module: 'inventory', action: 'read', description: 'View inventory' },
  { code: 'inventory.manage', module: 'inventory', action: 'manage', description: 'Manage inventory items' },
  { code: 'inventory.po.approve', module: 'inventory', action: 'approve', description: 'Approve purchase orders' },
  { code: 'inventory.transfer', module: 'inventory', action: 'transfer', description: 'Manage stock transfers' },
  { code: 'qc.read', module: 'qc', action: 'read', description: 'View QC data' },
  { code: 'qc.run', module: 'qc', action: 'run', description: 'Run QC tests' },
  { code: 'qc.capa.manage', module: 'qc', action: 'manage', description: 'Manage CAPA workflows' },
  { code: 'qc.calibrate', module: 'qc', action: 'calibrate', description: 'Log calibrations' },
  { code: 'crm.read', module: 'crm', action: 'read', description: 'View CRM data' },
  { code: 'crm.manage', module: 'crm', action: 'manage', description: 'Manage CRM records' },
  { code: 'crm.camp.manage', module: 'crm', action: 'manage', description: 'Manage health camps' },
  { code: 'crm.sales.track', module: 'crm', action: 'track', description: 'Track sales' },
  { code: 'ehr.read', module: 'ehr', action: 'read', description: 'View EHR records' },
  { code: 'ehr.appointment', module: 'ehr', action: 'appointment', description: 'Manage appointments' },
  { code: 'ehr.consult', module: 'ehr', action: 'consult', description: 'Conduct consultations' },
  { code: 'ehr.prescribe', module: 'ehr', action: 'prescribe', description: 'Issue prescriptions' },
  { code: 'ehr.teleconsult', module: 'ehr', action: 'teleconsult', description: 'Telemedicine sessions' },
  { code: 'abdm.read', module: 'abdm', action: 'read', description: 'View ABDM records' },
  { code: 'abdm.abha.link', module: 'abdm', action: 'link', description: 'Link ABHA profiles' },
  { code: 'abdm.consent', module: 'abdm', action: 'consent', description: 'Manage consent artifacts' },
  { code: 'abdm.fhir', module: 'abdm', action: 'fhir', description: 'Publish FHIR resources' },
  { code: 'analytics.read', module: 'analytics', action: 'read', description: 'View analytics' },
  { code: 'analytics.executive', module: 'analytics', action: 'executive', description: 'Executive dashboard' },
  { code: 'analytics.export', module: 'analytics', action: 'export', description: 'Export analytics' },
  { code: 'ai.read', module: 'ai', action: 'read', description: 'View AI inferences' },
  { code: 'ai.clinical', module: 'ai', action: 'clinical', description: 'Clinical AI' },
  { code: 'ai.operational', module: 'ai', action: 'operational', description: 'Operational AI' },
  { code: 'ai.chat', module: 'ai', action: 'chat', description: 'AI chat assistant' },
  { code: 'field.read', module: 'field', action: 'read', description: 'View field operations' },
  { code: 'field.manage', module: 'field', action: 'manage', description: 'Manage field routes' },
  { code: 'field.track', module: 'field', action: 'track', description: 'GPS tracking' },
  { code: 'radiology.read', module: 'radiology', action: 'read', description: 'View radiology' },
  { code: 'radiology.study', module: 'radiology', action: 'study', description: 'Manage studies' },
  { code: 'radiology.report', module: 'radiology', action: 'report', description: 'Radiology reports' },
  { code: 'radiology.pacs', module: 'radiology', action: 'pacs', description: 'PACS configuration' },
  { code: 'hrms.read', module: 'hrms', action: 'read', description: 'View HRMS' },
  { code: 'hrms.manage', module: 'hrms', action: 'manage', description: 'Manage employees' },
  { code: 'hrms.payroll', module: 'hrms', action: 'payroll', description: 'Process payroll' },
  { code: 'marketplace.read', module: 'marketplace', action: 'read', description: 'View marketplace' },
  { code: 'marketplace.manage', module: 'marketplace', action: 'manage', description: 'Manage listings' },
  { code: 'marketplace.order', module: 'marketplace', action: 'order', description: 'Place orders' },
  { code: 'observability.read', module: 'observability', action: 'read', description: 'View observability' },
  { code: 'observability.sla.manage', module: 'observability', action: 'manage', description: 'Manage SLA definitions' },
  { code: 'data.read', module: 'data', action: 'read', description: 'View data platform' },
  { code: 'data.pipeline.manage', module: 'data', action: 'manage', description: 'Manage data pipelines' },
  { code: 'workflow.read', module: 'workflow', action: 'read', description: 'View workflows' },
  { code: 'workflow.manage', module: 'workflow', action: 'manage', description: 'Manage workflow definitions' },
  { code: 'workflow.task.complete', module: 'workflow', action: 'complete', description: 'Complete workflow tasks' },
  { code: 'dms.read', module: 'dms', action: 'read', description: 'View documents' },
  { code: 'dms.upload', module: 'dms', action: 'upload', description: 'Upload documents' },
  { code: 'dms.sign', module: 'dms', action: 'sign', description: 'Sign documents' },
  { code: 'branding.read', module: 'branding', action: 'read', description: 'View branding' },
  { code: 'branding.manage', module: 'branding', action: 'manage', description: 'Manage white-label branding' },
  { code: 'agents.read', module: 'agents', action: 'read', description: 'View AI agents' },
  { code: 'agents.patient', module: 'agents', action: 'patient', description: 'Use patient agent' },
  { code: 'i18n.read', module: 'i18n', action: 'read', description: 'View i18n config' },
  { code: 'i18n.manage', module: 'i18n', action: 'manage', description: 'Manage translations' },
  { code: 'security.read', module: 'security', action: 'read', description: 'View security dashboard' },
  { code: 'security.manage', module: 'security', action: 'manage', description: 'Manage security incidents' },
  { code: 'security.siem', module: 'security', action: 'siem', description: 'Ingest SIEM events' },
  { code: 'compliance.read', module: 'compliance', action: 'read', description: 'View compliance dashboard' },
  { code: 'compliance.manage', module: 'compliance', action: 'manage', description: 'Manage compliance controls' },
  { code: 'compliance.evidence', module: 'compliance', action: 'evidence', description: 'Upload audit evidence' },
  { code: 'customer_success.read', module: 'customer_success', action: 'read', description: 'View customer success' },
  { code: 'customer_success.manage', module: 'customer_success', action: 'manage', description: 'Manage onboarding' },
  { code: 'customer_success.support', module: 'customer_success', action: 'support', description: 'Manage support tickets' },
  { code: 'commercial.read', module: 'commercial', action: 'read', description: 'View commercial data' },
  { code: 'commercial.manage', module: 'commercial', action: 'manage', description: 'Manage subscriptions and contracts' },
  { code: 'commercial.partner', module: 'commercial', action: 'partner', description: 'Manage partner accounts' },
];

const SYSTEM_ROLES = [
  {
    code: 'tenant_admin',
    name: 'Tenant Administrator',
    permissions: PERMISSIONS.map((p) => p.code),
  },
  {
    code: 'lab_technician',
    name: 'Lab Technician',
    permissions: ['lims.order.read', 'lims.sample.collect', 'lims.sample.process', 'patient.read'],
  },
  {
    code: 'lab_verifier',
    name: 'Result Verifier',
    permissions: ['lims.order.read', 'lims.result.verify', 'patient.read'],
  },
  {
    code: 'front_desk',
    name: 'Front Desk',
    permissions: ['patient.create', 'patient.read', 'patient.update', 'lims.order.create', 'billing.create'],
  },
  {
    code: 'device_manager',
    name: 'Device Manager',
    permissions: ['device.create', 'device.read', 'device.update', 'device.configure', 'device.monitor', 'device.retry', 'device.message.read', 'lims.order.read'],
  },
  {
    code: 'billing_manager',
    name: 'Billing Manager',
    permissions: ['billing.create', 'billing.read', 'billing.void', 'billing.refund', 'billing.claim.submit', 'billing.settlement', 'billing.gst.report', 'billing.payment.collect', 'patient.read'],
  },
  {
    code: 'inventory_manager',
    name: 'Inventory Manager',
    permissions: ['inventory.read', 'inventory.manage', 'inventory.po.approve', 'inventory.transfer'],
  },
  {
    code: 'qc_manager',
    name: 'QC Manager',
    permissions: ['qc.read', 'qc.run', 'qc.capa.manage', 'qc.calibrate', 'lims.order.read'],
  },
  {
    code: 'crm_manager',
    name: 'CRM Manager',
    permissions: ['crm.read', 'crm.manage', 'crm.camp.manage', 'crm.sales.track', 'patient.read'],
  },
  {
    code: 'ehr_doctor',
    name: 'EHR Doctor',
    permissions: ['ehr.read', 'ehr.appointment', 'ehr.consult', 'ehr.prescribe', 'ehr.teleconsult', 'patient.read'],
  },
];

async function main() {
  console.log('Seeding database...');

  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-lab' },
    update: {},
    create: {
      slug: 'demo-lab',
      name: 'Demo Diagnostic Laboratory',
      tier: 'ENTERPRISE',
      status: 'ACTIVE',
      settings: { features: { ehr: true, ai_analytics: true, abdm: true } },
    },
  });

  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-4000-a000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-a000-000000000001',
      tenantId: tenant.id,
      legalName: 'Demo Diagnostic Laboratory Pvt Ltd',
      tradeName: 'Demo Lab',
      gstin: '27AABCD1234E1Z5',
      orgType: 'diagnostic',
    },
  });

  const branch = await prisma.branch.upsert({
    where: { id: '00000000-0000-4000-a000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-4000-a000-000000000002',
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'AND',
      name: 'Andheri Collection Center',
      branchType: 'COLLECTION_CENTER',
      isCollectionCenter: true,
      address: { line1: '123 Main Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400058' },
      contact: { phone: '+91-22-12345678', email: 'andheri@demolab.com' },
    },
  });

  await prisma.department.upsert({
    where: { id: '00000000-0000-4000-a000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-4000-a000-000000000003',
      tenantId: tenant.id,
      organizationId: org.id,
      branchId: branch.id,
      code: 'RECEPTION',
      name: 'Reception',
    },
  });

  for (const roleDef of SYSTEM_ROLES) {
    const role = await prisma.role.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: roleDef.code } },
      update: {},
      create: {
        tenantId: tenant.id,
        code: roleDef.code,
        name: roleDef.name,
        isSystem: true,
      },
    });

    for (const permCode of roleDef.permissions) {
      const perm = await prisma.permission.findUnique({ where: { code: permCode } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  }

  const passwordHash = await bcrypt.hash('Admin@123456', 12);
  const adminRole = await prisma.role.findFirst({
    where: { tenantId: tenant.id, code: 'tenant_admin' },
  });

  const adminUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demolab.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      email: 'admin@demolab.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      status: 'ACTIVE',
      mfaEnabled: false,
    },
  });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId_branchId: { userId: adminUser.id, roleId: adminRole.id, branchId: branch.id } },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id, branchId: branch.id },
    });
  }

  await prisma.userBranch.upsert({
    where: { userId_branchId: { userId: adminUser.id, branchId: branch.id } },
    update: {},
    create: { userId: adminUser.id, branchId: branch.id, isPrimary: true },
  });

  const hematology = await prisma.testCategory.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'HEM' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'HEM',
      name: 'Hematology',
    },
  });

  const cbc = await prisma.testMaster.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'CBC' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      categoryId: hematology.id,
      code: 'CBC',
      name: 'Complete Blood Count',
      shortName: 'CBC',
      specimenType: 'EDTA',
      containerType: 'Purple Top',
      tatHours: 4,
      referenceRanges: [
        { parameter: 'WBC', min: 4.0, max: 11.0, unit: '10^3/uL' },
        { parameter: 'RBC', min: 4.5, max: 5.5, unit: '10^6/uL' },
        { parameter: 'HGB', min: 13.0, max: 17.0, unit: 'g/dL' },
        { parameter: 'PLT', min: 150, max: 400, unit: '10^3/uL' },
      ],
    },
  });

  const cbcParams = [
    { code: 'WBC', name: 'White Blood Cell Count', unit: '10^3/uL' },
    { code: 'RBC', name: 'Red Blood Cell Count', unit: '10^6/uL' },
    { code: 'HGB', name: 'Hemoglobin', unit: 'g/dL' },
    { code: 'PLT', name: 'Platelet Count', unit: '10^3/uL' },
  ];

  for (let i = 0; i < cbcParams.length; i++) {
    const param = cbcParams[i];
    await prisma.testParameter.upsert({
      where: { testId_code: { testId: cbc.id, code: param.code } },
      update: {},
      create: {
        tenantId: tenant.id,
        organizationId: org.id,
        testId: cbc.id,
        code: param.code,
        name: param.name,
        unit: param.unit,
        sortOrder: i,
      },
    });
  }

  await prisma.testPricing.upsert({
    where: { id: '00000000-0000-4000-a000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-4000-a000-000000000010',
      tenantId: tenant.id,
      organizationId: org.id,
      branchId: branch.id,
      testId: cbc.id,
      basePrice: 350,
      mrp: 450,
    },
  });

  await prisma.uhidSequence.upsert({
    where: { tenantId_branchId: { tenantId: tenant.id, branchId: branch.id } },
    update: {},
    create: { tenantId: tenant.id, branchId: branch.id, prefix: 'AND', lastSeq: 0 },
  });

  await prisma.orderSequence.upsert({
    where: { tenantId_branchId: { tenantId: tenant.id, branchId: branch.id } },
    update: {},
    create: { tenantId: tenant.id, branchId: branch.id, prefix: 'ORD-AND', lastSeq: 0 },
  });

  const rocheDevice = await prisma.device.upsert({
    where: { tenantId_deviceCode: { tenantId: tenant.id, deviceCode: 'COBAS-C501-01' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      branchId: branch.id,
      deviceCode: 'COBAS-C501-01',
      name: 'Roche Cobas c501',
      vendor: 'ROCHE',
      model: 'Cobas c501',
      protocol: 'HL7_V2',
      connectionType: 'MLLP',
      connectionConfig: { host: '192.168.1.100', port: 5000 },
      firmwareVersion: '5.4.2',
      status: 'ONLINE',
      lastSeenAt: new Date(),
    },
  });

  await prisma.deviceAdapter.upsert({
    where: { id: '00000000-0000-4000-a000-000000000020' },
    update: {},
    create: {
      id: '00000000-0000-4000-a000-000000000020',
      tenantId: tenant.id,
      organizationId: org.id,
      branchId: branch.id,
      deviceId: rocheDevice.id,
      adapterVersion: '1.0.0',
      vendor: 'ROCHE',
      fieldMapping: {
        WBC: '6690-2',
        RBC: '789-8',
        HGB: '718-7',
        PLT: '777-3',
      },
    },
  });

  await prisma.protocolConfig.upsert({
    where: { id: '00000000-0000-4000-a000-000000000021' },
    update: {},
    create: {
      id: '00000000-0000-4000-a000-000000000021',
      tenantId: tenant.id,
      organizationId: org.id,
      branchId: branch.id,
      protocol: 'HL7_V2',
      vendor: 'ROCHE',
      name: 'Roche Cobas HL7 v2.5',
      config: { messageType: 'ORU^R01', encoding: 'UTF-8', mllpStart: 0x0b, mllpEnd: 0x1c0d },
    },
  });

  const maharashtra = await prisma.stateMaster.upsert({
    where: { code: 'MH' },
    update: {},
    create: { code: 'MH', name: 'Maharashtra', gstCode: '27' },
  });

  await prisma.cityMaster.upsert({
    where: { stateId_code: { stateId: maharashtra.id, code: 'MUM' } },
    update: {},
    create: { stateId: maharashtra.id, code: 'MUM', name: 'Mumbai', pincode: '400001' },
  });

  const gstLabServices = await prisma.taxMaster.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'GST-LAB-5' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'GST-LAB-5',
      name: 'Lab Services GST 5%',
      hsnSacCode: '999316',
      cgstRate: 2.5,
      sgstRate: 2.5,
      igstRate: 5,
    },
  });

  await prisma.billingCode.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'HOME-COLLECT' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'HOME-COLLECT',
      name: 'Home Collection Charge',
      codeType: 'SURCHARGE',
      taxMasterId: gstLabServices.id,
      defaultPrice: 150,
    },
  });

  await prisma.billingCode.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'URGENT-PROC' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'URGENT-PROC',
      name: 'Urgent Processing Charge',
      codeType: 'SURCHARGE',
      taxMasterId: gstLabServices.id,
      defaultPrice: 200,
    },
  });

  await prisma.surchargeRule.upsert({
    where: { id: '00000000-0000-4000-a000-000000000030' },
    update: {},
    create: {
      id: '00000000-0000-4000-a000-000000000030',
      tenantId: tenant.id,
      organizationId: org.id,
      surchargeType: 'HOME_COLLECTION',
      name: 'Home Collection Surcharge',
      amount: 150,
    },
  });

  await prisma.surchargeRule.upsert({
    where: { id: '00000000-0000-4000-a000-000000000031' },
    update: {},
    create: {
      id: '00000000-0000-4000-a000-000000000031',
      tenantId: tenant.id,
      organizationId: org.id,
      surchargeType: 'URGENT',
      name: 'Urgent Processing Surcharge',
      amount: 200,
    },
  });

  await prisma.billingSequence.upsert({
    where: { tenantId_branchId_seqType: { tenantId: tenant.id, branchId: branch.id, seqType: 'INVOICE' } },
    update: {},
    create: { tenantId: tenant.id, branchId: branch.id, seqType: 'INVOICE', prefix: 'INV-AND', lastSeq: 0 },
  });

  await prisma.corporateClient.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'CORP-TCS' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'CORP-TCS',
      name: 'TCS Limited',
      legalName: 'Tata Consultancy Services Limited',
      gstin: '27AAACR5055K1Z5',
      contactPerson: 'HR Admin',
      email: 'healthcare@tcs.com',
      phone: '+91-22-67789999',
      billingCycle: 'monthly',
      paymentTermsDays: 30,
    },
  });

  await prisma.insuranceTPA.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'TPA-MEDI' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'TPA-MEDI',
      name: 'Medi Assist Insurance TPA',
      contactEmail: 'claims@mediaassist.com',
      contactPhone: '+91-80-40000000',
    },
  });

  // Inventory seed
  const vendor = await prisma.vendor.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'VND-ROCHE' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'VND-ROCHE',
      name: 'Roche Diagnostics India',
      contactPerson: 'Supply Manager',
      email: 'supply@roche.com',
      phone: '+91-22-66666666',
      gstin: '27AAACR5055K1Z5',
    },
  });

  const reagent = await prisma.inventoryItem.upsert({
    where: { tenantId_sku: { tenantId: tenant.id, sku: 'RG-CBC-DIL' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      itemType: 'REAGENT',
      sku: 'RG-CBC-DIL',
      name: 'CBC Diluent Reagent',
      category: 'Hematology',
      unit: 'ml',
      reorderLevel: 500,
      vendorId: vendor.id,
      storageTemp: '2-8°C',
    },
  });

  await prisma.stockLot.upsert({
    where: {
      tenantId_branchId_itemId_lotNumber: {
        tenantId: tenant.id,
        branchId: branch.id,
        itemId: reagent.id,
        lotNumber: 'LOT-2026-001',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      branchId: branch.id,
      itemId: reagent.id,
      lotNumber: 'LOT-2026-001',
      quantity: 2000,
      availableQty: 2000,
      unitCost: 0.85,
      expiresAt: new Date('2026-12-31'),
      status: 'AVAILABLE',
      location: 'Cold Room A',
    },
  });

  // QC seed
  await prisma.qcMaterial.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'QC-HGB-L1' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'QC-HGB-L1',
      name: 'Hemoglobin Control Level 1',
      analyte: 'HGB',
      level: 'L1',
      targetMean: 14.5,
      targetSd: 0.5,
      unit: 'g/dL',
      lotNumber: 'QCLOT-2026',
    },
  });

  // CRM seed
  await prisma.referringDoctor.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'DR-SHARMA' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'DR-SHARMA',
      name: 'Dr. Rajesh Sharma',
      specialty: 'General Physician',
      qualification: 'MBBS, MD',
      registrationNo: 'MH-12345',
      phone: '+91-9876543210',
      clinicName: 'Sharma Clinic',
      commissionPct: 5,
    },
  });

  // EHR seed
  await prisma.ehrDoctor.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'EHR-DR-PATEL' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'EHR-DR-PATEL',
      name: 'Dr. Priya Patel',
      specialty: 'Internal Medicine',
      qualification: 'MBBS, MD',
      registrationNo: 'MH-67890',
      consultationFee: 500,
    },
  });

  // Analytics seed
  await prisma.dashboardConfig.upsert({
    where: { id: '00000000-0000-4000-b000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-b000-000000000001',
      tenantId: tenant.id,
      organizationId: org.id,
      name: 'Executive Dashboard',
      dashboardType: 'executive',
      isDefault: true,
    },
  });

  await prisma.predictiveModel.upsert({
    where: { id: '00000000-0000-4000-b000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-4000-b000-000000000002',
      tenantId: tenant.id,
      modelType: 'revenue_forecast',
      name: 'Monthly Revenue Forecast',
      version: '1.0',
      accuracy: 87.5,
    },
  });

  // Field ops seed
  const phlebotomist = await prisma.phlebotomist.upsert({
    where: { tenantId_employeeCode: { tenantId: tenant.id, employeeCode: 'PHLEB-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      branchId: branch.id,
      employeeCode: 'PHLEB-001',
      name: 'Amit Kumar',
      phone: '+91-9876543211',
    },
  });

  await prisma.geoFence.upsert({
    where: { id: '00000000-0000-4000-b000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-4000-b000-000000000003',
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'Andheri Collection Center',
      centerLat: 19.1136,
      centerLng: 72.8697,
      radiusMeters: 500,
    },
  });

  // Radiology seed
  await prisma.pacsNode.upsert({
    where: { tenantId_aeTitle: { tenantId: tenant.id, aeTitle: 'HEALTHPACS' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      branchId: branch.id,
      name: 'Primary PACS',
      aeTitle: 'HEALTHPACS',
      host: 'pacs.demolab.local',
      port: 104,
    },
  });

  // HRMS seed
  await prisma.employee.upsert({
    where: { tenantId_employeeCode: { tenantId: tenant.id, employeeCode: 'EMP-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      branchId: branch.id,
      employeeCode: 'EMP-001',
      firstName: 'Sneha',
      lastName: 'Reddy',
      email: 'sneha@demolab.com',
      department: 'Laboratory',
      designation: 'Senior Lab Technician',
      joinDate: new Date('2022-01-15'),
      salary: 45000,
    },
  });

  // Marketplace seed
  const partnerLab = await prisma.partnerLab.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'PARTNER-THY' } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: 'PARTNER-THY',
      name: 'Thyrocare Technologies',
      city: 'Mumbai',
      nablAccredited: true,
      rating: 4.5,
    },
  });

  await prisma.marketplaceListing.upsert({
    where: { tenantId_itemCode: { tenantId: tenant.id, itemCode: 'MP-CBC-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      partnerLabId: partnerLab.id,
      listingType: 'TEST',
      itemCode: 'MP-CBC-001',
      name: 'Complete Blood Count',
      price: 299,
      mrp: 499,
    },
  });

  await prisma.wellnessPackage.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'WELL-EXEC' } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'WELL-EXEC',
      name: 'Executive Health Checkup',
      description: 'Comprehensive health screening for corporate employees',
      price: 4999,
      corporatePrice: 3999,
    },
  });

  // Observability seed
  await prisma.slaDefinition.upsert({
    where: { id: '00000000-0000-4000-c000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-c000-000000000001',
      tenantId: tenant.id,
      name: 'LIMS Service SLA',
      serviceName: 'lims-service',
      targetUptime: 0.9995,
      targetLatencyMs: 500,
      errorBudgetPct: 5,
    },
  });

  // Workflow seed - critical result workflow
  await prisma.workflowDefinition.upsert({
    where: { tenantId_code_version: { tenantId: tenant.id, code: 'critical-result', version: 1 } },
    update: {},
    create: {
      tenantId: tenant.id,
      organizationId: org.id,
      code: 'critical-result',
      name: 'Critical Result Review',
      category: 'lims',
      version: 1,
      slaMinutes: 120,
      bpmnXml: '<bpmn><userTask id="pathologist_review"/><userTask id="senior_review"/><serviceTask id="patient_notification"/></bpmn>',
    },
  });

  // White label branding seed
  await prisma.tenantBrand.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      brandName: 'Demo Lab Diagnostics',
      primaryColor: '#0066CC',
      secondaryColor: '#00AA88',
      customDomain: 'demo.demolab.health',
    },
  });

  await prisma.featureToggle.upsert({
    where: { tenantId_featureKey: { tenantId: tenant.id, featureKey: 'radiology' } },
    update: {},
    create: { tenantId: tenant.id, featureKey: 'radiology', enabled: true },
  });

  // AI agents seed
  for (const agent of [
    { type: 'PATIENT' as const, name: 'Patient Assistant', desc: 'Report explanation and booking' },
    { type: 'DOCTOR' as const, name: 'Clinical Assistant', desc: 'Summaries and prescriptions' },
    { type: 'LAB' as const, name: 'Lab Intelligence', desc: 'QC and device monitoring' },
    { type: 'MANAGEMENT' as const, name: 'Ops Advisor', desc: 'Revenue and operations insights' },
  ]) {
    await prisma.aiAgent.upsert({
      where: { tenantId_agentType_name: { tenantId: tenant.id, agentType: agent.type, name: agent.name } },
      update: {},
      create: {
        tenantId: tenant.id,
        agentType: agent.type,
        name: agent.name,
        description: agent.desc,
        capabilities: [],
      },
    });
  }

  // Tenant locale (India primary)
  await prisma.tenantLocale.upsert({
    where: { tenantId_countryCode: { tenantId: tenant.id, countryCode: 'IN' } },
    update: {},
    create: {
      tenantId: tenant.id,
      countryCode: 'IN',
      currency: 'INR',
      locale: 'en-IN',
      timezone: 'Asia/Kolkata',
      isPrimary: true,
    },
  });

  // Data pipeline seed
  await prisma.dataPipeline.upsert({
    where: { tenantId_pipelineName: { tenantId: tenant.id, pipelineName: 'lims-orders-to-warehouse' } },
    update: {},
    create: {
      tenantId: tenant.id,
      pipelineName: 'lims-orders-to-warehouse',
      sourceTopic: 'lims.order.created',
      lakePath: 's3://health-ecosystem-lake/lims/orders',
      warehouseTable: 'fact_lab_orders',
    },
  });

  // Phase 25 — Security SOC seed
  await prisma.securityIncident.upsert({
    where: { incidentNumber: 'INC-2026-0001' },
    update: {},
    create: {
      tenantId: tenant.id,
      incidentNumber: 'INC-2026-0001',
      title: 'Brute-force login attempt blocked by WAF',
      description: 'Multiple failed auth attempts from single IP blocked at edge.',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      threatType: 'brute_force',
      sourceIp: '203.0.113.42',
      affectedService: 'identity-service',
      resolvedAt: new Date(),
    },
  });

  await prisma.threatDetection.upsert({
    where: { id: '00000000-0000-4000-c000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-c000-000000000001',
      tenantId: tenant.id,
      ruleName: 'runtime-anomaly-detector',
      threatLevel: 'HIGH',
      source: 'runtime-threat-detector',
      description: 'Unusual API call pattern detected on billing endpoints',
    },
  });

  await prisma.certificateRecord.upsert({
    where: { id: '00000000-0000-4000-d000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-d000-000000000001',
      tenantId: tenant.id,
      domain: 'demo.demolab.health',
      issuer: "Let's Encrypt",
      validFrom: new Date('2026-01-01'),
      validTo: new Date('2026-12-31'),
      autoRenew: true,
      status: 'active',
    },
  });

  // Phase 28 — Compliance demo evidence (packs seeded by compliance-service on startup)
  const hipaaPack = await prisma.compliancePack.findUnique({ where: { framework: 'HIPAA' } });
  if (hipaaPack) {
    const control = await prisma.complianceControl.findFirst({
      where: { packId: hipaaPack.id },
    });
    if (control) {
      await prisma.auditEvidence.upsert({
        where: { id: '00000000-0000-4000-e000-000000000001' },
        update: {},
        create: {
          id: '00000000-0000-4000-e000-000000000001',
          tenantId: tenant.id,
          controlId: control.id,
          evidenceType: 'policy',
          title: 'Information Security Policy v2.1',
          description: 'Signed policy document for HIPAA administrative safeguards',
          collectedBy: adminUser.id,
        },
      });
    }
  }

  await prisma.riskRegisterEntry.upsert({
    where: { tenantId_riskNumber: { tenantId: tenant.id, riskNumber: 'RISK-2026-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      riskNumber: 'RISK-2026-001',
      title: 'Third-party device integration data leakage',
      category: 'operational',
      likelihood: 'medium',
      impact: 'high',
      riskScore: 12,
      mitigation: 'Encrypt device messages at rest; rotate API keys quarterly',
      status: 'open',
    },
  });

  // Phase 29 — Customer Success seed
  await prisma.tenantOnboarding.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      status: 'IN_PROGRESS',
      currentStep: 'data_migration',
      progressPct: 45,
      assignedCsm: adminUser.id,
      targetGoLive: new Date('2026-07-01'),
      checklist: [
        { step: 'tenant_setup', done: true },
        { step: 'master_data', done: true },
        { step: 'data_migration', done: false },
        { step: 'training', done: false },
        { step: 'go_live', done: false },
      ],
    },
  });

  const limsBasics = await prisma.trainingCourse.upsert({
    where: { code: 'LIMS-101' },
    update: {},
    create: {
      code: 'LIMS-101',
      title: 'LIMS Basics for Lab Staff',
      description: 'Order entry, sample collection, and result verification',
      durationMins: 45,
      moduleType: 'lims',
    },
  });

  await prisma.trainingEnrollment.upsert({
    where: { tenantId_userId_courseId: { tenantId: tenant.id, userId: adminUser.id, courseId: limsBasics.id } },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: adminUser.id,
      courseId: limsBasics.id,
      status: 'in_progress',
      progressPct: 30,
    },
  });

  await prisma.supportTicket.upsert({
    where: { tenantId_ticketNumber: { tenantId: tenant.id, ticketNumber: 'TKT-2026-0001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      ticketNumber: 'TKT-2026-0001',
      subject: 'Device HL7 message parsing error',
      description: 'Sysmex XN results not importing automatically',
      priority: 'high',
      status: 'IN_PROGRESS',
      category: 'device_integration',
      createdBy: adminUser.id,
    },
  });

  await prisma.knowledgeArticle.upsert({
    where: { slug: 'getting-started-lims' },
    update: {},
    create: {
      slug: 'getting-started-lims',
      title: 'Getting Started with HealthEcosystem LIMS',
      category: 'onboarding',
      content: 'Step-by-step guide to configure your lab, users, and test catalog.',
    },
  });

  // Phase 30 — Commercial seed (market-aligned pricing tiers)
  await prisma.subscriptionPlan.upsert({
    where: { code: 'SMALL_LAB' },
    update: { monthlyPrice: 25000, annualPrice: 250000 },
    create: {
      code: 'SMALL_LAB',
      name: 'Small Lab',
      tier: 'small_lab',
      monthlyPrice: 25000,
      annualPrice: 250000,
      maxBranches: 1,
      maxUsers: 10,
      features: ['lims', 'billing', 'patient_portal'],
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { code: 'DIAGNOSTIC_CENTER' },
    update: { monthlyPrice: 125000, annualPrice: 1250000 },
    create: {
      code: 'DIAGNOSTIC_CENTER',
      name: 'Diagnostic Center',
      tier: 'diagnostic_center',
      monthlyPrice: 125000,
      annualPrice: 1250000,
      maxBranches: 3,
      maxUsers: 50,
      features: ['lims', 'billing', 'crm', 'qc', 'inventory', 'patient_mobile'],
    },
  });

  const multiBranchPlan = await prisma.subscriptionPlan.upsert({
    where: { code: 'MULTI_BRANCH' },
    update: { monthlyPrice: 750000, annualPrice: 7500000 },
    create: {
      code: 'MULTI_BRANCH',
      name: 'Multi-Branch Chain',
      tier: 'multi_branch',
      monthlyPrice: 750000,
      annualPrice: 7500000,
      maxBranches: 25,
      maxUsers: 250,
      features: ['lims', 'billing', 'crm', 'qc', 'inventory', 'analytics', 'ai', 'field_ops', 'marketplace'],
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { code: 'WHITE_LABEL' },
    update: { monthlyPrice: 1666667, annualPrice: 20000000 },
    create: {
      code: 'WHITE_LABEL',
      name: 'White Label Enterprise',
      tier: 'white_label',
      monthlyPrice: 1666667,
      annualPrice: 20000000,
      maxBranches: 100,
      maxUsers: 1000,
      features: ['full_platform', 'white_label', 'custom_domain', 'dedicated_csm', 'setup_fee_2000000'],
    },
  });

  await prisma.tenantSubscription.upsert({
    where: { tenantId: tenant.id },
    update: { mrr: 750000 },
    create: {
      tenantId: tenant.id,
      planId: multiBranchPlan.id,
      status: 'ACTIVE',
      licenseKey: 'DEMO-LAB-MB-2026',
      seats: 50,
      mrr: 750000,
      expiresAt: new Date('2027-06-01'),
    },
  });

  await prisma.partnerAccount.upsert({
    where: { tenantId_accountCode: { tenantId: tenant.id, accountCode: 'FRN-MH-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      accountCode: 'FRN-MH-001',
      name: 'Mumbai Diagnostics Franchise',
      partnerType: 'franchise',
      contactEmail: 'franchise@demolab.com',
      contactPhone: '+919876543210',
      region: 'Maharashtra',
    },
  });

  await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0001' },
    update: {},
    create: {
      tenantId: tenant.id,
      quoteNumber: 'QT-2026-0001',
      prospectName: 'Apollo Diagnostics Chain',
      prospectEmail: 'procurement@apollodiag.example',
      planCode: 'MULTI_BRANCH',
      totalAmount: 7500000,
      validUntil: new Date('2026-09-01'),
      status: 'sent',
      lineItems: [{ item: 'Multi-Branch Chain (Annual)', qty: 1, amount: 7500000 }],
      createdBy: adminUser.id,
    },
  });

  // Isolation test tenant (for verify:tenant-isolation)
  const tenantB = await prisma.tenant.upsert({
    where: { slug: 'isolation-test-lab' },
    update: {},
    create: {
      slug: 'isolation-test-lab',
      name: 'Isolation Test Laboratory',
      tier: 'STARTER',
      status: 'ACTIVE',
    },
  });

  const orgB = await prisma.organization.upsert({
    where: { id: '00000000-0000-4000-b000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-b000-000000000001',
      tenantId: tenantB.id,
      legalName: 'Isolation Test Lab Pvt Ltd',
      tradeName: 'Isolation Lab',
      gstin: '29AAAAA0000A1Z5',
      orgType: 'diagnostic',
    },
  });

  const branchB = await prisma.branch.upsert({
    where: { id: '00000000-0000-4000-b000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-4000-b000-000000000002',
      tenantId: tenantB.id,
      organizationId: orgB.id,
      code: 'ISO',
      name: 'Isolation Test Branch',
      branchType: 'COLLECTION_CENTER',
      address: { line1: '99 Test Lane', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
      contact: { phone: '+91-80-99999999', email: 'test@isolation.lab' },
    },
  });

  await prisma.patient.upsert({
    where: { id: '00000000-0000-4000-b001-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-b001-000000000001',
      tenantId: tenantB.id,
      organizationId: orgB.id,
      branchId: branchB.id,
      uhid: 'ISO-000001',
      firstName: 'Cross',
      lastName: 'TenantTest',
      phone: '+919999999001',
      gender: 'MALE',
      status: 'ACTIVE',
    },
  });

  console.log('Seed completed.');
  console.log(`Tenant: ${tenant.slug}`);
  console.log(`Isolation tenant: ${tenantB.slug}`);
  console.log(`Admin: admin@demolab.com / Admin@123456`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
