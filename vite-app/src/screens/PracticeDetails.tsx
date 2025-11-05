"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { getDoctorProfDetailsByDoctorId, saveOrUpdateDoctorProfessionalDetails, getDoctorDetailsByPhoneNumber, uploadPdf, getDocumentsByDoctorId } from "../services/api"
import { getGstInfo, getPanToGst, getPanToUdyam, getPanToCin, processGstCertificateOCR } from "../services/oculonApi"

type Data = {
  licenseNumber: string
  speciality: string
  clinicName: string
  businessEntity: string
  establishmentDate: string
  entityType: string
  cin: string
  gstin: string
}

type Props = {
  initial?: Partial<Data>
  onNext: (data: Data) => void
  onBack: () => void
}

const specialities = [ "Select Speciality", "Dermatology", "General Medicine", "Pediatrics", "Orthopedics", "ENT", "Dentistry", "Cosmetology", "Ayurveda","Prosthetics","IVF & Fertility Care", "Ophthalmology", "Hearing Aids", "Physiotherapy", "Nutrition & Dietetics", "Homeopathy", "Allopathy", "Cardiology", "Endocrinology", "Gastroenterology", "Hematology", "Neurology", "Oncology", "Pediatrics", "Psychiatry", "Radiology", "Surgery", "Urology", "Anesthesia", "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", "Hematology", "Neurology", "Oncology", "Pediatrics", "Psychiatry", "Radiology", "Surgery", "Urology"]
const entityTypes = [ "Select Entity Type", "Private Limited Company", "Proprietorship", "LLP (Limited Liability Partnership)", "Partnership", "Public Limited Company"]

// Date formatting utility functions
const formatDateForDatePicker = (dateString: string): string => {
  if (!dateString) return ""
  
  // Handle DD-MM-YYYY format (from API responses)
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('-')
    return `${year}-${month}-${day}` // Convert to YYYY-MM-DD for date picker
  }
  
  // Handle YYYY-MM-DD format (already correct for date picker)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }
  
  // Handle other date formats by parsing with Date object
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  } catch (error) {
    console.error("Error parsing date:", dateString, error)
  }
  
  return ""
}

const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return ""
  
  // Handle YYYY-MM-DD format (from date picker)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-')
    return `${day}-${month}-${year}` // Convert to DD-MM-YYYY for API
  }
  
  // Handle DD-MM-YYYY format (already correct for API)
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    return dateString
  }
  
  // Handle other date formats by parsing with Date object
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    }
  } catch (error) {
    console.error("Error parsing date for API:", dateString, error)
  }
  
  return ""
}

const parseDateFromAPIResponse = (dateString: string): string => {
  if (!dateString) return ""
  
  // Handle DD-MM-YYYY format (from API responses)
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    return formatDateForDatePicker(dateString)
  }
  
  // Handle MM/DD/YYYY format (from some API responses)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [month, day, year] = dateString.split('/')
    const formattedDate = `${day}-${month.padStart(2, '0')}-${year}`
    return formatDateForDatePicker(formattedDate)
  }
  
  // Handle YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }
  
  // Handle date with time (extract date part only)
  if (dateString.includes(' ')) {
    const datePart = dateString.split(' ')[0]
    return parseDateFromAPIResponse(datePart)
  }
  
  // Handle other formats
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  } catch (error) {
    console.error("Error parsing date from API response:", dateString, error)
  }
  
  return ""
}

// Mapping function to convert constitution_of_business to entityTypes
const mapConstitutionToEntityType = (constitution: string): string => {
  if (!constitution) return entityTypes[0] // Default to "Select Entity Type" (index 1)
  
  const constitutionLower = constitution.toLowerCase()
  let mappedType = entityTypes[0] // Default to "Select Entity Type"
  
  // Map common constitution_of_business values to entityTypes
  if (constitutionLower.includes('private') && constitutionLower.includes('limited')) {
    mappedType = "Private Limited Company"
  } else if (constitutionLower.includes('proprietorship') || constitutionLower.includes('individual')) {
    mappedType = "Proprietorship"
  } else if (constitutionLower.includes('llp') || constitutionLower.includes('limited liability partnership')) {
    mappedType = "LLP (Limited Liability Partnership)"
  } else if (constitutionLower.includes('partnership')) {
    mappedType = "Partnership"
  } else if (constitutionLower.includes('public') && constitutionLower.includes('limited')) {
    mappedType = "Public Limited Company"
  } else if (constitutionLower.includes('company')) {
    mappedType = "Private Limited Company" // Default company type
  } else if (constitutionLower.includes('firm')) {
    mappedType = "Partnership" // Default firm type
  } else {
    // Check if the original value (case-insensitive) exists in entityTypes
    const matchingType = entityTypes.find(type => 
      type.toLowerCase() === constitutionLower || 
      type.toLowerCase().includes(constitutionLower) ||
      constitutionLower.includes(type.toLowerCase())
    )
    if (matchingType) {
      mappedType = matchingType
    }
  }
  
  console.log(`Mapping constitution "${constitution}" to entity type "${mappedType}"`)
  return mappedType
}

export default function PracticeDetails({ initial, onNext, onBack }: Props) {
  const [form, setForm] = useState<Data>({
    licenseNumber: initial?.licenseNumber || "",
    speciality: initial?.speciality || specialities[0], // Default to first actual speciality
    clinicName: initial?.clinicName || "",
    businessEntity: initial?.businessEntity || "",
    establishmentDate: initial?.establishmentDate || "",
    entityType: initial?.entityType || entityTypes[1], // Default to first actual entity type
    cin: initial?.cin || "",
    gstin: initial?.gstin || "",
  })
  const [loading, setLoading] = useState(true)
  const [gstLoading, setGstLoading] = useState(false)
  const [panAutoFillLoading, setPanAutoFillLoading] = useState(false)
  const [cinValidation, setCinValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: "" })
  const [gstCertificateUploading, setGstCertificateUploading] = useState(false)
  const [gstCertificateProcessing, setGstCertificateProcessing] = useState(false)
  const [gstCertificateFile, setGstCertificateFile] = useState<File | null>(null)
  const [gstCertificateUrl, setGstCertificateUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Track which data is already available to avoid unnecessary API calls
  const [dataAvailability, setDataAvailability] = useState({
    hasGstin: false,
    hasBusinessEntity: false,
    hasEntityType: false,
    hasEstablishmentDate: false,
    hasCin: false
  })

  // GSTIN validation function
  const isValidGstin = (gstin: string): boolean => {
    // GSTIN format: 2 digits (state code) + 10 characters (PAN) + 1 character (entity number) + 1 character (Z) + 1 character (checksum)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    return gstinRegex.test(gstin)
  }

  // CIN validation function
  const isValidCin = (cin: string): boolean => {
    // CIN format: L/U + 5 digits (industry code) + 2 letters (state code) + 4 digits (year) + 3 letters (ownership type) + 6 digits (registration number)
    // Example: U72900MH2020PTC123456
    const cinRegex = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/
    return cinRegex.test(cin)
  }

  // CIN validation with detailed feedback
  const validateCin = (cin: string) => {
    if (!cin) {
      setCinValidation({ isValid: true, message: "" })
      return
    }

    if (cin.length !== 21) {
      setCinValidation({ isValid: false, message: "CIN must be exactly 21 characters long" })
      return
    }

    if (!/^[LU]/.test(cin)) {
      setCinValidation({ isValid: false, message: "CIN must start with L (Listed) or U (Unlisted)" })
      return
    }

    if (!/^[LU]\d{5}/.test(cin)) {
      setCinValidation({ isValid: false, message: "Invalid industry code (positions 2-6 must be 5 digits)" })
      return
    }

    if (!/^[LU]\d{5}[A-Z]{2}/.test(cin)) {
      setCinValidation({ isValid: false, message: "Invalid state code (positions 7-8 must be 2 letters)" })
      return
    }

    if (!/^[LU]\d{5}[A-Z]{2}\d{4}/.test(cin)) {
      setCinValidation({ isValid: false, message: "Invalid year of incorporation (positions 9-12 must be 4 digits)" })
      return
    }

    if (!/^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}/.test(cin)) {
      setCinValidation({ isValid: false, message: "Invalid ownership type (positions 13-15 must be 3 letters)" })
      return
    }

    if (!/^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cin)) {
      setCinValidation({ isValid: false, message: "Invalid registration number (positions 16-21 must be 6 digits)" })
      return
    }

    setCinValidation({ isValid: true, message: "Valid CIN format" })
  }

  // Use the new date formatting utility function
  const formatDateToYYYYMMDD = formatDateForDatePicker

  // Load existing professional details on component mount
  useEffect(() => {
    const loadProfessionalDetails = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId')
        if (doctorId) {
          const response = await getDoctorProfDetailsByDoctorId(doctorId)
          if (response.status === 200 && response.data) {
            const data = response.data
            setForm({
              licenseNumber: data.licenceNumber || "",
              speciality: data.speciality || specialities[1], // Default to first actual speciality
              clinicName: data.clinicName || "",
              businessEntity: data.businessEntityName || "",
              establishmentDate: data.incorporationDate ? parseDateFromAPIResponse(data.incorporationDate) : "",
              entityType: data.businessEntityType || entityTypes[1], // Default to first actual entity type
              cin: data.cinLlpin || "",
              gstin: data.gstIn || "",
            })
            console.log("Professional details loaded:", data)
          }
        }

        // Load existing GST document
        if (doctorId) {
          try {
            const documentsResponse = await getDocumentsByDoctorId(doctorId)
            if (documentsResponse.status === 200 && documentsResponse.data?.gstUrl) {
              setGstCertificateUrl(documentsResponse.data.gstUrl)
              console.log("GST document loaded:", documentsResponse.data.gstUrl)
            }
          } catch (error) {
            console.error("Error loading GST document:", error)
          }
        }
      } catch (error) {
        console.error("Error loading professional details:", error)
        // Continue with empty form if error
      } finally {
        setLoading(false)
      }
    }

    loadProfessionalDetails()
  }, [])

  const update = (k: keyof Data, v: string) => setForm((f) => ({ ...f, [k]: v }))

  // Debounce utility function
  const debounce = useCallback(
    <T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void => {
      let timeout: number | null = null
      return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
      }
    },
    []
  )

  // Function to call GST API and auto-fill details
  const fetchGstDetails = useCallback(async (gstin: string) => {
    if (!isValidGstin(gstin)) {
      return
    }

    try {
      setGstLoading(true)
      const response = await getGstInfo(gstin)
      
      if (response.success && response.data) {
        const gstData = response.data
        
        // Convert date from YYYY-MM-DD to DD-MM-YYYY format
        const formatDateToDDMMYYYY = (dateString: string) => {
          if (!dateString) return ""
          const [year, month, day] = dateString.split('-')
          return `${day}-${month}-${year}`
        }

        // Auto-fill practice details
        setForm(prevForm => ({
          ...prevForm,
          businessEntity: prevForm.businessEntity || gstData.business_name || "",
          entityType: (prevForm.entityType && prevForm.entityType !== entityTypes[0] && prevForm.entityType !== entityTypes[1]) ? prevForm.entityType : mapConstitutionToEntityType(gstData.constitution_of_business),
          establishmentDate: prevForm.establishmentDate || parseDateFromAPIResponse(gstData.date_of_registration) || ""
        }))

        // Parse and save address details
        if (gstData.address) {
          await saveAddressFromGst(gstData.address)
        }
        
        console.log("GST details loaded:", gstData)
      }
    } catch (error) {
      console.error("Error fetching GST details:", error)
      // Don't show error to user as this is optional functionality
    } finally {
      setGstLoading(false)
    }
  }, [])

  // Function to call PAN-based APIs and auto-fill details
  const fetchPanBasedDetails = useCallback(async (pan: string) => {
    if (!pan || pan.length !== 10) {
      return
    }

    // Check if we already have all the data we need
    const hasAllData = dataAvailability.hasGstin && 
                      dataAvailability.hasBusinessEntity && 
                      dataAvailability.hasEntityType && 
                      dataAvailability.hasEstablishmentDate && 
                      dataAvailability.hasCin

    if (hasAllData) {
      console.log("All practice details already available, skipping PAN-based API calls")
      return
    }

    try {
      setPanAutoFillLoading(true)
      
      // Prepare API calls based on what data we need
      const apiCalls = []
      
      // Only call PAN-to-GST if we don't have GSTIN or business details
      if (!dataAvailability.hasGstin || !dataAvailability.hasBusinessEntity || !dataAvailability.hasEstablishmentDate) {
        apiCalls.push(getPanToGst(pan))
      }
      
      // Only call PAN-to-Udyam if we don't have business entity details
      if (!dataAvailability.hasBusinessEntity || !dataAvailability.hasEstablishmentDate) {
        apiCalls.push(getPanToUdyam(pan))
      }
      
      // Only call PAN-to-CIN if we don't have CIN
      if (!dataAvailability.hasCin) {
        apiCalls.push(getPanToCin(pan))
      }

      if (apiCalls.length === 0) {
        console.log("No PAN-based API calls needed - all data already available")
        setPanAutoFillLoading(false)
        return
      }

      console.log(`Making ${apiCalls.length} PAN-based API calls for missing data`)
      
      // Call only the needed APIs in parallel
      const responses = await Promise.allSettled(apiCalls)

      // Process responses based on which APIs were called
      let responseIndex = 0
      
      // Process PAN to GST response (if called)
      if (!dataAvailability.hasGstin || !dataAvailability.hasBusinessEntity || !dataAvailability.hasEstablishmentDate) {
        const panToGstResponse = responses[responseIndex++]
        if (panToGstResponse.status === 'fulfilled' && panToGstResponse.value.success && panToGstResponse.value.data) {
          const gstData = panToGstResponse.value.data as any // Type assertion for PAN-to-GST data
          
          // Auto-fill GSTIN if not already filled
          if (!form.gstin && gstData.gstin) {
            setForm(prevForm => ({
              ...prevForm,
              gstin: gstData.gstin
            }))
          }
          
          // Auto-fill business entity details if not already filled
          setForm(prevForm => ({
            ...prevForm,
            businessEntity: prevForm.businessEntity || gstData.tradeNameOfBusiness || "",
            entityType: (prevForm.entityType && prevForm.entityType !== entityTypes[0] && prevForm.entityType !== entityTypes[1]) ? prevForm.entityType : mapConstitutionToEntityType(gstData.constitutionOfBusiness),
            establishmentDate: prevForm.establishmentDate || parseDateFromAPIResponse(gstData.registrationDate) || ""
          }))

          // Parse and save address details from GST
          if (gstData.principalPlaceAddress) {
            await saveAddressFromGst(gstData.principalPlaceAddress)
          }
          
          console.log("PAN to GST details loaded:", gstData)
        }
      }

      // Process PAN to Udyam response (if called)
      if (!dataAvailability.hasBusinessEntity || !dataAvailability.hasEstablishmentDate) {
        const panToUdyamResponse = responses[responseIndex++]
        if (panToUdyamResponse.status === 'fulfilled' && panToUdyamResponse.value.success && panToUdyamResponse.value.data) {
          const udyamData = panToUdyamResponse.value.data as any // Type assertion for PAN-to-Udyam data
          
          // Auto-fill business entity details if not already filled
          setForm(prevForm => ({
            ...prevForm,
            businessEntity: prevForm.businessEntity || udyamData.nameOfEnterprise || "",
            entityType: (prevForm.entityType && prevForm.entityType !== entityTypes[0] && prevForm.entityType !== entityTypes[1]) ? prevForm.entityType : mapConstitutionToEntityType(udyamData.organisationType),
            establishmentDate: prevForm.establishmentDate || parseDateFromAPIResponse(udyamData.dateOfIncorporation) || ""
          }))

          // Parse and save address details from Udyam
          if (udyamData.address) {
            await saveAddressFromGst(udyamData.address)
          }
          
          console.log("PAN to Udyam details loaded:", udyamData)
        }
      }

      // Process PAN to CIN response (if called)
      if (!dataAvailability.hasCin) {
        const panToCinResponse = responses[responseIndex++]
        if (panToCinResponse.status === 'fulfilled' && panToCinResponse.value.success && panToCinResponse.value.data) {
          const cinData = panToCinResponse.value.data as any // Type assertion for PAN-to-CIN data
          
          // Auto-fill CIN if not already filled and company data is available
          if (!form.cin && cinData.company && cinData.company.length > 0) {
            setForm(prevForm => ({
              ...prevForm,
              cin: cinData.company[0].companyID || ""
            }))
          }
          
          // Auto-fill business entity name if not already filled
          if (cinData.company && cinData.company.length > 0) {
            setForm(prevForm => ({
              ...prevForm,
              businessEntity: prevForm.businessEntity || cinData.company[0].companyName || ""
            }))
          }
          
          console.log("PAN to CIN details loaded:", cinData)
        }
      }

    } catch (error) {
      console.error("Error fetching PAN-based details:", error)
      // Don't show error to user as this is optional functionality
    } finally {
      setPanAutoFillLoading(false)
    }
  }, [dataAvailability, form.gstin, form.businessEntity, form.entityType, form.establishmentDate, form.cin])

  // Debounced GST API call
  const debouncedGstFetch = useCallback(
    debounce(fetchGstDetails, 1000),
    [fetchGstDetails]
  )

  // Debounced PAN-based API call
  const debouncedPanFetch = useCallback(
    debounce(fetchPanBasedDetails, 1000),
    [fetchPanBasedDetails]
  )

  // Effect to trigger PAN-based auto-fill on component load
  useEffect(() => {
    const triggerPanAutoFill = async () => {
      if (!loading) {
        // Get PAN from localStorage (saved from PersonalDetails)
        let pan = localStorage.getItem('savedPan')
        
        if (pan) {
          console.log("Found saved PAN:", pan)
          debouncedPanFetch(pan)
        } else {
          // If no saved PAN, try to get it from doctor details API
          const doctorId = localStorage.getItem('doctorId')
          if (doctorId) {
            try {
              // Get phone number from localStorage (should be available from previous steps)
              const phoneNumber = localStorage.getItem('phoneNumber')
              if (phoneNumber) {
                const response = await getDoctorDetailsByPhoneNumber(phoneNumber)
                if (response.status === 200 && response.data && response.data.pan) {
                  pan = response.data.pan
                  console.log("Retrieved PAN from doctor details:", pan)
                  if (pan) {
                    debouncedPanFetch(pan)
                  }
                }
              }
            } catch (error) {
              console.error("Error fetching doctor details for PAN:", error)
            }
          }
        }
      }
    }

    triggerPanAutoFill()
  }, [loading, debouncedPanFetch])

  // Effect to trigger GST API call when GSTIN changes (only if not already filled by PAN APIs)
  useEffect(() => {
    if (form.gstin && !loading && !panAutoFillLoading) {
      // Only call GST API if we don't already have business entity details
      // This prevents unnecessary API calls when data is already available from PAN APIs
      const needsBusinessData = !dataAvailability.hasBusinessEntity || !dataAvailability.hasEstablishmentDate
      
      if (needsBusinessData) {
        console.log("Calling GST API for missing business data")
        debouncedGstFetch(form.gstin)
      } else {
        console.log("Skipping GST API call - business data already available")
      }
    }
  }, [form.gstin, debouncedGstFetch, loading, panAutoFillLoading, dataAvailability.hasBusinessEntity, dataAvailability.hasEstablishmentDate])

  // Effect to validate CIN when it changes
  useEffect(() => {
    if (form.cin && !loading) {
      validateCin(form.cin)
    }
  }, [form.cin, loading])

  // Effect to update data availability tracking
  useEffect(() => {
    setDataAvailability({
      hasGstin: !!form.gstin,
      hasBusinessEntity: !!form.businessEntity,
      hasEntityType: !!form.entityType && form.entityType !== entityTypes[0] && form.entityType !== entityTypes[1], // Not "Select Entity Type"
      hasEstablishmentDate: !!form.establishmentDate,
      hasCin: !!form.cin
    })
  }, [form.gstin, form.businessEntity, form.entityType, form.establishmentDate, form.cin])

  // Function to parse and save address from GST data
  const saveAddressFromGst = async (addressString: string) => {
    try {
      // Parse address components from the address string
      // Example: "Ground Floor, C - 6/3, Safdarjung Development Area, Hauz Khas, NEW DELHI, New Delhi, Delhi, 110016"
      const addressParts = addressString.split(',').map(part => part.trim())
      
      let building = ""
      let locality = ""
      let city = ""
      let state = ""
      let pincode = ""
      
      // Extract pincode (last part that's 6 digits)
      const pincodeMatch = addressString.match(/\b\d{6}\b/)
      if (pincodeMatch) {
        pincode = pincodeMatch[0]
      }
      
      // Extract state (usually second to last part)
      if (addressParts.length >= 2) {
        state = addressParts[addressParts.length - 2] || ""
      }
      
      // Extract city (usually third to last part)
      if (addressParts.length >= 3) {
        city = addressParts[addressParts.length - 3] || ""
      }
      
      // Extract locality (usually fourth to last part)
      if (addressParts.length >= 4) {
        locality = addressParts[addressParts.length - 4] || ""
      }
      
      // Extract building (first few parts)
      if (addressParts.length >= 5) {
        building = addressParts.slice(0, addressParts.length - 4).join(', ')
      }
      
      // Save address details to localStorage for next page
      const addressData = {
        building,
        locality,
        city,
        state,
        pincode,
        fullAddress: addressString
      }
      
      localStorage.setItem('gstAddressData', JSON.stringify(addressData))
      console.log("Address data saved from GST:", addressData)
      
    } catch (error) {
      console.error("Error parsing GST address:", error)
    }
  }

  // GST Certificate upload handler
  const handleGstCertificateUpload = async (file: File) => {
    try {
      setGstCertificateUploading(true)
      setError(null)

      // Get doctor ID from localStorage
      const doctorId = localStorage.getItem('doctorId')
      if (!doctorId) {
        throw new Error("Doctor ID not found. Please try again.")
      }

      // Step 1: Upload PDF using uploadPdf API
      console.log("Uploading GST certificate PDF...")
      const uploadResponse = await uploadPdf(file, 'gst', 'pdf', doctorId)
      
      if (!uploadResponse.data) {
        throw new Error("Failed to upload GST certificate")
      }

      console.log("GST certificate uploaded successfully:", uploadResponse.data)
      
      // Store the uploaded file URL for preview
      setGstCertificateUrl(uploadResponse.data)

      // Step 2: Process OCR using the uploaded file
      setGstCertificateProcessing(true)
      console.log("Processing GST certificate OCR...")
      const ocrResponse = await processGstCertificateOCR(file)
      
      if (!ocrResponse.success || !ocrResponse.data) {
        throw new Error("Failed to extract GST certificate details")
      }

      const ocrData = ocrResponse.data
      console.log("GST certificate OCR completed:", ocrData)

      // Step 3: Auto-fill form fields from OCR data
      setForm(prevForm => ({
        ...prevForm,
        gstin: ocrData.gstin_number || prevForm.gstin,
        businessEntity: ocrData.business_name || prevForm.businessEntity,
        entityType: mapConstitutionToEntityType(ocrData.constitution_of_business) || prevForm.entityType,
        establishmentDate: parseDateFromAPIResponse(ocrData.date_of_registration) || prevForm.establishmentDate
      }))

      // Parse and save address details from GST certificate
      if (ocrData.address) {
        await saveAddressFromGst(ocrData.address)
      }

      console.log("GST certificate details auto-filled successfully")
      
    } catch (error) {
      console.error("Error processing GST certificate:", error)
      setError(error instanceof Error ? error.message : "Failed to process GST certificate")
    } finally {
      setGstCertificateUploading(false)
      setGstCertificateProcessing(false)
    }
  }

  // File input change handler
  const handleGstCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF, JPEG, or PNG file")
        return
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setError("File size must be less than 10MB")
        return
      }

      setGstCertificateFile(file)
      handleGstCertificateUpload(file)
    }
  }
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate CIN if provided
    if (form.cin && !cinValidation.isValid) {
      setError("Please enter a valid CIN format.")
      return
    }
    
    try {
      const doctorId = localStorage.getItem('doctorId')
      if (!doctorId) {
        setError("Doctor ID not found. Please try again.")
        return
      }

      // Prepare data for API
      const professionalData = {
        id: "",
        doctorId: doctorId,
        licenceNumber: form.licenseNumber,
        clinicName: form.clinicName,
        incorporationDate: formatDateForAPI(form.establishmentDate), // Convert to DD-MM-YYYY format for API
        businessEntityName: form.businessEntity,
        businessEntityType: form.entityType,
        cinLlpin: form.cin,
        gstIn: form.gstin,
        speciality: form.speciality
      }

      // Save professional details
      const response = await saveOrUpdateDoctorProfessionalDetails(professionalData)
      
      if (response.status === 200) {
        console.log("Professional details saved successfully:", response.data)
        onNext(form)
      } else {
        setError("Failed to save professional details. Please try again.")
      }
    } catch (error) {
      console.error("Error saving professional details:", error)
      setError("Error saving professional details. Please check your connection and try again.")
    }
  }

  if (loading) {
    return (
      <section className="card card--padded">
        <div className="loading">Loading professional details...</div>
      </section>
    )
  }

  return (
    <section className="card card--padded">
      <img src="/images/practice-details.png" alt="" className="sr-only" />
      <button className="link link--back" type="button" onClick={onBack} aria-label="Back">
        ←
      </button>

      {/* Error Message Display */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#721c24',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="form">
        <label className="label">Clinic name</label>
        <input className="input" value={form.clinicName} onChange={(e) => update("clinicName", e.target.value)} />

        <label className="label">Speciality</label>
        <select className="input" value={form.speciality} onChange={(e) => update("speciality", e.target.value)}>
          {specialities.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* GST Certificate Upload */}
        <div style={{ marginBottom: '20px' }}>
          <label className="label">Upload GST Certificate</label>
          <div style={{ 
            border: '2px dashed #ccc', 
            borderRadius: '8px', 
            padding: '20px', 
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            cursor: 'pointer',
            position: 'relative'
          }}>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleGstCertificateFileChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
              disabled={gstCertificateUploading || gstCertificateProcessing}
            />
            {gstCertificateUploading || gstCertificateProcessing ? (
              <div>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                  {gstCertificateUploading ? '📤 Uploading...' : '🔍 Processing OCR...'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {gstCertificateUploading ? 'Uploading your GST certificate' : 'Extracting details from certificate'}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                  📄 Click to upload GST certificate
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Supports PDF, JPEG, PNG (Max 10MB)
                </div>
                {gstCertificateFile && (
                  <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '8px' }}>
                    ✓ {gstCertificateFile.name}
                  </div>
                )}
              </div>
            )}
          </div>
          {(gstCertificateUploading || gstCertificateProcessing) && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
              This will automatically fill the GSTIN and business details below
            </div>
          )}
        </div>

        {/* GST Certificate Preview */}
        {gstCertificateUrl && (
          <div style={{ marginTop: '16px', marginBottom: '20px' }}>
            <label className="label">Uploaded GST Certificate Preview</label>
            <div style={{
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa',
              marginBottom: '1rem',
              overflow: 'hidden'
            }}>
              {/* PDF Content Area */}
              <div style={{
                backgroundColor: 'white',
                minHeight: '500px',
                padding: '1rem',
                position: 'relative'
              }}>
                {gstCertificateUrl.includes('type=pdf') || gstCertificateUrl.toLowerCase().includes('.pdf') ? (
                  <iframe
                    src={gstCertificateUrl}
                    style={{
                      width: '100%',
                      height: '500px',
                      border: 'none',
                      borderRadius: '4px'
                    }}
                    title="GST Certificate PDF"
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '500px',
                    color: '#666',
                    fontSize: '1.1rem'
                  }}>
                    <img 
                      src={gstCertificateUrl} 
                      alt="Uploaded GST certificate preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '500px', 
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <label className="label">GSTIN</label>
        <input 
          className="input" 
          value={form.gstin} 
          onChange={(e) => update("gstin", e.target.value.toUpperCase())} 
          placeholder="24AAACC1206D1ZM"
        />
        {gstLoading && (
          <div className="gst-loading" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            🔍 Looking up GST details...
          </div>
        )}
        {panAutoFillLoading && (
          <div className="pan-auto-fill-loading" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            🔍 Auto-filling missing details from PAN...
          </div>
        )}

        <label className="label">Full name of business entity</label>
        <input
          className="input"
          value={form.businessEntity}
          onChange={(e) => update("businessEntity", e.target.value)}
        />

        <label className="label">Date of establishment of clinic/hospital</label>
        <input
          type="date"
          className="input"
          value={form.establishmentDate}
          onChange={(e) => update("establishmentDate", e.target.value)}
        />

        <label className="label">Type of entity</label>
        <select className="input" value={form.entityType} onChange={(e) => update("entityType", e.target.value)}>
          {entityTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label className="label">CIN/LLPIN</label>
        <input 
          className="input" 
          value={form.cin} 
          onChange={(e) => update("cin", e.target.value.toUpperCase())} 
          placeholder="U72900MH2020PTC123456"
          maxLength={21}
        />
        {form.cin && (
          <div 
            className="cin-validation" 
            style={{ 
              fontSize: '12px', 
              marginTop: '4px',
              color: cinValidation.isValid ? '#28a745' : '#dc3545'
            }}
          >
            {cinValidation.isValid ? '✅' : '❌'} {cinValidation.message}
          </div>
        )}
        {form.cin && cinValidation.isValid && (
          <div className="cin-breakdown" style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
            <div>📊 <strong>CIN Breakdown:</strong></div>
            <div>• Status: {form.cin[0] === 'L' ? 'Listed' : 'Unlisted'}</div>
            <div>• Industry: {form.cin.substring(1, 6)}</div>
            <div>• State: {form.cin.substring(6, 8)}</div>
            <div>• Year: {form.cin.substring(8, 12)}</div>
            <div>• Type: {form.cin.substring(12, 15)}</div>
            <div>• Reg No: {form.cin.substring(15, 21)}</div>
          </div>
        )}

        <label className="label">Medical Licence Number</label>
        <input className="input" value={form.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} />

        <div className="row">
          <button className="btn btn--ghost" type="button" onClick={onBack}>
            Back
          </button>
          <button className="btn btn--primary" type="submit">
            Next
          </button>
        </div>
      </form>
    </section>
  )
}
