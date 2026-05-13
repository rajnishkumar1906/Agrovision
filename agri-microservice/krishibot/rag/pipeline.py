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
        
        # 1. Classify query to get category and tone
        category, tone = "general", "helpful"
        if hasattr(self.generator, 'classifier') and self.generator.classifier:
            try:
                category, tone = self.generator.classifier.classify(query)
                logging.info(f"Query classified as: {category} (Tone: {tone})")
            except Exception as e:
                logging.error(f"Classification error: {e}")

        # 2. Fast path for greetings
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

        # 3. Retrieve relevant documents
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