from flask import Blueprint, request, jsonify
import requests
import os
from datetime import datetime, timedelta
import json
import random
import math

market_bp = Blueprint('market', __name__)

# API Configuration
AGMARKNET_API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"
AGMARKNET_BASE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

# Enhanced crop mapping with variations
CROP_MAPPING = {
    'wheat': ['Wheat'],
    'rice': ['Rice'], 
    'corn': ['Maize', 'Corn'],
    'maize': ['Maize', 'Corn'],
    'tomato': ['Tomato'],
    'potato': ['Potato'],
    'onion': ['Onion'],
    'cotton': ['Cotton'],
    'sugarcane': ['Sugarcane'],
    'chilli': ['Dry Chillies', 'Chilli', 'Chili'],
    'cauliflower': ['Cauliflower'],
    'banana': ['Banana']
}

@market_bp.route('', methods=['GET'])
def get_market_prices():
    try:
        crop = request.args.get('crop', 'wheat').lower()
        period = request.args.get('period', '7days')
        
        print(f"Fetching data for crop: {crop}")
        
        # Try to get real data first
        market_data = get_real_market_data(crop, period)
        return jsonify(market_data), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify(get_demo_data(crop)), 200

def get_real_market_data(crop, period):
    """Get real data from AgMarkNet API with improved filtering"""
    try:
        api_crops = CROP_MAPPING.get(crop, [crop.title()])
        
        # Build API parameters - try different filter formats
        params = {
            'api-key': AGMARKNET_API_KEY,
            'format': 'json',
            'limit': 200,  # Increased limit to get more data
            'offset': 0
        }
        
        # Try multiple filter formats
        filter_formats = [
            f'[commodity,{api_crops[0]}]',
            f'commodity,{api_crops[0]}',
            f'[("commodity","=","{api_crops[0]}")]'
        ]
        
        response_data = None
        
        for filter_format in filter_formats:
            try:
                params['filters'] = filter_format
                print(f"Trying filter format: {filter_format}")
                
                response = requests.get(AGMARKNET_BASE_URL, params=params, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    records = data.get('records', [])
                    
                    if records:
                        print(f"Found {len(records)} records with filter: {filter_format}")
                        response_data = data
                        break
                        
            except Exception as e:
                print(f"Filter format {filter_format} failed: {e}")
                continue
        
        if not response_data:
            print("All filter formats failed, trying without filter...")
            # Try without filter and filter manually
            params.pop('filters', None)
            response = requests.get(AGMARKNET_BASE_URL, params=params, timeout=15)
            response_data = response.json() if response.status_code == 200 else None
        
        if response_data and 'records' in response_data:
            records = response_data['records']
            print(f"Total records received: {len(records)}")
            
            # Enhanced filtering logic
            crop_records = filter_crop_records(records, api_crops, crop)
            print(f"Filtered {len(crop_records)} records for {crop}")
            
            if crop_records:
                return process_real_data(crop_records, crop)
        
        return get_demo_data(crop)
        
    except Exception as e:
        print(f"API call failed: {str(e)}")
        return get_demo_data(crop)

def filter_crop_records(records, api_crops, original_crop):
    """Enhanced filtering to handle different crop name variations"""
    crop_records = []
    
    for record in records:
        try:
            commodity = record.get('commodity', '').lower()
            original_crop_lower = original_crop.lower()
            
            # Multiple matching strategies
            matches = False
            
            # Direct match
            if any(crop.lower() in commodity for crop in api_crops):
                matches = True
            # Partial match for common variations
            elif original_crop_lower in commodity:
                matches = True
            # Handle specific cases
            elif original_crop == 'chilli' and ('chilli' in commodity or 'chili' in commodity):
                matches = True
            elif original_crop == 'corn' and ('maize' in commodity or 'corn' in commodity):
                matches = True
            
            if matches:
                crop_records.append(record)
                
        except Exception as e:
            print(f"Error filtering record: {e}")
            continue
    
    return crop_records

def process_real_data(records, crop):
    """Process real API data with enhanced error handling"""
    price_history = []
    
    for record in records:
        try:
            # Extract price data with better validation
            modal_price = record.get('modal_price', '0')
            min_price = record.get('min_price', '0') 
            max_price = record.get('max_price', '0')
            date_str = record.get('arrival_date', '')
            
            # Clean and validate price data
            price_value = extract_valid_price(modal_price, min_price, max_price)
            
            if price_value and date_str and is_valid_date(date_str):
                price_history.append({
                    'date': date_str,
                    'price': round(price_value, 2),
                    'market': record.get('market', 'Unknown Market'),
                    'state': record.get('state', 'Unknown State'),
                    'district': record.get('district', 'Unknown District'),
                    'commodity': record.get('commodity', crop)
                })
                
        except Exception as e:
            print(f"Error processing record: {e}")
            continue
    
    if price_history:
        # Remove duplicates and sort by date
        price_history = remove_duplicate_dates(price_history)
        price_history.sort(key=lambda x: datetime.strptime(x['date'], '%d/%m/%Y'))
        
        print(f"Processed {len(price_history)} unique price records")
        
        # Ensure we have enough data
        if len(price_history) < 3:
            print(f"Not enough data points ({len(price_history)}), using demo data")
            return get_demo_data(crop)
        
        current_price = price_history[-1]['price']
        trend = calculate_trend(price_history)
        
        return {
            'crop': crop,
            'current_price': current_price,
            'current_price_display': f'₹{current_price:,.2f}',
            'trend': trend,
            'price_history': price_history[-30:],  # Last 30 entries
            'source': 'AgMarkNet - Government of India',
            'data_quality': 'live',
            'last_updated': datetime.now().isoformat(),
            'total_records': len(price_history),
            'unit': 'per quintal',
            'location': 'Various Markets across India',
            'data_points': len(price_history)
        }
    
    print("No valid price data found after processing")
    return get_demo_data(crop)

def extract_valid_price(modal_price, min_price, max_price):
    """Extract and validate price from multiple fields"""
    # Try modal price first
    if modal_price and is_valid_price(modal_price):
        return float(modal_price)
    
    # Try average of min/max
    if (min_price and max_price and 
        is_valid_price(min_price) and is_valid_price(max_price)):
        return (float(min_price) + float(max_price)) / 2
    
    return None

def is_valid_price(price_str):
    """Check if price string is valid"""
    try:
        price = float(price_str)
        return price > 0 and price < 1000000  # Reasonable price range
    except:
        return False

def is_valid_date(date_str):
    """Validate date format"""
    try:
        datetime.strptime(date_str, '%d/%m/%Y')
        return True
    except:
        return False

def remove_duplicate_dates(price_history):
    """Remove duplicate dates, keeping the latest entry for each date"""
    unique_dates = {}
    for record in price_history:
        date_key = record['date']
        current_price = record['price']
        
        # Keep the record with higher price for the same date
        if date_key not in unique_dates or current_price > unique_dates[date_key]['price']:
            unique_dates[date_key] = record
    
    return list(unique_dates.values())

def calculate_trend(price_history):
    """Calculate price trend based on recent data"""
    if len(price_history) < 2:
        return 'stable'
    
    # Use last 7 data points for more accurate trend
    recent_data = price_history[-7:] if len(price_history) >= 7 else price_history
    prices = [item['price'] for item in recent_data]
    
    # Calculate percentage change
    first_price = prices[0]
    last_price = prices[-1]
    percentage_change = ((last_price - first_price) / first_price) * 100
    
    if abs(percentage_change) < 1.5:  # Reduced threshold for more sensitivity
        return 'stable'
    elif percentage_change > 0:
        return 'up'
    else:
        return 'down'

def get_demo_data(crop):
    """Generate realistic demo data when API is unavailable"""
    base_prices = {
        'wheat': 2200, 'rice': 2800, 'corn': 1900, 'tomato': 1500,
        'potato': 900, 'onion': 1800, 'cotton': 5500, 'sugarcane': 3200,
        'chilli': 4500, 'cauliflower': 1200, 'banana': 1600
    }
    
    base_price = base_prices.get(crop, 2000)
    price_history = []
    
    # Generate 30 days of realistic data with trends
    for i in range(30):
        date = datetime.now() - timedelta(days=30-i)
        
        # More realistic variations
        daily_variation = random.uniform(-0.1, 0.1)
        # Seasonal trend effect
        seasonal_effect = math.sin(i * 0.2) * 0.08
        # Random market noise
        market_noise = random.uniform(-0.05, 0.05)
        
        price = base_price * (1 + daily_variation + seasonal_effect + market_noise)
        
        price_history.append({
            'date': date.strftime('%d/%m/%Y'),
            'price': round(price, 2),
            'market': f'Market {random.randint(1, 10)}',
            'state': random.choice(['Punjab', 'Maharashtra', 'Uttar Pradesh', 'Karnataka']),
            'district': f'District {random.randint(1, 5)}',
            'commodity': crop.title()
        })
    
    current_price = price_history[-1]['price']
    trend = calculate_trend(price_history)
    
    return {
        'crop': crop,
        'current_price': current_price,
        'current_price_display': f'₹{current_price:,.2f}',
        'trend': trend,
        'price_history': price_history,
        'source': 'Enhanced Sample Data',
        'data_quality': 'demo',
        'last_updated': datetime.now().isoformat(),
        'total_records': len(price_history),
        'unit': 'per quintal',
        'location': 'National Average',
        'data_points': len(price_history),
        'note': 'Real-time data temporarily unavailable. Showing realistic sample data.'
    }

# Enhanced test endpoint
@market_bp.route('/test', methods=['GET'])
def test_endpoint():
    """Test API connectivity and data retrieval"""
    try:
        crop = request.args.get('crop', 'tomato')
        api_crops = CROP_MAPPING.get(crop, [crop.title()])
        
        params = {
            'api-key': AGMARKNET_API_KEY,
            'format': 'json',
            'limit': 10,
        }
        
        # Test without filter first to see what's available
        response = requests.get(AGMARKNET_BASE_URL, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            records = data.get('records', [])
            
            # Check what crops are available
            available_crops = set()
            for record in records:
                commodity = record.get('commodity', '')
                if commodity:
                    available_crops.add(commodity)
            
            # Check if our crop is in available crops
            crop_found = any(any(api_crop.lower() in commodity.lower() for api_crop in api_crops) 
                           for commodity in available_crops)
            
            return jsonify({
                'status': 'success',
                'api_working': True,
                'total_records': data.get('total', 0),
                'records_returned': len(records),
                'crop_requested': crop,
                'crop_variations': api_crops,
                'crop_found_in_data': crop_found,
                'available_crops_sample': list(available_crops)[:10],
                'sample_records': records[:3]
            })
        else:
            return jsonify({
                'status': 'error',
                'api_working': False,
                'error': f'HTTP {response.status_code}'
            })
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'api_working': False,
            'error': str(e)
        })

# Health check endpoint
@market_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'api_key_configured': bool(AGMARKNET_API_KEY)
    })

# Crop list endpoint
@market_bp.route('/crops', methods=['GET'])
def get_available_crops():
    """Get list of available crops"""
    return jsonify({
        'available_crops': list(CROP_MAPPING.keys()),
        'total_crops': len(CROP_MAPPING)
    })