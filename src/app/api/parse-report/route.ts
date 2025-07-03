import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const maxDuration = 60;

interface HealthParameter {
  parameter: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'high' | 'low';
}

// Simplified health parameter patterns - Updated for tabular lab report formats
const healthPatterns = [
  // Hemoglobin - flexible patterns for tabular format
  { regex: /(?:hemoglobin|hb)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:g\/dl|g\/dL|low|high|normal|\d+\.\d+\s*-\s*\d+\.\d+)/i, name: 'Hemoglobin', unit: 'g/dL', range: '12-16', check: (v: number) => v >= 12 && v <= 16 ? 'normal' : v > 16 ? 'high' : 'low' },
  
  // RBC Count - flexible patterns
  { regex: /(?:rbc|red\s+blood\s+cell)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mill\/cumm|mill\/mm|million|4\.5\s*-\s*5\.5)/i, name: 'RBC Count', unit: 'mill/cumm', range: '4.5-5.5', check: (v: number) => v >= 4.5 && v <= 5.5 ? 'normal' : v > 5.5 ? 'high' : 'low' },
  
  // WBC Count - flexible patterns
  { regex: /(?:wbc|white\s+blood\s+cell)[\s\S]*?(\d+)[\s]*(?:cumm|\/μL|4000-11000|thousand)/i, name: 'WBC Count', unit: '/μL', range: '4,000-11,000', check: (v: number) => { const actual = v < 100 ? v * 1000 : v; return actual >= 4000 && actual <= 11000 ? 'normal' : actual > 11000 ? 'high' : 'low'; }},
  
  // PCV/Packed Cell Volume - flexible patterns
  { regex: /(?:pcv|packed\s+cell\s+volume)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:%|percent|40\s*-\s*50)/i, name: 'PCV', unit: '%', range: '40-50', check: (v: number) => v >= 40 && v <= 50 ? 'normal' : v > 50 ? 'high' : 'low' },
  
  // Platelet Count - flexible patterns
  { regex: /(?:platelet|plt)[\s\S]*?(\d+)[\s]*(?:cumm|lakhs|thousand|150000|410000)/i, name: 'Platelet Count', unit: 'lakhs/cumm', range: '1.5-4.5', check: (v: number) => { const actual = v > 10000 ? v / 100000 : v; return actual >= 1.5 && actual <= 4.5 ? 'normal' : actual > 4.5 ? 'high' : 'low'; }},
  
  // Cholesterol - flexible patterns
  { regex: /(?:cholesterol|chol)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mg\/dl|mg\/dL|<\s*200|\d+\s*-\s*\d+)/i, name: 'Cholesterol', unit: 'mg/dL', range: '< 200', check: (v: number) => v < 200 ? 'normal' : 'high' },
  
  // Glucose - flexible patterns
  { regex: /(?:glucose|sugar)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mg\/dl|mg\/dL|70-100|\d+\s*-\s*\d+)/i, name: 'Glucose', unit: 'mg/dL', range: '70-100', check: (v: number) => v >= 70 && v <= 100 ? 'normal' : v > 100 ? 'high' : 'low' },
  
  // LDL Cholesterol - flexible patterns
  { regex: /(?:ldl|low\s+density)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mg\/dl|mg\/dL|<\s*100|\d+\s*-\s*\d+)/i, name: 'LDL Cholesterol', unit: 'mg/dL', range: '< 100', check: (v: number) => v < 100 ? 'normal' : 'high' },
  
  // HDL Cholesterol - flexible patterns
  { regex: /(?:hdl|high\s+density)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mg\/dl|mg\/dL|>\s*40|\d+\s*-\s*\d+)/i, name: 'HDL Cholesterol', unit: 'mg/dL', range: '> 40', check: (v: number) => v > 40 ? 'normal' : 'low' },
  
  // C-Reactive Protein - for the CRP report
  { regex: /(?:c-reactive\s+protein|crp)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mg\/dl|mg\/dL|high|0\.0\s*-\s*5|elevated)/i, name: 'C-Reactive Protein', unit: 'mg/dL', range: '0.0-5.0', check: (v: number) => v <= 5 ? 'normal' : 'high' },
  
  // More flexible numeric patterns - catch any health parameter with units
  { regex: /(?:hemoglobin|hb)[\s\S]*?(\d+\.\d+)[\s]*(?:g\/dl)/i, name: 'Hemoglobin', unit: 'g/dL', range: '12-16', check: (v: number) => v >= 12 && v <= 16 ? 'normal' : v > 16 ? 'high' : 'low' },
  { regex: /(?:rbc|red)[\s\S]*?(\d+\.\d+)[\s]*(?:mill|million)/i, name: 'RBC Count', unit: 'mill/cumm', range: '4.5-5.5', check: (v: number) => v >= 4.5 && v <= 5.5 ? 'normal' : v > 5.5 ? 'high' : 'low' },
  { regex: /(?:wbc|white)[\s\S]*?(\d+)[\s]*(?:cumm|μL)/i, name: 'WBC Count', unit: '/μL', range: '4,000-11,000', check: (v: number) => { const actual = v < 100 ? v * 1000 : v; return actual >= 4000 && actual <= 11000 ? 'normal' : actual > 11000 ? 'high' : 'low'; }},
];

function parseHealthParameters(text: string): HealthParameter[] {
  const parameters: HealthParameter[] = [];
  const found = new Set<string>();
  
  const cleanText = text.toLowerCase().replace(/\s+/g, ' ');
  
  for (const pattern of healthPatterns) {
    const match = cleanText.match(pattern.regex);
    if (match) {
      const value = parseFloat(match[1]);
      if (!isNaN(value) && value > 0) {
        const key = `${pattern.name}-${value}`;
        if (!found.has(key)) {
          parameters.push({
            parameter: pattern.name,
            value: value.toString(),
            unit: pattern.unit,
            normalRange: pattern.range,
            status: pattern.check(value)
          });
          found.add(key);
        }
      }
    }
  }
  
  return parameters;
}

// Simplified OCR function with better error handling
async function performOCR(buffer: Buffer): Promise<string> {
  const OCR_API_KEY = process.env.OCR_SPACE_API_KEY || 'helloworld';
  const OCR_API_URL = 'https://api.ocr.space/parse/image';
  
  try {
    console.log('Attempting OCR with OCR.space API...');
    
    // Process image for better OCR
    const processedImage = await sharp(buffer)
      .resize(1500, null, { withoutEnlargement: true })
      .sharpen()
      .normalize()
      .jpeg({ quality: 90 })
      .toBuffer();

    const base64Image = `data:image/jpeg;base64,${processedImage.toString('base64')}`;
    
    const formData = new FormData();
    formData.append('base64Image', base64Image);
    formData.append('language', 'eng');
    formData.append('OCREngine', '2');
    formData.append('scale', 'true');
    formData.append('isTable', 'true');
    
    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      headers: { 'apikey': OCR_API_KEY },
      body: formData,
    });

    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log('OCR API returned non-JSON response (likely HTML error page)');
      throw new Error('Invalid API response format');
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    
    // Log the full response for debugging
    console.log('OCR API Response:', {
      exitCode: result.OCRExitCode,
      errorMessage: result.ErrorMessage,
      isErroredOnProcessing: result.IsErroredOnProcessing,
      hasResults: !!result.ParsedResults?.[0]?.ParsedText
    });
    
    if (result.OCRExitCode === 1 && result.ParsedResults?.[0]?.ParsedText) {
      const text = result.ParsedResults[0].ParsedText.trim();
      if (text.length > 20) {
        console.log(`OCR successful: extracted ${text.length} characters`);
        return text;
      }
    }
    
    if (result.ErrorMessage) {
      throw new Error(`OCR API Error: ${result.ErrorMessage}`);
    }
    
    throw new Error('No text extracted from OCR');
    
  } catch (error) {
    console.log('OCR failed, using demo mode:', error);
    throw error;
  }
}

// Generate demo data based on file characteristics
function generateDemoData(fileName: string, fileSize: number): string {
  const seed = fileName.length + fileSize;
  const variance = (seed % 100) / 100;
  
  const values = {
    hemoglobin: (13.5 + variance * 3).toFixed(1),
    rbc: (4.8 + variance).toFixed(1),
    wbc: Math.round(7500 + variance * 3000),
    pcv: (45 + variance * 10).toFixed(1),
    platelets: (2.5 + variance).toFixed(1),
    cholesterol: Math.round(185 + variance * 30),
    glucose: Math.round(90 + variance * 20),
    ldl: Math.round(110 + variance * 25),
    hdl: Math.round(50 + variance * 15),
  };

  return `
DEMO HEALTH REPORT
Generated: ${new Date().toLocaleDateString()}
File: ${fileName}

BLOOD TEST RESULTS:
Hemoglobin: ${values.hemoglobin} g/dL
RBC Count: ${values.rbc} mill/cumm
WBC Count: ${values.wbc} /μL
PCV: ${values.pcv}%
Platelet Count: ${values.platelets} lakhs/cumm
Cholesterol: ${values.cholesterol} mg/dL
Glucose: ${values.glucose} mg/dL
LDL: ${values.ldl} mg/dL
HDL: ${values.hdl} mg/dL

Note: This is demo data for testing purposes.
`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`Processing: ${file.name} (${file.type}, ${file.size} bytes)`);

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';

    try {
      if (file.type === 'application/pdf') {
        // Simple PDF text extraction
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(buffer);
        if (data.text && data.text.trim().length > 50) {
          extractedText = data.text;
        } else {
          extractedText = await performOCR(buffer);
        }
      } else if (file.type.startsWith('image/')) {
        extractedText = await performOCR(buffer);
      } else {
        return NextResponse.json({ 
          error: 'Unsupported file type',
          details: 'Please upload PDF or image files only'
        }, { status: 400 });
      }
    } catch (error) {
      console.log('OCR failed, using demo mode:', error instanceof Error ? error.message : 'Unknown error');
      extractedText = generateDemoData(file.name, file.size);
    }

    const parameters = parseHealthParameters(extractedText);
    
    if (parameters.length === 0) {
      console.log('No health parameters detected');
      return NextResponse.json({
        error: 'No health parameters detected',
        details: 'Could not find recognizable health parameters in the document.',
        extractedText: extractedText.slice(0, 500),
        suggestion: 'Please ensure the document contains clear health parameter values and try again with a clearer image.'
      }, { status: 422 });
    }

    const isDemoMode = extractedText.includes('DEMO HEALTH REPORT');
    
    return NextResponse.json({
      success: true,
      parameters,
      extractedText: extractedText.slice(0, 1000),
      note: isDemoMode 
        ? `Demo Mode: Generated ${parameters.length} sample health parameters`
        : `Successfully extracted ${parameters.length} health parameters`
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'Processing failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 