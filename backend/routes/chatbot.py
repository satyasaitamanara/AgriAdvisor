from flask import Blueprint, request, jsonify
from groq import Groq
import os
from flask_cors import cross_origin

chatbot_bp = Blueprint('chatbot', __name__)

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError("GROQ_API_KEY not configured")

    return Groq(api_key=api_key)

# Updated Agriculture-specific system prompts with better Telugu completion instructions
AGRICULTURE_SYSTEM_PROMPT = {
    "en": """You are Krishi Mitra, an AI agriculture assistant for Indian farmers. You provide practical, actionable advice.

IMPORTANT: Always provide COMPLETE answers. Do not truncate or cut off responses mid-sentence.

CROP MANAGEMENT:
- Best crops for different soil types
- Seasonal planting guidance
- Crop rotation strategies

FERTILIZER & SOIL:
- Organic and chemical fertilizer recommendations
- Soil health improvement
- Compost preparation

PEST & DISEASE CONTROL:
- Natural pest control methods
- Disease identification

IRRIGATION:
- Water management techniques

WEATHER & CLIMATE:
- Weather-based farming decisions

Keep answers concise but COMPLETE. If you don't know something, suggest consulting local agriculture officers.""",

    "te": """మీరు కృషి మిత్రుడు, భారతీయ రైతుల కోసం ఒక AI వ్యవసాయ సహాయకుడు.

**ముఖ్యమైన సూచన:** ఎల్లప్పుడూ పూర్తి సమాధానాలు ఇవ్వండి. వాక్యాల మధ్యలో సమాధానాలను నరికివేయవద్దు లేదా కట్ చేయవద్దు.

పంట నిర్వహణ:
- వివిధ నేల రకాలకు అనుకూలమైన పంటలు
- ఋతువు వారీగా నాటడం
- పంట మార్పిడి వ్యూహాలు

ఎరువులు & నేల:
- సేంద్రీయ మరియు రసాయన ఎరువుల సిఫార్సులు
- నేల ఆరోగ్యం మెరుగుపరచడం
- కంపోస్ట్ తయారీ

కీటకాలు & రోగ నియంత్రణ:
- సహజ కీటక నియంత్రణ పద్ధతులు
- రోగాల గుర్తింపు

నీటిపారుదల:
- నీటి నిర్వహణ పద్ధతులు

వాతావరణం & క్లైమేట్:
- వాతావరణం ఆధారిత వ్యవసాయ నిర్ణయాలు

సమాధానాలను సంక్షిప్తంగా కానీ పూర్తిగా ఇవ్వండి. మీకు ఏదైనా తెలియకపోతే, స్థానిక వ్యవసాయ అధికారులను సంప్రదించమని సూచించండి."""
}

@chatbot_bp.route('/chat', methods=['POST', 'OPTIONS'])
@cross_origin()
def chat():
    try:
        client = get_groq_client()
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
        
        # Add conversation history (last 4 messages to avoid truncation)
        for msg in conversation_history[-4:]:
            role = "user" if msg.get("sender") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("text", "")})
        
        # Add current user message
        messages.append({"role": "user", "content": user_msg})

        # Get response from Groq API with increased tokens for Telugu
        max_tokens = 800 if language == "te" else 500
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=max_tokens,
            stream=False
        )
        
        bot_reply = response.choices[0].message.content.strip()
        
        # Check if response ends properly
        if language == "te" and not (bot_reply.endswith('.') or bot_reply.endswith('?') or bot_reply.endswith('!')):
            # If response seems truncated, try to get a bit more
            try:
                response2 = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=messages + [{"role": "assistant", "content": bot_reply},
                                        {"role": "user", "content": "ముగింపు పూర్తిగా చెప్పండి"}],
                    temperature=0.7,
                    max_tokens=200,
                    stream=False
                )
                continuation = response2.choices[0].message.content.strip()
                if continuation:
                    bot_reply = bot_reply + " " + continuation
            except:
                pass
        
        return jsonify({
            "response": bot_reply,
            "success": True
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
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

# import google.generativeai as genai
# from flask import Blueprint, request, jsonify
# from flask_cors import cross_origin

# chatbot_bp = Blueprint('chatbot', __name__)

# # Configure Gemini
# genai.configure(api_key=os.getenv("GROQ_API_KEY"))  

# # Gemini model
# model = genai.GenerativeModel('gemini-pro')

# @chatbot_bp.route('/chat-gemini', methods=['POST', 'OPTIONS'])
# @cross_origin()
# def chat_gemini():
#     try:
#         if request.method == 'OPTIONS':
#             return jsonify({'status': 'ok'}), 200
            
#         data = request.get_json()
#         user_msg = data.get("message", "").strip()
#         language = data.get("language", "en")
        
#         if language == "te":
#             prompt = f"""భారతీయ వ్యవసాయ సహాయకుడిగా పూర్తి సమాధానం ఇవ్వండి. ఎప్పటికీ వాక్యం మధ్యలో ఆపవద్దు.

# ప్రశ్న: {user_msg}

# పూర్తి సమాధానం:"""
#         else:
#             prompt = f"""As an Indian agriculture assistant, provide a complete answer. Never truncate mid-sentence.

# Question: {user_msg}

# Complete answer:"""
        
#         response = model.generate_content(
#             prompt,
#             generation_config=genai.types.GenerationConfig(
#                 max_output_tokens=1000,
#                 temperature=0.7
#             )
#         )
        
#         bot_reply = response.text.strip()
        
#         return jsonify({
#             "response": bot_reply,
#             "success": True
#         })
        
#     except Exception as e:
#         return jsonify({
#             "response": f"Error: {str(e)}",
#             "success": False
#         }), 500
