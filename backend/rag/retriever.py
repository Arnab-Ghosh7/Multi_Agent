import os
import re
import math
import pickle
import json
import httpx
from pypdf import PdfReader

KNOWLEDGE_BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "knowledge_base")
INDEX_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vectorstore.pkl")

class DocumentChunk:
    def __init__(self, doc_name, text, chunk_index):
        self.doc_name = doc_name
        self.text = text
        self.chunk_index = chunk_index

class SimpleTFIDFRetriever:
    def __init__(self):
        self.chunks = []      # List of DocumentChunk objects
        self.vocab = {}       # word -> index
        self.idf = []         # index -> idf value
        self.tfidf_matrix = [] # list of tfidf vectors (numpy arrays)

    def _tokenize(self, text):
        # Basic lowercasing and word boundary extraction
        words = re.findall(r'\b[a-z0-9]+\b', text.lower())
        # Filter basic stop words to improve retrieval relevance
        stopwords = {
            'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'for', 'in', 
            'on', 'at', 'by', 'of', 'with', 'about', 'as', 'it', 'this', 'that', 'these', 'those', 'you', 'your'
        }
        return [w for w in words if w not in stopwords]

    def build_index(self, chunks):
        self.chunks = chunks
        if not chunks:
            self.vocab = {}
            self.idf = []
            self.tfidf_matrix = []
            return

        # 1. Build Vocab & Term Frequencies
        doc_terms = []
        df = {}
        for chunk in chunks:
            terms = self._tokenize(chunk.text)
            doc_terms.append(terms)
            unique_terms = set(terms)
            for term in unique_terms:
                df[term] = df.get(term, 0) + 1
        
        # Build Vocabulary mapping
        self.vocab = {term: idx for idx, term in enumerate(df.keys())}
        num_docs = len(chunks)
        
        # 2. Compute IDF
        self.idf = [0.0] * len(self.vocab)
        for term, idx in self.vocab.items():
            # Standard IDF with smoothing
            self.idf[idx] = math.log((num_docs + 1) / (df[term] + 1)) + 1.0

        # 3. Build TF-IDF Vectors
        import numpy as np
        self.tfidf_matrix = []
        for terms in doc_terms:
            vector = np.zeros(len(self.vocab))
            # Term frequencies
            tf_counts = {}
            for t in terms:
                tf_counts[t] = tf_counts.get(t, 0) + 1
            
            for t, count in tf_counts.items():
                if t in self.vocab:
                    idx = self.vocab[t]
                    # Log-frequency weighting
                    tf = 1.0 + math.log(count)
                    vector[idx] = tf * self.idf[idx]
            
            # Normalize vector to unit length
            norm = np.linalg.norm(vector)
            if norm > 0:
                vector = vector / norm
            self.tfidf_matrix.append(vector)
        
        # Convert to numpy array for fast multiplication
        self.tfidf_matrix = np.array(self.tfidf_matrix)

    def retrieve(self, query, top_k=3):
        if not self.chunks or not self.vocab:
            return []
        
        import numpy as np
        query_terms = self._tokenize(query)
        query_vector = np.zeros(len(self.vocab))
        
        tf_counts = {}
        for t in query_terms:
            tf_counts[t] = tf_counts.get(t, 0) + 1
            
        for t, count in tf_counts.items():
            if t in self.vocab:
                idx = self.vocab[t]
                tf = 1.0 + math.log(count)
                query_vector[idx] = tf * self.idf[idx]
                
        norm = np.linalg.norm(query_vector)
        if norm > 0:
            query_vector = query_vector / norm
        else:
            # If no vocab words match, return top chunks sequentially or empty
            return [{"doc_name": c.doc_name, "text": c.text, "score": 0.0} for c in self.chunks[:top_k]]
            
        # Cosine similarity is dot product of normalized vectors
        similarities = np.dot(self.tfidf_matrix, query_vector)
        
        # Get top K indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            results.append({
                "doc_name": self.chunks[idx].doc_name,
                "text": self.chunks[idx].text,
                "score": float(similarities[idx])
            })
        return results

class RAGPipeline:
    def __init__(self):
        self.retriever = SimpleTFIDFRetriever()
        self.load_index()

    def parse_pdf(self, file_path):
        text = ""
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    text += t + "\n"
        except Exception as e:
            print(f"Error parsing PDF {file_path}: {e}")
        return text

    def parse_txt(self, file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            print(f"Error parsing TXT {file_path}: {e}")
            return ""

    def chunk_text(self, text, chunk_size=500, overlap=100):
        # Basic chunking by words
        words = text.split()
        chunks = []
        step = chunk_size - overlap
        for i in range(0, len(words), step):
            chunk_words = words[i:i + chunk_size]
            if len(chunk_words) > 10:  # Skip tiny fragments
                chunks.append(" ".join(chunk_words))
        return chunks

    def rebuild_index(self):
        chunks = []
        if not os.path.exists(KNOWLEDGE_BASE_DIR):
            os.makedirs(KNOWLEDGE_BASE_DIR, exist_ok=True)
            
        for file_name in os.listdir(KNOWLEDGE_BASE_DIR):
            file_path = os.path.join(KNOWLEDGE_BASE_DIR, file_name)
            if os.path.isdir(file_path):
                continue
                
            text = ""
            if file_name.endswith(".pdf"):
                text = self.parse_pdf(file_path)
            elif file_name.endswith(".txt"):
                text = self.parse_txt(file_path)
                
            if text.strip():
                file_chunks = self.chunk_text(text)
                for idx, chunk in enumerate(file_chunks):
                    chunks.append(DocumentChunk(file_name, chunk, idx))
        
        self.retriever.build_index(chunks)
        self.save_index()
        return len(chunks)

    def save_index(self):
        try:
            os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)
            with open(INDEX_PATH, "wb") as f:
                pickle.dump({
                    "chunks": self.retriever.chunks,
                    "vocab": self.retriever.vocab,
                    "idf": self.retriever.idf,
                    "tfidf_matrix": self.retriever.tfidf_matrix
                }, f)
        except Exception as e:
            print(f"Failed to save index: {e}")

    def load_index(self):
        if os.path.exists(INDEX_PATH):
            try:
                with open(INDEX_PATH, "rb") as f:
                    data = pickle.load(f)
                    self.retriever.chunks = data.get("chunks", [])
                    self.retriever.vocab = data.get("vocab", {})
                    self.retriever.idf = data.get("idf", [])
                    self.retriever.tfidf_matrix = data.get("tfidf_matrix", [])
            except Exception as e:
                print(f"Failed to load index: {e}")
                self.rebuild_index()
        else:
            self.rebuild_index()

    def search(self, query, top_k=3, doc_filter=None):
        results = self.retriever.retrieve(query, top_k=top_k)
        if doc_filter:
            # Filter results if we want specific docs (e.g. only Warranty.txt or FAQ.txt)
            # doc_filter can be a string or list of strings
            filters = [doc_filter.lower()] if isinstance(doc_filter, str) else [d.lower() for d in doc_filter]
            results = [r for r in results if any(f in r["doc_name"].lower() for f in filters)]
        return results

    async def get_external_embeddings(self, text, provider, api_key):
        # Optional embedding generation using OpenAI / Gemini APIs
        # To keep it fully integrated, we allow this as a bonus but default to local TF-IDF which is fast and requires no API setup
        pass
