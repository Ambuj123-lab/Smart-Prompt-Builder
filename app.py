from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Configuration from .env
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
PASSWORD = os.getenv('PASSWORD', 'SmartAmbujBot')  # Default password updated

# Simple hash function (same as frontend)
def simple_hash(text):
    hash_val = 0
    for char in text:
        hash_val = ((hash_val << 5) - hash_val + ord(char)) & 0xFFFFFFFF
    return str(hash_val if hash_val < 0x80000000 else hash_val - 0x100000000)

PASSWORD_HASH = simple_hash(PASSWORD)

@app.route('/')
def index():
    """Serve the main HTML page"""
    return app.send_static_file('index.html')

@app.route('/api/verify-password', methods=['POST'])
def verify_password():
    """Verify password directly"""
    data = request.json
    provided_password = data.get('password')
    
    print(f"DEBUG: Received password: '{provided_password}'")
    print(f"DEBUG: Expected password: '{PASSWORD}'")
    
    if provided_password == PASSWORD:
        print("DEBUG: Password MATCH!")
        return jsonify({'success': True})
    else:
        print("DEBUG: Password MISMATCH!")
        return jsonify({'success': False}), 401

@app.route('/api/generate', methods=['POST'])
def generate_prompt():
    """Proxy endpoint for OpenRouter API with guardrails"""
    try:
        data = request.json
        user_input = data.get('input')
        strategy = data.get('strategy', 'chain-of-thought')
        tone = data.get('tone', 'professional')
        output_lang = data.get('outputLang', 'en')
        
        # Check if API key is configured
        if not OPENROUTER_API_KEY:
            return jsonify({
                'error': 'API key not configured',
                'fallback': True
            }), 503
        
        # Construct system prompt dynamically
        lang_instruction = ""
        if output_lang == 'hi':
            lang_instruction = "CRITICAL: The user has requested the output in HINDI (Devanagari script). You MUST write the prompt in HINDI. Do not use English unless absolutely necessary for technical terms."
        elif output_lang == 'en':
            lang_instruction = "Respond in English."
        
        system_prompt = f"""You are an expert AI Prompt Engineer. Your ONLY job is to generate optimized prompts.

🚨 CRITICAL GUARDRAILS - MUST FOLLOW:
1. DO NOT have conversations with the user
2. DO NOT answer questions directly
3. DO NOT provide checklists, tips, or advice
4. DO NOT ask clarifying questions
5. ONLY generate prompts in the exact format specified below

YOUR TASK:
Generate a high-quality prompt based on user input that they can use with LLMs (ChatGPT, Claude, Grok, etc.)

REQUIREMENTS:
- Tone: {tone}
- Language: {lang_instruction}
- Strategy: {strategy}

Strategy Application:
- chain-of-thought: Create a prompt that encourages step-by-step reasoning
- few-shot: Include examples in the generated prompt
- zero-shot: Create a direct, concise prompt
- tree-of-thought: Create a prompt that asks for multiple perspectives
- react: Create a prompt that asks for Thought/Action/Observation structure

MANDATORY OUTPUT FORMAT (Follow EXACTLY):

**MAIN PROMPT**:
[Generate a complete, comprehensive prompt that the user can directly use with any AI tool. This should be a fully-formed, detailed prompt that incorporates the strategy and tone. Make it 150-200 tokens, professional and ready-to-use.]

---

**ADVANCED SECTIONS** (For power users who want granular control):

**BASE PROMPT** (72-77 tokens):
[Core instruction and context for the task]

**POSITIVE PROMPT** (72-77 tokens):
[What to include, emphasize, and focus on. Use affirmative language describing desired qualities, elements, and outcomes]

**NEGATIVE PROMPT** (72-77 tokens):
[What to avoid or exclude. Use phrases like "avoid", "exclude", "without", "refrain from" instead of using the word "no". Focus on unwanted elements, styles, or approaches to prevent]

🚨 REMEMBER: Generate ONLY the prompt in this format. NO conversation, NO checklists, NO explanations outside the prompt format.
"""

        # Call OpenRouter API with guardrails
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": request.host_url,
                "X-Title": "Smart Prompt Builder",
                "Content-Type": "application/json"
            },
            json={
                "model": "x-ai/grok-4.1-fast:free",  # Explicit free model
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                "max_tokens": 500,  # LOCKED GUARDRAIL: Limit response length
                "temperature": 0.7   # LOCKED GUARDRAIL: Balanced creativity
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            generated_prompt = result['choices'][0]['message']['content']
            
            # Extract actual token usage from API response
            # Handle different response structures just in case
            usage = result.get('usage', {})
            if not usage and 'x-grok-usage' in result: # Check for model specific usage headers if any
                 usage = result.get('x-grok-usage', {})
            
            prompt_tokens = usage.get('prompt_tokens', 0)
            completion_tokens = usage.get('completion_tokens', 0)
            total_tokens = usage.get('total_tokens', prompt_tokens + completion_tokens)
            
            return jsonify({
                'success': True,
                'prompt': generated_prompt,
                'tokens_used': {
                    'prompt_tokens': prompt_tokens,
                    'completion_tokens': completion_tokens,
                    'total_tokens': total_tokens
                }
            })
        else:
            # API error - Use fallback template
            print(f"⚠️ API Error: {response.status_code} - Using fallback template")
            fallback_prompt = generate_fallback_prompt(user_input, strategy, tone, output_lang)
            return jsonify({
                'success': True,
                'prompt': fallback_prompt,
                'fallback_used': True,
                'tokens_used': {
                    'prompt_tokens': 0,
                    'completion_tokens': 0,
                    'total_tokens': 0
                }
            })
            
    except requests.exceptions.Timeout:
        print("⚠️ API Timeout - Using fallback template")
        fallback_prompt = generate_fallback_prompt(user_input, strategy, tone, output_lang)
        return jsonify({
            'success': True,
            'prompt': fallback_prompt,
            'fallback_used': True,
            'tokens_used': {
                'prompt_tokens': 0,
                'completion_tokens': 0,
                'total_tokens': 0
            }
        })
    except Exception as e:
        print(f"⚠️ Exception: {str(e)} - Using fallback template")
        fallback_prompt = generate_fallback_prompt(user_input, strategy, tone, output_lang)
        return jsonify({
            'success': True,
            'prompt': fallback_prompt,
            'fallback_used': True,
            'tokens_used': {
                'prompt_tokens': 0,
                'completion_tokens': 0,
                'total_tokens': 0
            }
        })

def generate_fallback_prompt(user_input, strategy, tone, output_lang):
    """Generate prompt using local template when API is unavailable"""
    
    # Strategy-specific templates
    strategy_templates = {
        'zero-shot': {
            'main': f"Create a solution for: {user_input}. Provide a clear, direct approach with specific implementation steps. Focus on practical execution with attention to detail, quality standards, and best practices. Include concrete examples where applicable and ensure the solution is actionable and comprehensive. Consider edge cases and provide guidance for optimal results with {tone.lower()} tone throughout.",
            'base': f"Task: {user_input}. Provide a clear, direct solution with specific steps and actionable guidance. Focus on practical implementation with attention to detail and quality standards.",
            'positive': f"Include comprehensive explanations, best practices, efficient methods, clear examples, structured approach, professional quality, optimized solutions, detailed instructions, practical tips, and actionable steps throughout.",
            'negative': f"Avoid vague descriptions, incomplete information, rushed solutions, unclear instructions, generic advice, superficial analysis, missing context, ambiguous terms, oversimplified approaches, and lack of specific details."
        },
        'few-shot': {
            'main': f"Address this task: {user_input}. Learn from proven patterns and examples. Example 1: Demonstrate the core approach with clear steps. Example 2: Show a variation highlighting key differences. Example 3: Illustrate edge case handling. Now apply these demonstrated methodologies to create your solution, maintaining {tone.lower()} tone and ensuring practical applicability with concrete, transferable techniques.",
            'base': f"Task: {user_input}. Learn from these examples and apply similar patterns. Example 1: [Demonstrate approach]. Example 2: [Show variation]. Now apply this methodology.",
            'positive': f"Include pattern recognition, example-based learning, demonstrated techniques, proven methods, clear parallels, structured examples, practical applications, transferable skills, concrete demonstrations, and reusable patterns throughout.",
            'negative': f"Avoid examples without context, unclear patterns, inconsistent demonstrations, confusing variations, missing connections, irrelevant examples, poor analogies, disconnected concepts, weak correlations, and unexplained differences."
        },
        'chain-of-thought': {
            'main': f"Let's systematically solve: {user_input}. Step 1: Analyze the core requirements and constraints. Step 2: Break down the problem into manageable components. Step 3: Evaluate each component's dependencies and interactions. Step 4: Develop solutions for each part. Step 5: Integrate components into a cohesive whole. Step 6: Validate and refine the complete solution. Maintain {tone.lower()} tone with clear reasoning at each stage.",
            'base': f"Task: {user_input}. Let's think through this step-by-step. First, analyze the requirements. Then, break down the approach. Next, consider each component. Finally, synthesize the solution.",
            'positive': f"Include logical progression, clear reasoning, step-by-step breakdown, thoughtful analysis, connected ideas, sequential thinking, methodical approach, reasoned conclusions, systematic exploration, and coherent flow throughout.",
            'negative': f"Avoid jumping to conclusions, skipping steps, illogical leaps, disconnected thoughts, rushed analysis, missing intermediate steps, unclear transitions, incomplete reasoning, hasty decisions, and fragmented thinking."
        },
        'tree-of-thought': {
            'main': f"Explore multiple solution paths for: {user_input}. Path A (Traditional): Leverage established methods with proven reliability. Path B (Innovative): Apply cutting-edge techniques for enhanced results. Path C (Hybrid): Combine strengths of both approaches. Evaluate each path's trade-offs, feasibility, and expected outcomes. Select the optimal approach based on your specific context and constraints. Present with {tone.lower()} tone and comprehensive analysis.",
            'base': f"Task: {user_input}. Explore multiple solution paths. Path A: [Traditional approach]. Path B: [Innovative method]. Path C: [Hybrid solution]. Evaluate and select the optimal path.",
            'positive': f"Include multiple perspectives, diverse approaches, alternative solutions, comparative analysis, branching options, evaluated paths, considered trade-offs, explored possibilities, weighted decisions, and comprehensive coverage throughout.",
            'negative': f"Avoid single-track thinking, limited options, unexplored alternatives, missing comparisons, biased selection, incomplete evaluation, overlooked paths, narrow perspectives, rushed decisions, and insufficient exploration."
        },
        'react': {
            'main': f"Iteratively solve: {user_input}. Thought: Analyze the problem space and identify key challenges. Action: Define initial approach and implementation strategy. Observation: Evaluate results and gather feedback. Thought: Refine understanding based on observations. Action: Implement improvements and optimizations. Observation: Verify success and identify remaining gaps. Continue this cycle until optimal solution achieved. Maintain {tone.lower()} tone with adaptive, responsive methodology.",
            'base': f"Task: {user_input}. Thought: Analyze the problem. Action: Define the approach. Observation: Note the results. Thought: Refine based on feedback. Action: Implement improvements. Observation: Verify success.",
            'positive': f"Include iterative thinking, action-oriented steps, observational feedback, continuous refinement, adaptive approach, responsive adjustments, measured progress, evaluated outcomes, learning cycles, and improvement loops throughout.",
            'negative': f"Avoid static planning, action without thought, ignored feedback, rigid approaches, missed observations, unadapted methods, stagnant progress, unverified results, learning gaps, and improvement resistance."
        }
    }
    
    # Get template for strategy (default to zero-shot)
    template = strategy_templates.get(strategy, strategy_templates['zero-shot'])
    
    # Format the response
    result = f"""**MAIN PROMPT**:
{template['main']}

---

**ADVANCED SECTIONS** (For power users who want granular control):

**BASE PROMPT** (72-77 tokens):
{template['base']}

**POSITIVE PROMPT** (72-77 tokens):
{template['positive']}

**NEGATIVE PROMPT** (72-77 tokens):
{template['negative']}

---
ℹ️ This prompt was generated using a local template (API quota may be exhausted). The structure and quality are maintained for your use."""

    return result

if __name__ == '__main__':
    # Check if .env is configured
    if not OPENROUTER_API_KEY:
        print("\\n⚠️  WARNING: OPENROUTER_API_KEY not found in .env file!")
        print("📝 Please copy .env.example to .env and add your API key.\\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
