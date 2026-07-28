export interface PdfValidationResult {
  isValid: boolean;
  errorMessage?: string;
  fileSizeFormatted?: string;
}

export function validatePdfFile(file: File, maxSizeBytes: number = 10 * 1024 * 1024): PdfValidationResult {
  // Check PDF MIME type or extension
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  
  if (!isPdf) {
    return {
      isValid: false,
      errorMessage: 'Invalid file format. Please upload a valid PDF document (.pdf).'
    };
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      errorMessage: `File size exceeds maximum limit of ${maxSizeMb} MB.`
    };
  }

  // Format file size
  let formattedSize = '';
  if (file.size < 1024 * 1024) {
    formattedSize = `${(file.size / 1024).toFixed(1)} KB`;
  } else {
    formattedSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  }

  return {
    isValid: true,
    fileSizeFormatted: formattedSize
  };
}
