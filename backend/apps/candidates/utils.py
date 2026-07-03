"""Utility to extract plain text from an uploaded resume (PDF or DOCX)."""
import io


def extract_resume_text(file_field) -> str:
    name = file_field.name.lower()
    file_field.seek(0)
    data = file_field.read()
    file_field.seek(0)

    try:
        if name.endswith(".pdf"):
            import pdfplumber
            text_chunks = []
            with pdfplumber.open(io.BytesIO(data)) as pdf:
                for page in pdf.pages:
                    text_chunks.append(page.extract_text() or "")
            return "\n".join(text_chunks).strip()

        if name.endswith(".docx"):
            import docx
            doc = docx.Document(io.BytesIO(data))
            return "\n".join(p.text for p in doc.paragraphs).strip()

    except Exception:
        return ""

    return ""
