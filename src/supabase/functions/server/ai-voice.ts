/**
 * 🎭 AI VOICE API HANDLER - ELEVENLABS PREMIUM EDITION
 * The most advanced voice synthesis system for children's storytelling
 * Utilizing ElevenLabs' full potential for immersive story experiences
 */

export async function handleAIVoiceGeneration(
  text: string,
  character: string,
  emotion: string,
  model: 'openai' | 'elevenlabs' = 'elevenlabs',
  retryCount: number = 0
): Promise<{ audioUrl: string; success: boolean; error?: string; usedFallback?: boolean }> {
  const maxRetries = 3;
  
  try {
    if (model === 'elevenlabs') {
      return await generateElevenLabsVoiceWithFallback(text, character, emotion, retryCount);
    } else {
      return await generateOpenAIVoice(text, character, emotion);
    }
  } catch (error) {
    console.error('🚨 AI Voice generation failed:', error);
    
    // Check if this is a 429 error (rate limit/system busy)
    const errorMessage = String(error);
    if (errorMessage.includes('429') || errorMessage.includes('system_busy') || errorMessage.includes('Too Many Requests')) {
      console.log('🔄 ElevenLabs API busy - trying fallback strategies...');
      
      // Try OpenAI as fallback
      try {
        console.log('🚀 Switching to OpenAI fallback...');
        const fallbackResult = await generateOpenAIVoice(text, character, emotion);
        return {
          ...fallbackResult,
          usedFallback: true
        };
      } catch (fallbackError) {
        console.error('🚨 OpenAI fallback also failed:', fallbackError);
        
        // If both APIs fail, return browser synthesis instructions
        return {
          audioUrl: 'BROWSER_SYNTHESIS',
          success: true,
          usedFallback: true,
          error: 'API temporarily unavailable - using browser synthesis'
        };
      }
    }
    
    return {
      audioUrl: '',
      success: false,
      error: String(error)
    };
  }
}

// Enhanced ElevenLabs with retry logic and exponential backoff
async function generateElevenLabsVoiceWithFallback(
  text: string,
  character: string,
  emotion: string,
  retryCount: number = 0
): Promise<{ audioUrl: string; success: boolean; usedFallback?: boolean }> {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second base delay
  
  try {
    return await generateElevenLabsVoice(text, character, emotion);
  } catch (error) {
    const errorMessage = String(error);
    
    // Handle 429 specifically
    if (errorMessage.includes('429') || errorMessage.includes('system_busy')) {
      console.log(`🔄 ElevenLabs API busy (attempt ${retryCount + 1}/${maxRetries})`);
      
      if (retryCount < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, retryCount);
        console.log(`⏱️ Waiting ${delay}ms before retry...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return await generateElevenLabsVoiceWithFallback(text, character, emotion, retryCount + 1);
      } else {
        console.log('🚀 Max retries reached - switching to OpenAI...');
        throw new Error('ElevenLabs API repeatedly busy - switching to fallback');
      }
    }
    
    // For other errors, throw immediately
    throw error;
  }
}

// 🎭 ELEVENLABS PREMIUM VOICE GENERATION - FULL POWER MODE
async function generateElevenLabsVoice(
  text: string, 
  character: string, 
  emotion: string
): Promise<{ audioUrl: string; success: boolean }> {
  const apiKey = 'sk_4b4619eabfc05a446bc092f1168537ec70e986243f16404a';
  console.log('🚀 ElevenLabs PREMIUM MODE - Full feature set activated!');
  
  if (!apiKey || !apiKey.startsWith('sk_')) {
    throw new Error('ElevenLabs API key invalid or missing');
  }

  // 🎭 PREMIUM CHARACTER VOICE LIBRARY - Professional Studio Quality
  const voiceIds = {
    // 📖 PROFESSIONAL STORYTELLERS
    narrator: 'pNInz6obpgDQGcFmaJgB',      // Adam - Warm, professional storyteller
    narrator_female: 'EXAVITQu4vr4xnSDxMaL', // Bella - Female narrator
    
    // 👧👦 AUTHENTIC CHILDREN VOICES  
    girl: 'ThT5KcBeYPX3keUQqHPh',          // Dorothy - Sweet young girl
    boy: 'onwK4e9ZLuTAKqWW03F9',           // Daniel - Energetic boy
    child_excited: 'AZnzlk1XvdvUeBnXmlld', // Domi - Excited child
    
    // 👩 NURTURING ADULT VOICES
    mother: 'pNInz6obpgDQGcFmaJgB',        // Caring mother
    teacher: 'EXAVITQu4vr4xnSDxMaL',      // Kind teacher
    fairy: 'ThT5KcBeYPX3keUQqHPh',        // Magical fairy godmother
    
    // 🐺 DRAMATIC CHARACTER VOICES  
    wolf: 'onwK4e9ZLuTAKqWW03F9',         // Deep, dramatic wolf
    giant: 'pNInz6obpgDQGcFmaJgB',        // Booming giant
    witch: 'AZnzlk1XvdvUeBnXmlld',        // Mysterious witch
    dragon: 'onwK4e9ZLuTAKqWW03F9',       // Powerful dragon
    
    // 👵 WISE ELDERLY VOICES
    grandmother: 'AZnzlk1XvdvUeBnXmlld',  // Sweet grandmother
    wizard: 'pNInz6obpgDQGcFmaJgB',       // Wise wizard
    
    // 🤴 ROYAL CHARACTER VOICES
    king: 'onwK4e9ZLuTAKqWW03F9',         // Majestic king
    queen: 'ThT5KcBeYPX3keUQqHPh',       // Elegant queen  
    prince: 'pNInz6obpgDQGcFmaJgB',       // Charming prince
    princess: 'EXAVITQu4vr4xnSDxMaL',    // Beautiful princess
    
    // 🐻 EXPRESSIVE ANIMAL VOICES
    bear: 'onwK4e9ZLuTAKqWW03F9',         // Deep bear
    rabbit: 'EXAVITQu4vr4xnSDxMaL',      // Quick rabbit
    owl: 'AZnzlk1XvdvUeBnXmlld',         // Wise owl
    mouse: 'ThT5KcBeYPX3keUQqHPh',       // Tiny mouse
    
    // 🎪 FUN CHARACTER VOICES
    clown: 'EXAVITQu4vr4xnSDxMaL',       // Funny clown
    pirate: 'onwK4e9ZLuTAKqWW03F9',      // Adventurous pirate
    robot: 'pNInz6obpgDQGcFmaJgB',       // Friendly robot
    alien: 'AZnzlk1XvdvUeBnXmlld'        // Curious alien
  };

  // 🎭 NATURAL VOICE SETTINGS - FLUENT & CONVERSATIONAL
  const emotionSettings = {
    // 😊 HAPPINESS - NATURAL & LIVELY
    happy: { 
      stability: 0.82, similarity_boost: 0.88, style: 0.45,
      speaker_boost: false, use_speaker_boost: false
    },
    excited: { 
      stability: 0.75, similarity_boost: 0.85, style: 0.55,
      speaker_boost: false, use_speaker_boost: false
    },
    playful: { 
      stability: 0.78, similarity_boost: 0.86, style: 0.5,
      speaker_boost: false, use_speaker_boost: false
    },
    cheerful: { 
      stability: 0.82, similarity_boost: 0.88, style: 0.45,
      speaker_boost: false, use_speaker_boost: false
    },
    
    // 😢 SADNESS
    sad: { 
      stability: 0.85, similarity_boost: 0.9, style: 0.3,
      speaker_boost: false, use_speaker_boost: false
    },
    melancholy: { 
      stability: 0.9, similarity_boost: 0.95, style: 0.25,
      speaker_boost: false, use_speaker_boost: false
    },
    crying: { 
      stability: 0.8, similarity_boost: 0.9, style: 0.35,
      speaker_boost: false, use_speaker_boost: false
    },
    
    // 😰 FEAR
    scared: { 
      stability: 0.75, similarity_boost: 0.85, style: 0.4,
      speaker_boost: false, use_speaker_boost: false
    },
    terrified: { 
      stability: 0.7, similarity_boost: 0.8, style: 0.5,
      speaker_boost: false, use_speaker_boost: false
    },
    nervous: { 
      stability: 0.75, similarity_boost: 0.85, style: 0.4,
      speaker_boost: false, use_speaker_boost: false
    },
    
    // 😡 ANGER
    angry: { 
      stability: 0.7, similarity_boost: 0.8, style: 0.5,
      speaker_boost: false, use_speaker_boost: false
    },
    furious: { 
      stability: 0.6, similarity_boost: 0.75, style: 0.6,
      speaker_boost: false, use_speaker_boost: false
    },
    annoyed: { 
      stability: 0.75, similarity_boost: 0.85, style: 0.45,
      speaker_boost: false, use_speaker_boost: false
    },
    
    // 🥰 LOVE - WARM & NATURAL
    loving: { 
      stability: 0.85, similarity_boost: 0.9, style: 0.4,
      speaker_boost: false, use_speaker_boost: false
    },
    gentle: { 
      stability: 0.88, similarity_boost: 0.9, style: 0.35,
      speaker_boost: false, use_speaker_boost: false
    },
    tender: { 
      stability: 0.85, similarity_boost: 0.88, style: 0.4,
      speaker_boost: false, use_speaker_boost: false
    },
    
    // 🤔 MYSTERY
    mysterious: { 
      stability: 0.8, similarity_boost: 0.85, style: 0.4,
      speaker_boost: false, use_speaker_boost: false
    },
    suspenseful: { 
      stability: 0.75, similarity_boost: 0.8, style: 0.45,
      speaker_boost: false, use_speaker_boost: false
    },
    eerie: { 
      stability: 0.8, similarity_boost: 0.85, style: 0.4,
      speaker_boost: false, use_speaker_boost: false
    },
    
    // 😌 CALM - NATURAL & CONVERSATIONAL
    calm: { 
      stability: 0.85, similarity_boost: 0.9, style: 0.35,
      speaker_boost: false, use_speaker_boost: false
    },
    peaceful: { 
      stability: 0.88, similarity_boost: 0.9, style: 0.3,
      speaker_boost: false, use_speaker_boost: false
    },
    meditative: { 
      stability: 0.9, similarity_boost: 0.92, style: 0.25,
      speaker_boost: false, use_speaker_boost: false
    },
    
    // 😮 SURPRISE
    surprised: { 
      stability: 0.75, similarity_boost: 0.85, style: 0.4,
      speaker_boost: false, use_speaker_boost: false
    },
    amazed: { 
      stability: 0.75, similarity_boost: 0.85, style: 0.45,
      speaker_boost: false, use_speaker_boost: false
    },
    wonder: { 
      stability: 0.8, similarity_boost: 0.9, style: 0.4,
      speaker_boost: false, use_speaker_boost: false
    },
    
    // 🎭 DRAMATIC
    dramatic: { 
      stability: 0.7, similarity_boost: 0.8, style: 0.5,
      speaker_boost: false, use_speaker_boost: false
    },
    theatrical: { 
      stability: 0.65, similarity_boost: 0.75, style: 0.55,
      speaker_boost: false, use_speaker_boost: false
    },
    epic: { 
      stability: 0.75, similarity_boost: 0.85, style: 0.5,
      speaker_boost: false, use_speaker_boost: false
    }
  };

  const voiceId = voiceIds[character as keyof typeof voiceIds] || voiceIds.narrator;
  const settings = emotionSettings[emotion as keyof typeof emotionSettings] || emotionSettings.calm;

  // 🎭 Voice generation request
  console.log('🎭 Generating voice:', {
    character: character,
    emotion: emotion,
    textLength: text.length
  });

  // Clean text without any modifications
  const finalText = text.trim().replace(/\s+/g, ' ');

  // 🚀 ELEVENLABS API CALL - PREMIUM SETTINGS
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text: finalText,
      model_id: 'eleven_multilingual_v2', // Better Turkish support
      voice_settings: {
        stability: settings.stability,
        similarity_boost: settings.similarity_boost,
        style: settings.style,
        use_speaker_boost: settings.use_speaker_boost || false
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🚨 ElevenLabs API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  // 🎵 CONVERT TO BASE64 FOR FRONTEND
  const audioBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(audioBuffer);
  
  console.log('✅ ElevenLabs voice generated successfully:', {
    character: character,
    emotion: emotion,
    audioSize: `${Math.round(audioBuffer.byteLength / 1024)}KB`
  });
  
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  const audioBase64 = btoa(binary);
  const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

  return {
    audioUrl,
    success: true
  };
}

// 🚫 REMOVED - NO TEXT PROCESSING FUNCTIONS 
// This function was adding unwanted text modifications

// OpenAI Voice Generation (Fallback)
async function generateOpenAIVoice(
  text: string,
  character: string,
  emotion: string
): Promise<{ audioUrl: string; success: boolean }> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const voiceIds = {
    narrator: 'alloy',
    girl: 'nova',
    mother: 'shimmer',
    wolf: 'onyx',
    grandmother: 'echo'
  };

  const voiceId = voiceIds[character as keyof typeof voiceIds] || voiceIds.narrator;
  const finalText = text.trim().replace(/\s+/g, ' ');

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input: finalText,
      voice: voiceId,
      response_format: 'mp3',
      speed: getSpeedForEmotion(emotion)
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(audioBuffer);
  
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  const audioBase64 = btoa(binary);
  const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

  return {
    audioUrl,
    success: true
  };
}

// 🎵 NATURAL SPEED CONTROL
function getSpeedForEmotion(emotion: string): number {
  const speedMap = {
    happy: 1.0,
    excited: 1.05,
    scared: 0.98,
    angry: 1.0,
    sad: 0.95,
    calm: 1.0,        // ✅ NORMAL SPEED - NOT SLOW!
    mysterious: 0.98,
    loving: 1.0,      // ✅ NORMAL SPEED - NOT SLOW!
    gentle: 1.0,      // ✅ NORMAL SPEED - NOT SLOW!
    dramatic: 0.95,
    epic: 0.95
  };

  return speedMap[emotion as keyof typeof speedMap] || 1.0;
}