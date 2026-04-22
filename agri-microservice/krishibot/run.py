#!/usr/bin/env python3
"""
KrishiBot Startup Script
Run this to start the KrishiBot service
"""

import uvicorn
import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("=" * 50)
    print(" KrishiBot Starting...")
    print("=" * 50)
    print(f" API will be available at: http://localhost:8000")
    print(f" Text endpoint: http://localhost:8000/api/ask-text")
    print(f" Voice endpoint: http://localhost:8000/api/ask-voice")
    print(f" Health check: http://localhost:8000/api/health")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )