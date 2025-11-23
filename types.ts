export enum ConversionMode {
  DOC_TO_LATEX = 'DOC_TO_LATEX',
  LATEX_TO_DOC = 'LATEX_TO_DOC'
}

export enum Status {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ConversionResult {
  content: string;
  type: 'latex' | 'html';
}

export interface FileData {
  name: string;
  type: string;
  base64: string;
}