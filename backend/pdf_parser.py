import base64
import PyPDF2
from io import BytesIO
from fastapi import HTTPException

def parse_pdf_from_base64(pdf_base64: str) -> str:
    """
    Parse text content from a base64 encoded PDF.
    
    Args:
        pdf_base64: Base64 encoded PDF string (with or without data URI prefix)
    
    Returns:
        Extracted text content from the PDF
    """
    try:
        # Remove data URI prefix if present
        if ',' in pdf_base64 and pdf_base64.startswith('data:'):
            pdf_base64 = pdf_base64.split(',')[1]
        
        # Decode base64 to bytes
        pdf_bytes = base64.b64decode(pdf_base64)
        
        # Create a BytesIO object
        pdf_file = BytesIO(pdf_bytes)
        
        # Read PDF
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from all pages
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text() + "\n"
        
        if not text_content.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF. The file might be an image-based PDF.")
        
        return text_content.strip()
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing PDF: {str(e)}")