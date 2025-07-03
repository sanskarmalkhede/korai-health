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

// Enhanced health parameter patterns - Based on real lab report formats
const healthPatterns = [
  // Hemoglobin - Multiple variations
  { regex: /(?:hemoglobin|hb)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:g\/dl|g\/dL|low|high|normal|13\.0?\s*-\s*17\.0?)/i, name: 'Hemoglobin', unit: 'g/dL', range: '13.0-17.0', check: (v: number) => v >= 13 && v <= 17 ? 'normal' : v > 17 ? 'high' : 'low' },
  
  // RBC Count - Multiple unit formats
  { regex: /(?:rbc|red\s+blood\s+cell|total\s+rbc)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mill\/cumm|mill\/mm3|million|4\.5?\s*-\s*5\.5?)/i, name: 'RBC Count', unit: 'mill/cumm', range: '4.5-5.5', check: (v: number) => v >= 4.5 && v <= 5.5 ? 'normal' : v > 5.5 ? 'high' : 'low' },
  
  // WBC Count / TLC - Multiple variations
  { regex: /(?:wbc|white\s+blood\s+cell|total\s+wbc|tlc|total\s+leukocyte|leukocyte\s+count)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:cumm|\/μL|thou\/mm3|thousand|4000-11000|4\.0?\s*-\s*10\.0?)/i, name: 'WBC Count', unit: 'thou/mm3', range: '4.0-10.0', check: (v: number) => { const actual = v >= 1000 ? v / 1000 : v; return actual >= 4 && actual <= 10 ? 'normal' : actual > 10 ? 'high' : 'low'; }},
  
  // PCV/Packed Cell Volume - Multiple formats
  { regex: /(?:pcv|packed\s+cell\s+volume)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:%|percent|40\.0?\s*-\s*50\.0?)/i, name: 'PCV', unit: '%', range: '40.0-50.0', check: (v: number) => v >= 40 && v <= 50 ? 'normal' : v > 50 ? 'high' : 'low' },
  
  // MCV (Mean Corpuscular Volume)
  { regex: /(?:mcv|mean\s+corpuscular\s+volume)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:fl|fL|80\.0?\s*-\s*100\.0?|83\s*-\s*101)/i, name: 'MCV', unit: 'fL', range: '80.0-100.0', check: (v: number) => v >= 80 && v <= 100 ? 'normal' : v > 100 ? 'high' : 'low' },
  
  // MCH (Mean Corpuscular Hemoglobin)
  { regex: /(?:mch)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:pg|27\.0?\s*-\s*32\.0?|27\s*-\s*32)/i, name: 'MCH', unit: 'pg', range: '27.0-32.0', check: (v: number) => v >= 27 && v <= 32 ? 'normal' : v > 32 ? 'high' : 'low' },
  
  // MCHC (Mean Corpuscular Hemoglobin Concentration)
  { regex: /(?:mchc)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:g\/dl|g\/dL|32\.0?\s*-\s*35\.0?|32\.5\s*-\s*34\.5)/i, name: 'MCHC', unit: 'g/dL', range: '32.0-35.0', check: (v: number) => v >= 32 && v <= 35 ? 'normal' : v > 35 ? 'high' : 'low' },
  
  // RDW (Red Cell Distribution Width)
  { regex: /(?:rdw|red\s+cell\s+distribution\s+width)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:%|11\.5?\s*-\s*14\.5?|11\.6\s*-\s*14\.0)/i, name: 'RDW', unit: '%', range: '11.5-14.5', check: (v: number) => v >= 11.5 && v <= 14.5 ? 'normal' : v > 14.5 ? 'high' : 'low' },
  
  // Platelet Count - Multiple formats
  { regex: /(?:platelet|plt)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:cumm|lakhs|thousand|thou\/mm3|150000|410000|150\.0?\s*-\s*450\.0?)/i, name: 'Platelet Count', unit: 'thou/mm3', range: '150.0-450.0', check: (v: number) => { const actual = v >= 1000 ? v / 1000 : v; return actual >= 150 && actual <= 450 ? 'normal' : actual > 450 ? 'high' : 'low'; }},
  
  // Neutrophils (Differential Count)
  { regex: /(?:neutrophils|segmented\s+neutrophils)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:%|40\.0?\s*-\s*80\.0?|50\s*-\s*62)/i, name: 'Neutrophils', unit: '%', range: '40.0-80.0', check: (v: number) => v >= 40 && v <= 80 ? 'normal' : v > 80 ? 'high' : 'low' },
  
  // Lymphocytes (Differential Count)
  { regex: /(?:lymphocytes)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:%|20\.0?\s*-\s*40\.0?|20\s*-\s*40)/i, name: 'Lymphocytes', unit: '%', range: '20.0-40.0', check: (v: number) => v >= 20 && v <= 40 ? 'normal' : v > 40 ? 'high' : 'low' },
  
  // Monocytes (Differential Count)
  { regex: /(?:monocytes)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:%|2\.0?\s*-\s*10\.0?|2\s*-\s*10)/i, name: 'Monocytes', unit: '%', range: '2.0-10.0', check: (v: number) => v >= 2 && v <= 10 ? 'normal' : v > 10 ? 'high' : 'low' },
  
  // Eosinophils (Differential Count)
  { regex: /(?:eosinophils)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:%|1\.0?\s*-\s*6\.0?|0\.02\s*-\s*0\.50)/i, name: 'Eosinophils', unit: '%', range: '1.0-6.0', check: (v: number) => v >= 1 && v <= 6 ? 'normal' : v > 6 ? 'high' : 'low' },
  
  // Basophils (Differential Count)
  { regex: /(?:basophils)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:%|<\s*2\.0?|0\.01\s*-\s*0\.10)/i, name: 'Basophils', unit: '%', range: '< 2.0', check: (v: number) => v <= 2 ? 'normal' : 'high' },
  
  // C-Reactive Protein - Enhanced pattern
  { regex: /(?:c-reactive\s+protein|crp)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mg\/dl|mg\/dL|high|0\.0?\s*-\s*5\.0?|elevated)/i, name: 'C-Reactive Protein', unit: 'mg/dL', range: '0.0-5.0', check: (v: number) => v <= 5 ? 'normal' : 'high' },
  
  // Cholesterol - Enhanced pattern
  { regex: /(?:cholesterol|total\s+cholesterol)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mg\/dl|mg\/dL|<\s*200|\d+\s*-\s*\d+)/i, name: 'Total Cholesterol', unit: 'mg/dL', range: '< 200', check: (v: number) => v < 200 ? 'normal' : 'high' },
  
  // Glucose - Enhanced pattern
  { regex: /(?:glucose|blood\s+glucose|sugar)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mg\/dl|mg\/dL|70-100|\d+\s*-\s*\d+)/i, name: 'Blood Glucose', unit: 'mg/dL', range: '70-100', check: (v: number) => v >= 70 && v <= 100 ? 'normal' : v > 100 ? 'high' : 'low' },
  
  // LDL Cholesterol - Enhanced pattern
  { regex: /(?:ldl|low\s+density\s+lipoprotein)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mg\/dl|mg\/dL|<\s*100|\d+\s*-\s*\d+)/i, name: 'LDL Cholesterol', unit: 'mg/dL', range: '< 100', check: (v: number) => v < 100 ? 'normal' : 'high' },
  
  // HDL Cholesterol - Enhanced pattern
  { regex: /(?:hdl|high\s+density\s+lipoprotein)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mg\/dl|mg\/dL|>\s*40|\d+\s*-\s*\d+)/i, name: 'HDL Cholesterol', unit: 'mg/dL', range: '> 40', check: (v: number) => v > 40 ? 'normal' : 'low' },
  
  // Triglycerides
  { regex: /(?:triglycerides|tg)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mg\/dl|mg\/dL|<\s*150|\d+\s*-\s*\d+)/i, name: 'Triglycerides', unit: 'mg/dL', range: '< 150', check: (v: number) => v < 150 ? 'normal' : 'high' },
  
  // ESR (Erythrocyte Sedimentation Rate)
  { regex: /(?:esr|erythrocyte\s+sedimentation\s+rate)[\s\S]*?(\d+(?:\.\d+)?)[\s]*(?:mm\/hr|mm\/hour|<\s*20|\d+\s*-\s*\d+)/i, name: 'ESR', unit: 'mm/hr', range: '< 20', check: (v: number) => v <= 20 ? 'normal' : 'high' },
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

// Enhanced demo data generation with more parameters
function generateDemoData(fileName: string, fileSize: number): string {
  const seed = fileName.length + fileSize;
  const variance = (seed % 100) / 100;
  
  const values = {
    hemoglobin: (13.5 + variance * 3).toFixed(1),
    rbc: (4.8 + variance).toFixed(1),
    wbc: (7.5 + variance * 2).toFixed(1),
    pcv: (45 + variance * 10).toFixed(1),
    mcv: (85 + variance * 15).toFixed(1),
    mch: (29 + variance * 3).toFixed(1),
    mchc: (33 + variance * 2).toFixed(1),
    rdw: (13 + variance * 2).toFixed(1),
    platelets: (250 + variance * 150).toFixed(0),
    neutrophils: (60 + variance * 20).toFixed(1),
    lymphocytes: (30 + variance * 10).toFixed(1),
    monocytes: (6 + variance * 4).toFixed(1),
    eosinophils: (3 + variance * 3).toFixed(1),
    basophils: (1 + variance).toFixed(1),
    cholesterol: Math.round(185 + variance * 30),
    glucose: Math.round(90 + variance * 20),
    ldl: Math.round(110 + variance * 25),
    hdl: Math.round(50 + variance * 15),
    crp: (2 + variance * 8).toFixed(1),
  };

  return `
DEMO HEALTH REPORT
Generated: ${new Date().toLocaleDateString()}
File: ${fileName}

COMPLETE BLOOD COUNT (CBC):
Hemoglobin: ${values.hemoglobin} g/dL
RBC Count: ${values.rbc} mill/cumm
WBC Count: ${values.wbc} thou/mm3
PCV: ${values.pcv}%
MCV: ${values.mcv} fL
MCH: ${values.mch} pg
MCHC: ${values.mchc} g/dL
RDW: ${values.rdw}%
Platelet Count: ${values.platelets} thou/mm3

DIFFERENTIAL COUNT:
Neutrophils: ${values.neutrophils}%
Lymphocytes: ${values.lymphocytes}%
Monocytes: ${values.monocytes}%
Eosinophils: ${values.eosinophils}%
Basophils: ${values.basophils}%

LIPID PROFILE:
Total Cholesterol: ${values.cholesterol} mg/dL
LDL Cholesterol: ${values.ldl} mg/dL
HDL Cholesterol: ${values.hdl} mg/dL

OTHER TESTS:
Blood Glucose: ${values.glucose} mg/dL
C-Reactive Protein: ${values.crp} mg/dL

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