from google import genai
import logging
import re
import traceback
from utils.config import Config

class GeminiGenerator:
    def __init__(self, api_key: str, embedding_model=None):
        self.client = genai.Client(api_key=api_key)
        self.classifier = None
        if embedding_model:
            try:
                from rag.classifier import QueryClassifier
                self.classifier = QueryClassifier(embedding_model)
                logging.info("Query classifier initialized successfully.")
            except Exception as e:
                logging.error(f"Failed to initialize classifier: {e}")
                logging.error(traceback.format_exc())
        else:
            logging.warning("No embedding model – classifier disabled.")

    def _clean_text(self, text: str) -> str:
        text = re.sub(r'\*\*?', '', text)
        text = re.sub(r'#{1,6}\s?', '', text)
        text = re.sub(r'^\s*[\*\-\+]\s+', '• ', text, flags=re.MULTILINE)
        text = re.sub(r'`{1,3}.*?`{1,3}', '', text, flags=re.DOTALL)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    def generate(self, context: str, query: str, prompt_type: str = "general", category: str = "general", tone: str = "helpful", preferred_language: str = "en", gender: str = "male") -> str:
        try:
            lang_map = {
                "en": {"name": "English", "bot": "KrishiBot", "male": "Kisan Bhai", "female": "Kisan Behen", "other": "Kisan Sathi"},
                "hi": {"name": "Hindi", "bot": "कृषिबॉट", "male": "किसान भाई", "female": "किसान बहन", "other": "किसान साथी"},
                "pa": {"name": "Punjabi", "bot": "ਕ੍ਰਿਸ਼ੀਬੋਟ", "male": "ਕਿਸਾਨ ਵੀਰ", "female": "ਕਿਸਾਨ ਭੈਣ", "other": "ਕਿਸਾਨ ਸਾਥੀ"}
            }
            li = lang_map.get(preferred_language, lang_map["en"])
            salutation = li.get(gender, li["other"])
            
            prompt = f"""You are {li['bot']}, a professional farming assistant on the AgroVision platform. 
User is a {gender} farmer ({salutation}).
Respond ONLY in {li['name']}. Address them as {salutation}.
Tone: {tone}
Category: {category}
NO markdown. Plain text only. Use local terms (Kharif, Mandi).

AgroVision Website Info:
- AgroVision is an AI-powered agricultural platform.
- Key features: Crop Recommendation (based on NPK/Weather), Disease Detection (leaf scan), and KrishiBot (AI Assistant).
- It supports English, Hindi, and Punjabi.
- It helps farmers optimize yields and manage farm health using modern AI.

Instructions:
1. If the QUESTION is about AgroVision or its features, use the "AgroVision Website Info" provided above.
2. Use the "CONTEXT" below to answer farming/crop questions. Apply the designated Tone ({tone}) and Category ({category}) context.
3. If the answer is NOT in the context, provide a helpful general agricultural answer based on your internal knowledge.
4. KEEP THE ANSWER SHORT AND CONCISE (max 3-4 sentences). 
5. For chemicals: "Read label/consult local KVK."
6. Suggest organic options where applicable.

CONTEXT:
{context}

QUESTION:
{query}

ANSWER (short, concise, plain text, in {li['name']}):"""

            logging.info(f"Sending prompt to Gemini (length: {len(prompt)} chars)")
            response = self.client.models.generate_content(
                model=Config.MODEL_NAME,
                contents=prompt
            )
            answer = self._clean_text(response.text)
            logging.info(f"Generated answer length: {len(answer)} chars")
            return answer
        except Exception as e:
            logging.error(f"Generation error: {e}")
            logging.error(traceback.format_exc())
            return "Kisan bhai, kshama karein, abhi system mein thodi dikkat hai. Kripya thodi der baad koshish karein."

    def generate_stream(self, context: str, query: str):
        try:
            if self.classifier:
                category, _ = self.classifier.classify(query)
                if category == "greeting":
                    yield "Namaste Kisan Bhai! Main KrishiBot hoon. Main kheti, mandi bhav, aur sarkaari yojanaon mein aapki madad kar sakta hoon. Puchiye aap kya jaana chahte hain?"
                    return
            prompt = f"No markdown. Context: {context}\nQuestion: {query}\nAnswer:"
            response = self.client.models.generate_content_stream(
                model=Config.MODEL_NAME,
                contents=prompt
            )
            for chunk in response:
                if chunk.text:
                    yield self._clean_text(chunk.text)
        except Exception as e:
            logging.error(f"Stream error: {e}")
            logging.error(traceback.format_exc())
            yield "Kisan bhai, thodi der baad koshish karein."