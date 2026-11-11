export const featureStatus = {
  teacherHome: 'PARTIAL',
  teacherWizard: 'PARTIAL',
  studentPage: 'PARTIAL',
  localPersistence: 'DONE_TESTED',
  parser: 'DONE_TESTED',
  scoring: 'DONE_TESTED',
  resultCode: 'NOT_DONE',
  pdfImport: 'NOT_DONE',
  ocrImport: 'NOT_DONE',
  backendUpload: 'NOT_DONE',
  apkBuild: 'NOT_DONE'
} as const;

export const getFeatureStatus = (feature: keyof typeof featureStatus) => featureStatus[feature];
