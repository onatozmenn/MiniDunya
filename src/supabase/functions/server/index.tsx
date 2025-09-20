import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { handleAIVoiceGeneration } from "./ai-voice.ts";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-7da483db/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint for environment variables
app.get("/make-server-7da483db/debug-env", (c) => {
  const envElevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  const allEnv = Deno.env.toObject();
  
  // Force use correct key
  const elevenLabsKey = 'sk_4b4619eabfc05a446bc092f1168537ec70e986243f16404a';
  const usingFallback = true;
  
  return c.json({
    keys: {
      elevenlabs: {
        exists: !!elevenLabsKey,
        length: elevenLabsKey?.length || 0,
        prefix: elevenLabsKey?.substring(0, 10) || 'none',
        usingFallback: usingFallback,
        status: 'HARDCODED_FIXED'
      },
      originalEnvVar: {
        exists: !!envElevenLabsKey,
        length: envElevenLabsKey?.length || 0,
        prefix: envElevenLabsKey?.substring(0, 10) || 'none',
        full: envElevenLabsKey || 'MISSING'
      },
      openai: {
        exists: !!openAIKey,
        length: openAIKey?.length || 0,
        prefix: openAIKey?.substring(0, 10) || 'none'
      }
    },
    allKeys: Object.keys(allEnv).filter(key => 
      key.includes('KEY') || key.includes('API') || key.includes('SUPABASE')
    ),
    timestamp: new Date().toISOString()
  });
});

// Test API key directly
app.post("/make-server-7da483db/test-api-key", async (c) => {
  try {
    const { apiKey: providedKey } = await c.req.json();
    
    // Use the correct API key directly
    const apiKey = 'sk_4b4619eabfc05a446bc092f1168537ec70e986243f16404a';
    
    if (!apiKey) {
      return c.json({ success: false, error: 'No API key available' });
    }
    
    console.log('🧪 Testing API key:', apiKey.substring(0, 10) + '...');
    
    // Test ElevenLabs API with the provided key
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: 'Test ses',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true
        }
      })
    });
    
    if (response.ok) {
      return c.json({ 
        success: true, 
        message: 'API key works!',
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 8)
      });
    } else {
      const errorText = await response.text();
      return c.json({ 
        success: false, 
        error: `API test failed: ${response.status} - ${errorText}`,
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 8)
      });
    }
  } catch (error) {
    return c.json({ 
      success: false, 
      error: `Test error: ${error}` 
    });
  }
});

// AI Voice generation endpoint
app.post("/make-server-7da483db/generate-voice", async (c) => {
  try {
    const { text, character, emotion, model } = await c.req.json();
    
    if (!text || !character || !emotion) {
      return c.json({ 
        success: false, 
        error: "Missing required parameters: text, character, emotion" 
      }, 400);
    }

    // Generate unique cache key
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', textBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 20);
    const cacheKey = `voice_${character}_${emotion}_${hashHex}`;
    
    // Check cache first
    const cached = await kv.get(cacheKey);
    if (cached) {
      console.log('🎭 Using cached voice for:', character, emotion);
      return c.json({
        success: true,
        audioUrl: cached,
        cached: true
      });
    }

    // Generate new voice
    console.log('🎙️ Generating AI voice for:', character, emotion, text.substring(0, 50) + '...');
    const result = await handleAIVoiceGeneration(text, character, emotion, model || 'elevenlabs', 0);
    
    if (result.success && result.audioUrl) {
      // Cache the result for 24 hours
      await kv.set(cacheKey, result.audioUrl);
      console.log('✅ Voice generated and cached successfully');
    }

    // Log result for debugging
    if (result.usedFallback) {
      console.log('✅ Voice generated using fallback system');
    }
    
    return c.json(result);
  } catch (error) {
    console.error('AI Voice generation error:', error);
    return c.json({ 
      success: false, 
      error: String(error) 
    }, 500);
  }
});

// 🧹 Clear voice cache endpoint
app.post("/make-server-7da483db/clear-voice-cache", async (c) => {
  try {
    // Get all voice cache keys
    const allVoiceKeys = await kv.getByPrefix('voice_');
    console.log(`🧹 Found ${allVoiceKeys.length} voice cache entries to clear`);
    
    // Delete all voice cache entries
    const deletePromises = allVoiceKeys.map(async (entry) => {
      if (entry.key) {
        await kv.del(entry.key);
        return entry.key;
      }
      return null;
    });
    
    const deletedKeys = await Promise.all(deletePromises);
    const actualDeleted = deletedKeys.filter(key => key !== null);
    
    console.log(`✅ Cleared ${actualDeleted.length} voice cache entries`);
    
    return c.json({
      success: true,
      message: `Voice cache cleared - ${actualDeleted.length} entries removed`,
      deletedKeys: actualDeleted
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    return c.json({
      success: false,
      error: String(error)
    }, 500);
  }
});

// Voice system info endpoint
app.get("/make-server-7da483db/voice-info", async (c) => {
  try {
    // Force use correct API key - environment variable corrupted
    const elevenLabsKey = 'sk_4b4619eabfc05a446bc092f1168537ec70e986243f16404a';
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    console.log('🔧 Using hardcoded ElevenLabs API key (env var corrupted)');
    
    console.log('🔍 Environment variable check:', {
      elevenlabs: elevenLabsKey ? `Present (${elevenLabsKey.length} chars, starts with: ${elevenLabsKey.substring(0, 8)})` : 'Missing',
      openai: openAIKey ? `Present (${openAIKey.length} chars)` : 'Missing'
    });
    
    const hasElevenLabs = !!elevenLabsKey;
    const hasOpenAI = !!openAIKey;
    
    return c.json({
      available: hasElevenLabs || hasOpenAI,
      services: {
        elevenlabs: hasElevenLabs,
        openai: hasOpenAI
      },
      debug: {
        elevenLabsKeyLength: elevenLabsKey?.length || 0,
        elevenLabsKeyPrefix: elevenLabsKey?.substring(0, 8) || 'none',
        openAIKeyLength: openAIKey?.length || 0,
        allEnvVars: Object.keys(Deno.env.toObject()).filter(key => key.includes('API') || key.includes('KEY'))
      },
      characters: ['narrator', 'girl', 'mother', 'wolf', 'grandmother'],
      emotions: ['happy', 'sad', 'excited', 'calm', 'mysterious', 'scared', 'angry', 'loving']
    });
  } catch (error) {
    console.error('Voice info error:', error);
    return c.json({ 
      available: false, 
      error: String(error) 
    }, 500);
  }
});

// 🎤 Voicemaker API Proxy - CORS FIX
app.post("/make-server-7da483db/voicemaker-generate", async (c) => {
  try {
    const { text, voice, speed, volume } = await c.req.json();
    
    console.log('🎤 Voicemaker API request:', { text, voice, speed, volume });
    
    if (!text) {
      return c.json({ 
        success: false, 
        error: "Text is required" 
      }, 400);
    }

    // CORRECT API KEY - Use the working key directly
    const voicemakerApiKey = '761d3520-9314-11f0-ad63-b50fb444db5e';
    
    console.log('🔑 Using CORRECT Voicemaker API key:', voicemakerApiKey.substring(0, 10) + '...');
    console.log('🔑 API Key length:', voicemakerApiKey.length);

    // Cache key for this request
    const cacheKey = `voicemaker_${voice || 'emel'}_${speed || -20}_${text.substring(0, 50)}`;
    
    // Check cache first
    const cached = await kv.get(cacheKey);
    if (cached) {
      console.log('💾 Using cached Voicemaker audio');
      return c.json({
        success: true,
        path: cached,
        cached: true
      });
    }

    // Prepare request body
    const requestBody = {
      Engine: 'neural',
      VoiceId: voice || 'tr-TR-EmelNeural',
      OutputFormat: 'mp3',
      SampleRate: '22050',
      Text: text,
      TextType: 'text',
      SpeechRate: speed || -20,
      Volume: volume || 5,
      SentenceBreak: 500,
      ParagraphBreak: 1000
    };

    console.log('📤 Sending request to Voicemaker API...');
    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));

    // Call Voicemaker API
    const response = await fetch('https://developer.voicemaker.in/voice/api/v2/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${voicemakerApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('📥 Voicemaker API response status:', response.status);
    console.log('📥 Voicemaker API response:', responseText);

    if (!response.ok) {
      console.error('🚨 Voicemaker API error:', response.status, responseText);
      return c.json({ 
        success: false, 
        error: `Voicemaker API error: ${response.status} - ${responseText}`,
        requestSent: requestBody,
        apiKeyUsed: voicemakerApiKey.substring(0, 12)
      }, response.status);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('🚨 Failed to parse Voicemaker response:', parseError);
      return c.json({ 
        success: false, 
        error: `Invalid JSON response from Voicemaker: ${responseText}` 
      }, 500);
    }

    if (data.success && data.path) {
      // Cache the result
      await kv.set(cacheKey, data.path);
      console.log('✅ Voicemaker audio generated and cached:', data.path);
      
      return c.json({
        success: true,
        path: data.path,
        cached: false
      });
    } else {
      console.error('🚨 Voicemaker API returned invalid data:', data);
      return c.json({ 
        success: false, 
        error: `Voicemaker API returned invalid data: ${JSON.stringify(data)}`,
        rawResponse: responseText
      }, 500);
    }

  } catch (error) {
    console.error('💥 Voicemaker API proxy error:', error);
    return c.json({ 
      success: false, 
      error: `Server error: ${error}`,
      errorDetails: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// 🧪 Test Voicemaker API endpoint
app.post("/make-server-7da483db/voicemaker-test", async (c) => {
  try {
    console.log('🧪 Testing Voicemaker API...');
    
    // CORRECT API KEY - Use the provided working key
    const voicemakerApiKey = '761d3520-9314-11f0-ad63-b50fb444db5e';
    
    console.log('🔑 Using CORRECT Voicemaker API key:', voicemakerApiKey.substring(0, 10) + '...');
    console.log('🔑 API Key length:', voicemakerApiKey.length);

    if (!voicemakerApiKey) {
      return c.json({ 
        success: false, 
        error: "Voicemaker API key not configured" 
      });
    }

    // Test with simple text
    const testRequest = {
      Engine: 'neural',
      VoiceId: 'tr-TR-EmelNeural',
      OutputFormat: 'mp3',
      SampleRate: '22050',
      Text: 'test',
      TextType: 'text',
      SpeechRate: -20,
      Volume: 5
    };

    console.log('📤 Making test request to Voicemaker API...');
    console.log('📋 Request body:', JSON.stringify(testRequest, null, 2));

    const response = await fetch('https://developer.voicemaker.in/voice/api/v2/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${voicemakerApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testRequest)
    });

    const responseText = await response.text();
    console.log('📥 Voicemaker API response status:', response.status);
    console.log('📥 Voicemaker API response text:', responseText);
    
    return c.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      response: responseText,
      apiKeyLength: voicemakerApiKey.length,
      apiKeyPrefix: voicemakerApiKey.substring(0, 12),
      requestSent: testRequest
    });

  } catch (error) {
    console.error('💥 Voicemaker test error:', error);
    return c.json({ 
      success: false, 
      error: `Test error: ${error}`,
      errorDetails: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

Deno.serve(app.fetch);