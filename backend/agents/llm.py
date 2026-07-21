import httpx
import json
import logging
try:
    from backend.database.database import get_all_settings
except ModuleNotFoundError:
    from database.database import get_all_settings

logger = logging.getLogger("agent_llm")

async def call_llm(system_prompt: str, user_prompt: str, chat_history=None) -> str:
    """
    Calls Google Gemini or OpenAI API depending on what credentials are saved in the settings.
    If no credentials are saved, it returns None (indicating mock fallback should be used).
    """
    settings = get_all_settings()
    gemini_key = settings.get("gemini_api_key", "").strip()
    openai_key = settings.get("openai_api_key", "").strip()
    provider = settings.get("api_provider", "mock").lower()

    if provider == "gemini" and gemini_key:
        return await call_gemini(gemini_key, system_prompt, user_prompt, chat_history)
    elif provider == "openai" and openai_key:
        return await call_openai(openai_key, system_prompt, user_prompt, chat_history)
    
    return None

async def call_gemini(api_key: str, system_prompt: str, user_prompt: str, chat_history=None) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    # Construct history context
    history_context = ""
    if chat_history:
        history_context = "Conversation history:\n"
        for msg in chat_history[-6:]:  # Last 6 messages
            role = "Customer" if msg['sender'] == 'user' else "Agent"
            history_context += f"{role}: {msg['content']}\n"
        history_context += "\n"

    full_prompt = f"{system_prompt}\n\n{history_context}Customer Query: {user_prompt}\n\nAgent Response:"
    
    body = {
        "contents": [
            {
                "parts": [
                    {"text": full_prompt}
                ]
            }
        ]
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=body, headers={"Content-Type": "application/json"})
            if response.status_code == 200:
                res_data = response.json()
                text = res_data['candidates'][0]['content']['parts'][0]['text']
                return text.strip()
            else:
                logger.error(f"Gemini API returned error {response.status_code}: {response.text}")
                return f"Error from Gemini API ({response.status_code}): {response.text[:200]}"
    except Exception as e:
        logger.error(f"Failed to call Gemini API: {e}")
        return f"Failed to connect to Gemini API: {str(e)}"

async def call_openai(api_key: str, system_prompt: str, user_prompt: str, chat_history=None) -> str:
    url = "https://api.openai.com/v1/chat/completions"
    
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add history
    if chat_history:
        for msg in chat_history[-6:]:
            role = "user" if msg['sender'] == 'user' else "assistant"
            messages.append({"role": role, "content": msg['content']})
            
    messages.append({"role": "user", "content": user_prompt})
    
    body = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "temperature": 0.5
    }
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=body, headers=headers)
            if response.status_code == 200:
                res_data = response.json()
                text = res_data['choices'][0]['message']['content']
                return text.strip()
            else:
                logger.error(f"OpenAI API returned error {response.status_code}: {response.text}")
                return f"Error from OpenAI API ({response.status_code}): {response.text[:200]}"
    except Exception as e:
        logger.error(f"Failed to call OpenAI API: {e}")
        return f"Failed to connect to OpenAI API: {str(e)}"
