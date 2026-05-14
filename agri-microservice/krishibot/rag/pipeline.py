from typing import  Dict, Any
from langchain_core.documents import Document
import logging

class RAGPipeline:
    """Enhanced RAG pipeline with confidence scoring and streaming"""

    def __init__(self, retriever, generator):
        self.retriever = retriever
        self.generator = generator
        logging.info("RAG Pipeline initialized")

    def run(self, query: str, k: int = 5, include_confidence: bool = False, preferred_language: str = "en", gender: str = "male") -> Dict[str, Any]:
        """Run RAG pipeline with optional confidence scoring and language/gender preference"""
        
        # 1. Fast path for specific AgroVision queries (Multilingual)
        agro_queries = {
            "disease": [
                "how do i use the disease detection tool?",
                "how to check plant disease?",
                "how does disease scan work?",
                "my plant is sick",
                "what is wrong with my plant?",
                "leaf is turning yellow",
                "detect disease from leaf photo",
                "how to identify pests?",
                "bimari kaise check karein",
                "fasal ki bimari kaise dekhein",
                "bimari scan kaise karein",
                "pattiyan kharab ho rahi hain",
                "paudha bimar hai",
                "keede kaise hatayein?",
                "ਬਿਮਾਰੀ ਕਿਵੇਂ ਚੈੱਕ ਕਰੀਏ",
                "ਫਸਲ ਦੀ ਬਿਮਾਰੀ ਕਿਵੇਂ ਦੇਖੀਏ",
                "ਪੱਤੇ ਖਰਾਬ ਹੋ ਰਹੇ ਹਨ",
                "ਪੌਦਾ ਬੀਮਾਰ ਹੈ",
                "ਕੀੜੇ ਕਿਵੇਂ ਹਟਾਈਏ?"
            ],
            "crop": [
                "how does crop recommendation work?",
                "how to get crop suggestion?",
                "which crop should i grow?",
                "recommend a crop for my soil",
                "how to use crop guidance?",
                "what to plant in my field?",
                "fasal ki salah kaise lein",
                "kaun si fasal ugayein",
                "kaun si fasal lagayein?",
                "mitti ke hisab se fasal batayein",
                "khet mein kya boyein?",
                "crop recommendation tool kaise kaam karta hai?",
                "ਫਸਲ ਦੀ ਸਲਾਹ ਕਿਵੇਂ ਲਈਏ",
                "ਕਿਹੜੀ ਫਸਲ ਉਗਾਈਏ",
                "ਕਿਹੜੀ ਫਸਲ ਲਗਾਈਏ?",
                "ਮਿੱਟੀ ਦੇ ਹਿਸਾਬ ਨਾਲ ਫਸਲ ਦੱਸੋ",
                "ਖੇਤ ਵਿੱਚ ਕੀ ਬੀਜੀਏ?",
                "ਫਸਲ ਸੁਝਾਅ ਟੂਲ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ?"
            ]
        }
        
        lower_query = query.lower().strip()
        
        # Check for Disease Detection Query
        if any(q in lower_query for q in agro_queries["disease"]):
            lang_map = {
                "en": "Namaste Kisan Bhai! To use the disease detection tool, take a clear photo of the affected leaf or fruit of your plant and upload it to the 'Disease Scan' section in AgroVision. The tool will analyze the image and identify the disease for you instantly.",
                "hi": "नमस्ते किसान भाई! बीमारी पहचान टूल का उपयोग करने के लिए, अपने पौधे की प्रभावित पत्ती या फल की एक साफ फोटो लें और उसे एग्रोविज़न (AgroVision) के 'बीमारी जांच' सेक्शन में अपलोड करें। यह टूल फोटो की जांच करेगा और आपके लिए तुरंत बीमारी की पहचान करेगा।",
                "pa": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰ! ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ ਕਰਨ ਵਾਲੇ ਟੂਲ ਦੀ ਵਰਤੋਂ ਕਰਨ ਲਈ, ਆਪਣੇ ਪੌਦੇ ਦੇ ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਜਾਂ ਫਲ ਦੀ ਇੱਕ ਸਾਫ ਫੋਟੋ ਲਓ ਅਤੇ ਉਸਨੂੰ ਐਗਰੋਵਿਜ਼ਨ (AgroVision) ਦੇ 'ਬਿਮਾਰੀ ਦੀ ਜਾਂਚ' ਸੈਕਸ਼ਨ ਵਿੱਚ ਅਪਲੋਡ ਕਰੋ। ਇਹ ਟੂਲ ਫੋਟੋ ਦੀ ਜਾਂਚ ਕਰੇਗਾ ਅਤੇ ਤੁਹਾਡੇ ਲਈ ਤੁਰੰਤ ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ ਕਰੇਗਾ।"
            }
            return {
                "answer": lang_map.get(preferred_language, lang_map["en"]),
                "retrieved_docs": [],
                "num_docs": 0,
                "category": "agrovision_tool",
                "tone": "helpful"
            }

        # Check for Crop Recommendation Query
        if any(q in lower_query for q in agro_queries["crop"]):
            lang_map = {
                "en": "Namaste Kisan Bhai! AgroVision's Crop Recommendation tool uses your soil data (N-P-K levels) and local weather to suggest the most suitable crop for your farm. Just enter your soil details in the 'Crop Guidance' section to get an instant recommendation.",
                "hi": "नमस्ते किसान भाई! एग्रोविज़न का फसल सुझाव टूल आपकी मिट्टी के डेटा (N-P-K स्तर) और स्थानीय मौसम का उपयोग करके आपके खेत के लिए सबसे उपयुक्त फसल का सुझाव देता है। बस 'फसल मार्गदर्शन' सेक्शन में अपनी मिट्टी का विवरण दर्ज करें और तुरंत सुझाव पाएं।",
                "pa": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰ! ਐਗਰੋਵਿਜ਼ਨ ਦਾ ਫਸਲ ਸੁਝਾਅ ਟੂਲ ਤੁਹਾਡੀ ਮਿੱਟੀ ਦੇ ਡੇਟਾ (N-P-K ਪੱਧਰ) ਅਤੇ ਸਥਾਨਕ ਮੌਸਮ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਤੁਹਾਡੇ ਖੇਤ ਲਈ ਸਭ ਤੋਂ ਢੁਕਵੀਂ ਫਸਲ ਦਾ ਸੁਝਾਅ ਦਿੰਦਾ ਹੈ। ਬੱਸ 'ਫਸਲ ਮਾਰਗਦਰਸ਼ਨ' ਸੈਕਸ਼ਨ ਵਿੱਚ ਆਪਣੀ ਮਿੱਟੀ ਦਾ ਵੇਰਵਾ ਦਰਜ ਕਰੋ ਅਤੇ ਤੁਰੰਤ ਸੁਝਾਅ ਪ੍ਰਾਪਤ ਕਰੋ।"
            }
            return {
                "answer": lang_map.get(preferred_language, lang_map["en"]),
                "retrieved_docs": [],
                "num_docs": 0,
                "category": "agrovision_tool",
                "tone": "helpful"
            }

        # 2. Classify query to get category and tone
        category, tone = "general", "helpful"
        if hasattr(self.generator, 'classifier') and self.generator.classifier:
            try:
                category, tone = self.generator.classifier.classify(query)
                logging.info(f"Query classified as: {category} (Tone: {tone})")
            except Exception as e:
                logging.error(f"Classification error: {e}")

        # 3. Fast path for greetings
        if category == "greeting" and len(query.strip()) < 30:
            lang_map = {
                "en": "Hello Kisan Bhai! I am KrishiBot. How can I help you with your farming today?",
                "hi": "नमस्ते किसान भाई! मैं कृषिबॉट हूँ। आज मैं आपकी खेती में कैसे मदद कर सकता हूँ?",
                "pa": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰ! ਮੈਂ ਕ੍ਰਿਸ਼ੀਬੋਟ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਖੇਤੀ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?"
            }
            return {
                "answer": lang_map.get(preferred_language, lang_map["en"]),
                "retrieved_docs": [],
                "num_docs": 0,
                "category": category,
                "tone": tone
            }

        # 3.5 Fast path for Casual Humor
        if category == "casual_humor":
            humor_map = {
                "hi": {
                    "kaise ho beta": "अरे पिताजी/माताजी, मैं तो एकदम टकाटक हूँ! आपकी दुआ है। बस इंटरनेट की हवा खाकर जिंदा हूँ, आप बताओ आज खेत में क्या हलचल है?",
                    "shadi kab hai": "अरे अभी तो मैं बच्चा हूँ! और वैसे भी, मुझे तो बस फसलों से प्यार है। आप बताओ, आपके लिए कोई अच्छी किस्म की 'बीज' ढूँढूँ?",
                    "paisa de do": "पैसे तो नहीं हैं, पर अच्छी फसल की सलाह दे सकता हूँ जिससे खूब पैसे आएँ! मेहनत आपकी, मशवरा मेरा।",
                    "default": "हाहा! आप भी बड़े मजाकिया हो। मैं तो बस एक छोटा सा डिजिटल कृषि सहायक हूँ, पर आपके साथ बात करके दिल खुश हो गया!"
                },
                "pa": {
                    "kaise ho beta": "ਬਸ ਜੀ, ਤੁਹਾਡੀ ਕਿਰਪਾ ਹੈ! ਮੈਂ ਤਾਂ ਬਿਲਕੁਲ ਠੀਕ-ਠਾਕ ਹਾਂ। ਤੁਸੀਂ ਦੱਸੋ, ਅੱਜ ਖੇਤਾਂ ਵਿੱਚ ਕੀ ਰੌਣਕਾਂ ਨੇ?",
                    "shadi kab hai": "ਅਜੇ ਤਾਂ ਮੈਂ ਛੋਟਾ ਹਾਂ ਜੀ! ਮੇਰਾ ਵਿਆਹ ਤਾਂ ਖੇਤੀਬਾੜੀ ਨਾਲ ਹੋਇਆ ਹੈ। ਤੁਸੀਂ ਦੱਸੋ, ਕੋਈ ਹੋਰ ਸੇਵਾ?",
                    "default": "ਹਾਹਾ! ਤੁਸੀਂ ਵੀ ਬੜੇ ਮਜ਼ਾਕੀਆ ਹੋ। ਮੈਂ ਤਾਂ ਤੁਹਾਡਾ ਡਿਜੀਟਲ ਸਹਾਇਕ ਹਾਂ, ਪਰ ਤੁਹਾਡੇ ਨਾਲ ਗੱਲ ਕਰਕੇ ਬਹੁਤ ਵਧੀਆ ਲੱਗਿਆ!"
                },
                "en": {
                    "default": "Haha! You're quite funny. I'm just a digital assistant, but I love your spirit! How can I help you with your farm today?"
                }
            }
            
            # Check for specific matches first
            lang_humor = humor_map.get(preferred_language, humor_map["en"])
            funny_answer = lang_humor.get("default")
            
            for key in lang_humor:
                if key != "default" and key in lower_query:
                    funny_answer = lang_humor[key]
                    break
            
            return {
                "answer": funny_answer,
                "retrieved_docs": [],
                "num_docs": 0,
                "category": category,
                "tone": tone
            }

        # 4. Retrieve relevant documents
        if include_confidence:
            # Get documents with scores
            docs_with_scores = self.retriever.retrieve_with_scores(query, k=k)
            docs = [doc for doc, _ in docs_with_scores]
            scores = [score for _, score in docs_with_scores]
            avg_confidence = sum(scores) / len(scores) if scores else 0
        else:
            docs = self.retriever.retrieve(query, k=k)
            scores = None
            avg_confidence = None
        
        # 4. Generate answer using context, category, and tone
        context = "\n\n".join([doc.page_content for doc in docs])
        answer = self.generator.generate(
            context, 
            query, 
            category=category, 
            tone=tone, 
            preferred_language=preferred_language, 
            gender=gender
        )
        
        result = {
            "answer": answer,
            "retrieved_docs": docs,
            "num_docs": len(docs),
            "category": category,
            "tone": tone
        }
        
        if include_confidence:
            result["confidence_scores"] = scores
            result["avg_confidence"] = avg_confidence
        
        logging.info(f"Generated answer for query: {query[:50]}...")
        return result

    def run_stream(self, query: str, k: int = 5):
        """Stream the response"""
        docs = self.retriever.retrieve(query, k=k)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        for chunk in self.generator.generate_stream(context, query):
            yield chunk
    
    def run_with_sources(self, query: str, k: int = 3) -> Dict[str, Any]:
        """Get answer with source documents"""
        result = self.run(query, k=k)
        
        sources = []
        for doc in result["retrieved_docs"]:
            sources.append({
                "content": doc.page_content[:200] + "...",  # Preview
                "source": doc.metadata.get("source", "unknown"),
                "type": doc.metadata.get("type", "unknown")
            })
        
        result["sources"] = sources
        return result