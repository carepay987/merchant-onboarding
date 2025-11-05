// Base URL for Oculon API
const OCULON_BASE_URL = 'https://oculon.carepay.money';

// Types for the API response
export interface ExtractedData {
  gender: string;
  age: string;
  dob: string; // Format: "DD-MM-YYYY" (e.g., "21-06-2001")
  pan: string;
  name: {
    full_name: string;
    first_name: string;
    last_name: string;
  };
  first_name: string;
  last_name: string;
  addresses: Array<{
    address: string;
    state: string;
    postal: string;
    type: string;
    reported_date: string;
  }>;
  emails: string[];
  pincode: string;
}

export interface PhonePrefillResponse {
  success: boolean;
  data: {
    phone_number: string;
    first_name: string;
    data_available: boolean;
    extracted_data: ExtractedData;
    timestamp: string;
  };
  message: string;
}

export interface PhonePrefillRequest {
  phone_number: string;
  first_name: string;
}

export interface GstInfoResponse {
  success: boolean;
  data: {
    gstn_number: string;
    business_name: string;
    constitution_of_business: string;
    date_of_registration: string;
    address: string;
    source: string;
  };
  message: string;
  timestamp: string;
}

export interface PanToGstResponse {
  success: boolean;
  data: {
    pan_number: string;
    constitutionOfBusiness: string;
    tradeNameOfBusiness: string;
    registrationDate: string;
    principalPlaceAddress: string;
    gstin: string;
  };
  message: string;
  timestamp: string;
}

export interface PanToUdyamResponse {
  success: boolean;
  data: {
    pan_number: string;
    udyamRegistrationNumber: string;
    nameOfEnterprise: string;
    organisationType: string;
    dateOfIncorporation: string;
    address: string;
  };
  message: string;
  timestamp: string;
}

export interface PanToCinResponse {
  success: boolean;
  data: {
    pan_number: string;
    PanName: string | null;
    company: Array<{
      companyName: string;
      companyID: string; // This is the CIN
    }>;
  };
  message: string;
  timestamp: string;
}

export interface CancelledChequeOCRResponse {
  success: boolean;
  message: string;
  data: {
    account_number: string;
    ifsc_code: string;
    account_holder_name: string;
    account_type: string;
  };
}

export interface PanCardOCRResponse {
  success: boolean;
  message: string;
  data: {
    pan_card_number: string;
    person_name: string;
    date_of_birth: string;
    father_name: string;
  };
}

export interface GstCertificateOCRResponse {
  success: boolean;
  message: string;
  data: {
    gstin_number: string;
    business_name: string;
    constitution_of_business: string;
    date_of_registration: string;
    address: string;
  };
}

// API function for phone prefill
export const getPhonePrefillData = async (
  requestData: PhonePrefillRequest
): Promise<PhonePrefillResponse> => {
  try {
    const response = await fetch(`${OCULON_BASE_URL}/api/phone-prefill/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PhonePrefillResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching phone prefill data:', error);
    throw error;
  }
};

// API function for GST info
export const getGstInfo = async (gstnNumber: string): Promise<GstInfoResponse> => {
  try {
    const response = await fetch(`${OCULON_BASE_URL}/api/gst-info/${gstnNumber}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GstInfoResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching GST info:', error);
    throw error;
  }
};

// API function for PAN to GST conversion
export const getPanToGst = async (panNumber: string): Promise<PanToGstResponse> => {
  try {
    const response = await fetch(`${OCULON_BASE_URL}/api/pan-to-gst/${panNumber}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PanToGstResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching PAN to GST data:', error);
    throw error;
  }
};

// API function for PAN to Udyam conversion
export const getPanToUdyam = async (panNumber: string): Promise<PanToUdyamResponse> => {
  try {
    const response = await fetch(`${OCULON_BASE_URL}/api/pan-to-udyam/${panNumber}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PanToUdyamResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching PAN to Udyam data:', error);
    throw error;
  }
};

// API function for PAN to CIN conversion
export const getPanToCin = async (panNumber: string): Promise<PanToCinResponse> => {
  try {
    const response = await fetch(`${OCULON_BASE_URL}/api/pan-to-cin/${panNumber}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PanToCinResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching PAN to CIN data:', error);
    throw error;
  }
};

// API function for cancelled cheque OCR
export const processCancelledChequeOCR = async (document: File): Promise<CancelledChequeOCRResponse> => {
  try {
    const formData = new FormData();
    formData.append('document', document);

    const response = await fetch(`${OCULON_BASE_URL}/ocr/cancel-check-ocr/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CancelledChequeOCRResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing cancelled cheque OCR:', error);
    throw error;
  }
};

// API function for PAN card OCR
export const processPanCardOCR = async (document: File): Promise<PanCardOCRResponse> => {
  try {
    const formData = new FormData();
    formData.append('document', document);

    const response = await fetch(`${OCULON_BASE_URL}/ocr/pan-card/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PanCardOCRResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing PAN card OCR:', error);
    throw error;
  }
};

// API function for GST certificate OCR
export const processGstCertificateOCR = async (document: File): Promise<GstCertificateOCRResponse> => {
  try {
    const formData = new FormData();
    formData.append('document', document);

    const response = await fetch(`${OCULON_BASE_URL}/ocr/gst-certificate/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GstCertificateOCRResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing GST certificate OCR:', error);
    throw error;
  }
};

// Example usage:
// const phoneData = await getPhonePrefillData({
//   phone_number: "9799333998",
//   first_name: "Naval Kumar"
// });

// const gstData = await getGstInfo("07AAFCD8078F1ZG");

// const panToGstData = await getPanToGst("AJQPG3374G");

// const panToUdyamData = await getPanToUdyam("EFXPK2781G");

// const panToCinData = await getPanToCin("AJQPG3374G");

// const cancelledChequeData = await processCancelledChequeOCR(documentFile);

// const panCardData = await processPanCardOCR(documentFile);

// const gstCertificateData = await processGstCertificateOCR(documentFile);
