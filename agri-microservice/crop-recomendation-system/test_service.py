import requests
import json

# API endpoint
BASE_URL = "http://localhost:8001"

# Dummy crop input data
dummy_data = {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 20.87,
    "humidity": 82.00,
    "ph": 6.5,
    "rainfall": 202.9
}

def test_recommend():
    """Test the /recommend endpoint"""
    url = f"{BASE_URL}/recommend"
    
    print(f"Testing {url}")
    print(f"Sending payload: {json.dumps(dummy_data, indent=2)}\n")
    
    try:
        response = requests.post(url, json=dummy_data)
        response.raise_for_status()
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure it's running on port 8001.")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

def test_health():
    """Test the health check endpoint"""
    url = f"{BASE_URL}/"
    
    print(f"Testing health check at {url}")
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}\n")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server.\n")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}\n")

if __name__ == "__main__":
    print("=" * 60)
    print("Crop Recommendation Service - Test Script")
    print("=" * 60 + "\n")
    
    # Test health check first
    test_health()
    
    # Test recommendation endpoint
    test_recommend()
    
    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)
