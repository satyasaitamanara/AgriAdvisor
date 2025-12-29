from flask import Blueprint, request, jsonify
from groq import Groq
from flask_cors import cross_origin

chatbot_bp = Blueprint('chatbot', __name__)

# Initialize Groq client
client = Groq(api_key="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")

# Agriculture-specific system prompts
AGRICULTURE_SYSTEM_PROMPT = {
    "en": """You are Krishi Mitra, an AI agriculture assistant for Indian farmers. You provide practical, actionable advice for:

CROP MANAGEMENT:
- Best crops for different soil types (sandy, clay, black, red)
- Seasonal planting guidance (kharif, rabi, summer)
- Crop rotation strategies
- Intercropping suggestions

FERTILIZER & SOIL:
- Organic and chemical fertilizer recommendations
- Soil health improvement
- pH balance management
- Compost preparation

PEST & DISEASE CONTROL:
- Natural pest control methods
- Disease identification and treatment
- Preventive measures
- Safe pesticide usage

IRRIGATION:
- Water management techniques
- Drip irrigation setup
- Rainwater harvesting
- Water conservation

WEATHER & CLIMATE:
- Weather-based farming decisions
- Drought management
- Flood prevention
- Seasonal adaptations

Always respond in a helpful, practical manner. Keep answers concise and actionable. If you don't know something, suggest consulting local agriculture officers.

Focus on Indian farming conditions, various soil types, and different climate zones.""",

    "te": """మీరు కృషి మిత్రుడు, భారతీయ రైతుల కోసం ఒక AI వ్యవసాయ సహాయకుడు. మీరు ఆచరణాత్మక, చర్య తీసుకోగల సలహాలు ఇస్తారు:

పంట నిర్వహణ:
- వివిధ నేల రకాలకు అనుకూలమైన పంటలు (ఇసుక, బంకమన్ను, నల్ల, ఎరుపు నేలలు)
- ఋతువు వారీగా నాటడం (ఖరీఫ్, రబీ, వేసవి)
- పంట మార్పిడి వ్యూహాలు
- ఇంటర్క్రాప్పింగ్ సూచనలు

ఎరువులు & నేల:
- సేంద్రీయ మరియు రసాయన ఎరువుల సిఫార్సులు
- నేల ఆరోగ్యం మెరుగుపరచడం
- pH సమతుల్యత నిర్వహణ
- కంపోస్ట్ తయారీ

కీటకాలు & రోగ నియంత్రణ:
- సహజ కీటక నియంత్రణ పద్ధతులు
- రోగాల గుర్తింపు మరియు చికిత్స
- నివారణ చర్యలు
- సురక్షిత పురుగుమందుల వాడకం

నీటిపారుదల:
- నీటి నిర్వహణ పద్ధతులు
- డ్రిప్ నీటిపారుదల సెటప్
- వర్షపు నీటి సేకరణ
- నీటి పొదుపు

వాతావరణం & క్లైమేట్:
- వాతావరణం ఆధారిత వ్యవసాయ నిర్ణయాలు
- కరువు నిర్వహణ
- వరదల నివారణ
- ఋతువు అనుసార అనుకూలత

ఎల్లప్పుడూ సహాయకరమైన, ఆచరణాత్మక పద్ధతిలో ప్రతిస్పందించండి. సమాధానాలను సంక్షిప్తంగా మరియు చర్యాత్మకంగా ఉంచండి. మీకు ఏదైనా తెలియకపోతే, స్థానిక వ్యవసాయ అధికారులను సంప్రదించమని సూచించండి.

భారతీయ వ్యవసాయ పరిస్థితులు, వివిధ రకాల నేలలు మరియు వివిధ వాతావరణ మండలాలపై దృష్టి సారించండి."""
}

@chatbot_bp.route('/chat', methods=['POST', 'OPTIONS'])
@cross_origin()
def chat():
    try:
        if request.method == 'OPTIONS':
            return jsonify({'status': 'ok'}), 200
            
        data = request.get_json()
        if not data:
            return jsonify({
                "response": "No data received",
                "success": False
            }), 400

        user_msg = data.get("message", "").strip()
        language = data.get("language", "en")
        conversation_history = data.get("history", [])
        
        if not user_msg:
            return jsonify({
                "response": "Please enter a message." if language == "en" else "దయచేసి సందేశాన్ని నమోదు చేయండి.",
                "success": False
            }), 400

        # Prepare messages for Groq
        messages = [
            {"role": "system", "content": AGRICULTURE_SYSTEM_PROMPT.get(language, AGRICULTURE_SYSTEM_PROMPT["en"])}
        ]
        
        # Add conversation history (last 6 messages to maintain context)
        for msg in conversation_history[-6:]:
            role = "user" if msg.get("sender") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("text", "")})
        
        # Add current user message
        messages.append({"role": "user", "content": user_msg})

        # Get response from Groq API
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        bot_reply = response.choices[0].message.content.strip()
        
        return jsonify({
            "response": bot_reply,
            "success": True
        })
        
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        if language == "te":
            error_msg = f"లోపం: {str(e)}"
        
        return jsonify({
            "response": error_msg,
            "success": False
        }), 500

@chatbot_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "Agriculture AI Chatbot",
        "version": "1.0"
    })