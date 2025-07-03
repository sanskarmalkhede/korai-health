# Korai Health - Health Report Analytics

A modern health report analysis application built with Next.js that extracts and analyzes health parameters from uploaded medical reports using OCR technology.

## Features

- **OCR-powered Analysis**: Extract text from medical reports using OCR.space API
- **Health Parameter Detection**: Automatically identifies and extracts common health parameters like:
  - Blood chemistry (Cholesterol, Glucose, LDL, HDL)
  - Complete Blood Count (Hemoglobin, RBC, WBC, Platelet count)
  - Other parameters (PCV, MCV, etc.)
- **Trend Visualization**: Interactive charts showing health trends over time
- **Modern UI**: Beautiful interface with Aceternity UI components and custom styling
- **File Support**: Handles both PDF and image files (JPG, PNG, WebP)
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OCR.space API key (free)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd korai-health
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add your OCR.space API key:
```bash
# OCR.space API Configuration
# Get your free API key from: https://ocr.space/ocrapi/freekey
OCR_SPACE_API_KEY=your_actual_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## OCR.space API Setup

This application uses OCR.space API for optical character recognition. Here's how to set it up:

### 1. Get Your Free API Key

1. Visit [OCR.space Free API Key Registration](https://ocr.space/ocrapi/freekey)
2. Fill out the form and submit
3. Check your email for the API key

### 2. API Key Configuration

Add your API key to the `.env.local` file:
```bash
OCR_SPACE_API_KEY=your_actual_api_key_here
```

### 3. API Limits (Free Tier)

- **25,000 requests per month**
- **500 requests per day per IP**
- **1 MB file size limit**
- **3 PDF pages maximum**

### 4. Demo Mode

The app includes a demo mode that generates realistic health data when:
- No API key is provided (uses 'helloworld' default)
- API key is invalid or exceeded limits
- OCR processing fails

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Aceternity UI, Framer Motion
- **OCR**: OCR.space API
- **Charts**: Recharts
- **Image Processing**: Sharp
- **PDF Processing**: PDF-parse

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── parse-report/          # OCR API endpoint
│   │   ├── components/                # React components
│   │   │   ├── ui/                   # Aceternity UI components
│   │   │   ├── DataTable.tsx         # Health data table
│   │   │   ├── FileUpload.tsx        # File upload component
│   │   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   │   └── TrendsChart.tsx       # Health trends chart
│   │   ├── contexts/
│   │   │   └── ReportsContext.tsx    # Reports state management
│   │   ├── results/
│   │   │   └── page.tsx              # Results page
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   └── lib/
│       └── utils.ts                  # Utility functions
```

## Usage

1. **Upload Report**: Drag and drop or click to upload a PDF or image file
2. **Processing**: The app uses OCR.space API to extract text from your report
3. **Analysis**: Health parameters are automatically detected and categorized
4. **Results**: View extracted parameters with normal/high/low status indicators
5. **Trends**: Navigate to results page to see trends over time

## Supported File Types

- **Images**: JPG, JPEG, PNG, WebP, GIF, BMP, TIFF
- **Documents**: PDF (single and multi-page)
- **Size limit**: 10MB (1MB for free OCR.space API)

## Deployment

### Deploy on Vercel

1. Push your code to a Git repository
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `OCR_SPACE_API_KEY`: Your OCR.space API key
4. Deploy

### Environment Variables for Production

Make sure to set these in your deployment environment:
```bash
OCR_SPACE_API_KEY=your_production_api_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **OCR.space API**: Visit [OCR.space Support](https://ocr.space/support)
- **Application bugs**: Create an issue in this repository

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [OCR.space API Documentation](https://ocr.space/ocrapi)
- [Aceternity UI](https://aceternity.com)
- [Tailwind CSS](https://tailwindcss.com)
