from fastapi import FastAPI
from pydantic import BaseModel
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import torch
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow your React app to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your custom-trained model
model_path = "./truthshield_model"
tokenizer = DistilBertTokenizer.from_pretrained(model_path)
model = DistilBertForSequenceClassification.from_pretrained(model_path)

class TextRequest(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_text(request: TextRequest):
    # Prepare the text
    inputs = tokenizer(request.text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    
    # Get prediction
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        prediction = torch.argmax(logits, dim=1).item()
        
    # Mapping back to readable format
    # 0 = Fake, 1 = Real
    status = "Suspicious" if prediction == 0 else "Credible"
    confidence = torch.nn.functional.softmax(logits, dim=1).max().item()
    
    return {
        "analysis": f"The document content appears to be {status}.",
        "trust_score": round(confidence * 100, 2),
        "status": status,
        "model": "TruthShield-DistilBERT-v1"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
