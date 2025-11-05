// CarePay API service functions

const API_BASE_URL = 'https://backend.carepay.money';

export interface ApiResponse<T = any> {
  status: number;
  data: T | null;
  attachment: any;
  message: string;
}

export interface OtpVerificationResponse {
  status: number;
  data: string | null; // "BANK" or other values
  attachment: any;
  message: string;
}

export interface ScoutCode {
  code: string;
  externalCode: string | null;
  name: string;
}

export interface ScoutCodesResponse {
  status: number;
  data: ScoutCode[] | null;
  attachment: any;
  message: string;
}

export interface DoctorDetailsResponse {
  status: number;
  data: any | null; // Doctor details object
  attachment: any;
  message: string;
}

export interface DoctorPayload {
  id?: string;
  doctorId?: string; // Add doctorId for updating existing records
  dob: string; // Format: "DD-MM-YYYY" (e.g., "21-06-2001")
  phoneNumber: string;
  emailId: string;
  name: string;
  pan: string;
  joiningDate?: string; // Format: "DD-MM-YYYY" (e.g., "21-06-2001")
  doctorCode?: string;
  creatorId?: string;
  scoutCode?: string;
  important?: string;
  appDownloadStatus?: string;
  verified?: string;
  mobileVerified?: string;
}

export interface DoctorResponse {
  id: number;
  doctorId: string;
  dob: string;
  phoneNumber: string;
  emailId: string;
  mobileVerified: boolean;
  parentDoctorCode: string | null;
  parentDoctorName: string | null;
  verified: boolean;
  name: string;
  formStatus: string;
  appDownloadStatus: boolean;
  pan: string;
  doctorCode: string;
  licenceNumber: string | null;
  clinicName: string | null;
  important: boolean;
  creatorId: string;
  joiningDate: string;
  scoutCode: string;
  beneId: string | null;
  qrInstallationStatus: boolean;
  virtualAccountCreated: boolean;
  doctorStatus: string;
  parentDoctorId: string | null;
  monthlyPotential: number;
  comment: string | null;
  cfAnchorId: string | null;
  fibeMid: string | null;
  cfMid: string | null;
  agreementSign: boolean;
  mvMerchantId: string | null;
  rpAccountId: string | null;
  archived: boolean;
  password: string | null;
  category: string | null;
  mid: string | null;
  qrcodeUrl: string | null;
}

export interface SaveDoctorResponse {
  status: number;
  data: DoctorResponse | null;
  attachment: any;
  message: string;
}

export interface DoctorProfessionalDetails {
  id: number;
  doctorId: string;
  licenceNumber: string;
  clinicName: string;
  businessEntityName: string;
  businessEntityType: string;
  cinLlpin: string;
  gstIn: string;
  speciality: string;
  googleReviewLink: string | null;
  justdialReviewLink: string | null;
  incorporationDate: string;
  addedOn?: number;
  updatedOn?: number | null;
  googleLinkHits?: number;
  justDialLinkHits?: number;
  monthlyPotential?: number;
  comment?: string | null;
}

export interface DoctorProfessionalPayload {
  id?: string;
  doctorId: string;
  licenceNumber: string;
  clinicName: string;
  incorporationDate: string; // Format: "DD-MM-YYYY" (e.g., "21-06-2001")
  businessEntityName: string;
  businessEntityType: string;
  cinLlpin: string;
  gstIn: string;
  speciality: string;
}

export interface DoctorProfessionalResponse {
  status: number;
  data: DoctorProfessionalDetails | null;
  attachment: any;
  message: string;
}

export interface AddressDetails {
  id: number;
  doctorId: string;
  state: string;
  city: string;
  building: string;
  locality: string;
  pinCode: string;
}

export interface AddressPayload {
  id?: string;
  doctorId: string;
  building: string;
  locality: string;
  pinCode: string;
  city: string;
  state: string;
  formStatus?: string;
}

export interface AddressResponse {
  status: number;
  data: AddressDetails | null;
  attachment: any;
  message: string;
}

export interface BankCodeDetail {
  branchName: string;
  branchCode: string;
  destrict: string;
  status: string;
  bankAddress: string;
  bankCode: string;
  ifsc: string;
  contact: number;
  city: string;
  state: string;
}

export interface BankDetails {
  id: number;
  doctorId: string;
  accountHolderName: string;
  accountNumber: string;
  accountType: string;
  bankAddress: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  addedOn?: number;
  updatedOn?: number | null;
  ifVerified?: boolean;
}

export interface BankDetailsPayload {
  id?: string;
  doctorId: string;
  accountHolderName: string;
  accountNumber: string;
  accountType: string;
  bankAddress: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
}

export interface BankDetailsResponse {
  status: number;
  data: BankDetails | null;
  attachment: any;
  message: string;
}

export interface DocumentDetails {
  id: number;
  userId: string;
  loanId: string | null;
  photographUrl: string | null;
  salaryProofUrl: string | null;
  panCardUrl: string | null;
  bankStatementUrl: string | null;
  adharCardUrl: string | null;
  status: string | null;
  cibilUrl: string | null;
  itrUrl: string | null;
  loanAgreement: string | null;
  stampDutyUrl: string | null;
  loanCheque: string | null;
  officeId: string | null;
  locationImg: string | null;
  address: string | null;
  city: string | null;
  comment: string | null;
  entityId: string | null;
  statementId: string | null;
  transactionData: string | null;
  finBoxStatementStatus: string | null;
  finBoxHit: number;
  signedLoanAggreement: string | null;
  currentAddressUrl: string | null;
  uploadDocumentStatus: boolean;
  gstUrl: string | null;
  otherDocUrl: string | null;
  multipleBankStatements: string | null;
  bankStatementPassword: string | null;
  otherDocName: string | null;
  auditTrailUrl: string | null;
  prescriptionUrl: string | null;
  adharCardBackUrl: string | null;
  doctorSignedAggrementUrl: string | null;
  rentAgreementUrl: string | null;
  electricityBillUrl: string | null;
  gasConnectionBillUrl: string | null;
  wifiBillUrl: string | null;
  telephoneBillUrl: string | null;
  treatmentProof: string | null;
}

export interface DocumentsResponse {
  status: number;
  data: DocumentDetails | null;
  attachment: any;
  message: string;
}

export interface ContractDetails {
  id: string;
  doctorId: string;
  signerId: string;
  signerUniqueId: string | null;
  contractStatus: string;
  pdfUrl: string;
  data: string;
  signerCallbackData: any | null;
  callbackData: any | null;
  addedOn: number;
  sign: boolean;
  esignUrl: string;
}

export interface ContractResponse {
  status: number;
  data: ContractDetails | null;
  attachment: any;
  message: string;
}

export interface AgreementSignStatus {
  contractStatus: string;
  fromStatus: string;
  signStatus: boolean;
}

export interface AgreementSignStatusResponse {
  status: number;
  data: AgreementSignStatus | null;
  attachment: any;
  message: string;
}

/**
 * Send OTP to the provided phone number
 * @param phoneNumber - The phone number to send OTP to
 * @returns Promise with API response
 */
export const sendOtp = async (phoneNumber: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sendOtp?phoneNumber=${encodeURIComponent(phoneNumber)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP for the provided phone number
 * @param phoneNumber - The phone number
 * @param otp - The OTP code to verify
 * @returns Promise with OTP verification response
 */
export const verifyOtp = async (phoneNumber: string, otp: string): Promise<OtpVerificationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getOtp?phoneNumber=${encodeURIComponent(phoneNumber)}&otp=${encodeURIComponent(otp)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OtpVerificationResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Utility function to validate phone number format
 * @param phoneNumber - Phone number to validate
 * @returns boolean indicating if phone number is valid
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Indian phone number validation (10 digits, starting with 6-9)
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Utility function to validate OTP format
 * @param otp - OTP to validate
 * @returns boolean indicating if OTP is valid
 */
export const validateOtp = (otp: string): boolean => {
  // OTP should be 4-6 digits
  const otpRegex = /^\d{4,6}$/;
  return otpRegex.test(otp);
};

/**
 * Utility function to format date to DD-MM-YYYY format
 * @param date - Date string in any format or Date object
 * @returns Formatted date string in DD-MM-YYYY format
 */
export const formatDateToDDMMYYYY = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Utility function to ensure date is in DD-MM-YYYY format
 * @param dateString - Date string in any format
 * @returns Formatted date string in DD-MM-YYYY format
 */
export const ensureDDMMYYYYFormat = (dateString: string): string => {
  try {
    if (!dateString) return '';
    
    // If already in DD-MM-YYYY format, return as is
    if (dateString.includes('-') && dateString.length === 10) {
      const parts = dateString.split('-');
      if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        return dateString; // Already in DD-MM-YYYY format
      }
    }
    
    // If in YYYY-MM-DD format, convert to DD-MM-YYYY
    if (dateString.includes('-') && dateString.length === 10) {
      const parts = dateString.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        const [year, month, day] = parts;
        return `${day}-${month}-${year}`;
      }
    }
    
    // Fallback to Date object parsing
    return formatDateToDDMMYYYY(dateString);
  } catch (error) {
    console.error('Error ensuring DD-MM-YYYY format:', error);
    return dateString; // Return original if formatting fails
  }
};

/**
 * Utility function to format date for backend API (YYYY-MM-DD format)
 * @param dateString - Date string in any format
 * @returns Formatted date string in YYYY-MM-DD format for backend
 */
export const formatDateForBackend = (dateString: string): string => {
  try {
    if (!dateString) return '';
    
    // Handle DD-MM-YYYY format (convert to YYYY-MM-DD)
    if (dateString.includes('-') && dateString.length === 10) {
      const parts = dateString.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        const [day, month, year] = parts;
        return `${year}-${month}-${day}`;
      }
    }
    
    // Handle YYYY-MM-DD format (already correct)
    if (dateString.includes('-') && dateString.length === 10) {
      const parts = dateString.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return dateString; // Already in correct format
      }
    }
    
    // Fallback to Date object parsing
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }
    
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date for backend:', error);
    return dateString; // Return original if formatting fails
  }
};

/**
 * Get doctor details by phone number
 * @param mobileNo - The mobile number to get doctor details for
 * @returns Promise with doctor details response
 */
export const getDoctorDetailsByPhoneNumber = async (mobileNo: string): Promise<DoctorDetailsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getDoctorDetailsByPhoneNumber?mobileNo=${encodeURIComponent(mobileNo)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DoctorDetailsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting doctor details:', error);
    throw error;
  }
};

/**
 * Get all scout codes
 * @returns Promise with scout codes response
 */
export const getAllScoutCodes = async (): Promise<ScoutCodesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllScoutCodes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ScoutCodesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting scout codes:', error);
    throw error;
  }
};

/**
 * Save or update doctor details
 * @param doctorData - The doctor data to save or update
 * @returns Promise with save/update response
 */
export const saveOrUpdateDoctorDetails = async (doctorData: DoctorPayload): Promise<SaveDoctorResponse> => {
  try {
    // Ensure dates are in DD-MM-YYYY format for backend API
    const formattedData = {
      ...doctorData,
      dob: ensureDDMMYYYYFormat(doctorData.dob),
      joiningDate: doctorData.joiningDate ? ensureDDMMYYYYFormat(doctorData.joiningDate) : undefined,
    };

    console.log('Sending formatted data to backend:', formattedData);

    const response = await fetch(`${API_BASE_URL}/saveOrUpdateDoctorDetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SaveDoctorResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving/updating doctor details:', error);
    throw error;
  }
};

/**
 * Get doctor professional details by doctor ID
 * @param doctorId - The doctor ID to get professional details for
 * @returns Promise with doctor professional details response
 */
export const getDoctorProfDetailsByDoctorId = async (doctorId: string): Promise<DoctorProfessionalResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getDoctorProfDetailsByDoctorId?doctorId=${encodeURIComponent(doctorId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DoctorProfessionalResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting doctor professional details:', error);
    throw error;
  }
};

/**
 * Save or update doctor professional details
 * @param professionalData - The professional data to save or update
 * @returns Promise with save/update response
 */
export const saveOrUpdateDoctorProfessionalDetails = async (professionalData: DoctorProfessionalPayload): Promise<DoctorProfessionalResponse> => {
  try {
    // Ensure dates are in DD-MM-YYYY format for backend API
    const formattedData = {
      ...professionalData,
      incorporationDate: ensureDDMMYYYYFormat(professionalData.incorporationDate),
    };

    console.log('Sending formatted professional data to backend:', formattedData);

    const response = await fetch(`${API_BASE_URL}/saveOrUpdateDoctorProfessionalDetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DoctorProfessionalResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving/updating doctor professional details:', error);
    throw error;
  }
};

/**
 * Get address details by doctor ID
 * @param doctorId - The doctor ID to get address details for
 * @returns Promise with address details response
 */
export const getAddressDetails = async (doctorId: string): Promise<AddressResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAddressDetails?doctorId=${encodeURIComponent(doctorId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AddressResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting address details:', error);
    throw error;
  }
};

/**
 * Save or update address details
 * @param addressData - The address data to save or update
 * @returns Promise with save/update response
 */
export const saveOrUpdateAddressDetails = async (addressData: AddressPayload): Promise<AddressResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/saveOrUpdateAddressDetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AddressResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving/updating address details:', error);
    throw error;
  }
};

/**
 * Get bank code details by IFSC code
 * @param code - The IFSC code to get bank details for
 * @param type - The type of code (e.g., "branch")
 * @returns Promise with bank code details
 */
export const getBankCodeDetail = async (code: string, type: string = "branch"): Promise<BankCodeDetail> => {
  try {
    const response = await fetch(`${API_BASE_URL}/userDetails/codeDetail?code=${encodeURIComponent(code)}&type=${encodeURIComponent(type)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BankCodeDetail = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting bank code details:', error);
    throw error;
  }
};

/**
 * Save or update bank details
 * @param bankData - The bank data to save or update
 * @returns Promise with save/update response
 */
export const saveOrUpdateBankDetails = async (bankData: BankDetailsPayload): Promise<BankDetailsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/saveOrUpdateBankDetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bankData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BankDetailsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving/updating bank details:', error);
    throw error;
  }
};

/**
 * Get documents by doctor ID
 * @param doctorId - The doctor ID to get documents for
 * @returns Promise with documents response
 */
export const getDocumentsByDoctorId = async (doctorId: string): Promise<DocumentsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getDocumentsByDoctorId?doctorId=${encodeURIComponent(doctorId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DocumentsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

/**
 * Initiate contract for doctor
 * @param doctorId - The doctor ID to initiate contract for
 * @returns Promise with contract initiation response
 */
export const initiateContract = async (doctorId: string): Promise<ContractResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/initiateContract?doctorId=${encodeURIComponent(doctorId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ContractResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error initiating contract:', error);
    throw error;
  }
};

/**
 * Get doctor agreement sign status
 * @param doctorId - The doctor ID to get agreement sign status for
 * @returns Promise with agreement sign status response
 */
export const getDoctorAggrementSignStatus = async (doctorId: string): Promise<AgreementSignStatusResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getDoctorAggrementSignStatus?doctorId=${encodeURIComponent(doctorId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AgreementSignStatusResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting doctor agreement sign status:', error);
    throw error;
  }
};

/**
 * Get bank details by doctor ID
 * @param doctorId - The doctor ID to get bank details for
 * @returns Promise with bank details response
 */
export const getBankDetailsByDoctorId = async (doctorId: string): Promise<BankDetailsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getBankDetailsByDoctorId?doctorId=${encodeURIComponent(doctorId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BankDetailsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting bank details:', error);
    throw error;
  }
};

export interface UploadPdfResponse {
  status: number;
  data: string | null; // URL string returned by the API
  attachment: any;
  message: string;
}

/**
 * Upload PDF/image file for document processing
 * @param file - The file to upload
 * @param fileName - The name identifier for the file (panCard, gst, cancelCheck)
 * @param type - The type of file (img, pdf)
 * @param userId - The user ID
 * @returns Promise with upload response
 */
export const uploadPdf = async (
  file: File, 
  fileName: 'panCard' | 'gst' | 'cancelCheck', 
  type: 'img' | 'pdf' = 'img',
  userId: string
): Promise<UploadPdfResponse> => {
  try {
    const formData = new FormData();
    formData.append('fileName', fileName);
    formData.append('uploadfile', file);
    formData.append('type', type);
    formData.append('userId', userId);

    const response = await fetch(`${API_BASE_URL}/uploadpdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // The API returns a URL string directly, not JSON
    const urlString = await response.text();
    
    // Create a proper response object
    const data: UploadPdfResponse = {
      status: response.status,
      data: urlString,
      attachment: null,
      message: 'File uploaded successfully'
    };
    
    return data;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};
