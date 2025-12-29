from flask import Blueprint, request, jsonify
import requests
import os
from datetime import datetime, timedelta

weather_bp = Blueprint("weather", __name__)

OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY", "a63621689253688a2cdd47570e15c520")

@weather_bp.route("/", methods=["GET"])
def get_weather():
    city = request.args.get("district")
    if not city:
        return jsonify({"error": "District is required"}), 400

    try:
        # Get current weather
        current_url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_KEY}&units=metric"
        current_res = requests.get(current_url)
        current_data = current_res.json()

        if current_data.get("cod") != 200:
            return jsonify({"error": "Failed to fetch weather data", "details": current_data}), 400

        # Get 5-day forecast
        forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={OPENWEATHER_KEY}&units=metric"
        forecast_res = requests.get(forecast_url)
        forecast_data = forecast_res.json()

        if forecast_data.get("cod") != "200":
            return jsonify({"error": "Failed to fetch forecast data", "details": forecast_data}), 400

        # Process forecast data to get daily forecasts
        daily_forecast = process_forecast_data(forecast_data)

        # Generate irrigation advice based on weather conditions
        irrigation_advice = generate_irrigation_advice(current_data, daily_forecast)

        # Shape data in frontend-friendly format
        return jsonify({
            "district": city,
            "temperature": current_data["main"]["temp"],
            "humidity": current_data["main"]["humidity"],
            "conditions": current_data["weather"][0]["description"].title(),
            "wind": current_data["wind"]["speed"],
            "forecast": daily_forecast,
            "irrigation_advice": irrigation_advice
        })

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

def process_forecast_data(forecast_data):
    """Process the 5-day forecast data to extract daily forecasts"""
    daily_forecast = []
    
    # Group forecasts by day
    daily_data = {}
    for item in forecast_data.get("list", []):
        # Extract date from dt_txt (format: "2023-10-30 12:00:00")
        date = item["dt_txt"].split(" ")[0]
        
        if date not in daily_data:
            daily_data[date] = []
        
        daily_data[date].append(item)
    
    # Get today's date and next 4 days
    dates = sorted(daily_data.keys())
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Remove today from the list if it exists
    if today in dates:
        dates.remove(today)
    
    # Take the next 5 days (including today if available)
    forecast_dates = dates[:5]
    
    # Create daily forecast entries
    for i, date in enumerate(forecast_dates):
        day_data = daily_data[date]
        
        # Calculate average temperature for the day
        avg_temp = sum(item["main"]["temp"] for item in day_data) / len(day_data)
        
        # Find the most common weather condition
        conditions = [item["weather"][0]["description"] for item in day_data]
        most_common_condition = max(set(conditions), key=conditions.count)
        
        # Calculate chance of rain
        rain_chance = 0
        for item in day_data:
            if "rain" in item:
                rain_chance = max(rain_chance, item["rain"].get("3h", 0))
        
        # Get wind speed (average)
        avg_wind = sum(item["wind"]["speed"] for item in day_data) / len(day_data)
        
        # Determine day name
        if i == 0:
            day_name = "Tomorrow"
        else:
            day_name = f"Day {i+1}"
        
        daily_forecast.append({
            "day": day_name,
            "temp": round(avg_temp, 1),
            "condition": most_common_condition.title(),
            "rain": round(rain_chance * 10),  # Convert to percentage
            "wind": round(avg_wind, 1)
        })
    
    return daily_forecast

def generate_irrigation_advice(current_data, forecast):
    """Generate irrigation advice based on current and forecasted weather"""
    current_temp = current_data["main"]["temp"]
    humidity = current_data["main"]["humidity"]
    
    # Check if rain is expected in the forecast
    rain_expected = any(day["rain"] > 30 for day in forecast)
    
    # Check if high temperatures are expected
    high_temp_expected = any(day["temp"] > 30 for day in forecast)
    
    # Generate advice based on conditions
    if rain_expected:
        return "Reduce irrigation as rain is expected in the coming days"
    elif high_temp_expected and humidity < 60:
        return "Increase irrigation due to high temperatures and low humidity"
    elif current_temp > 28 and humidity < 50:
        return "Moderate irrigation recommended to maintain soil moisture"
    else:
        return "Normal irrigation schedule is appropriate for current conditions"