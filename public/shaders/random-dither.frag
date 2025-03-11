precision mediump float;

uniform sampler2D uTexture;
uniform float uThreshold; // Dithering intensity
uniform vec3 uBackgroundColor; // Background color
uniform vec3 uForegroundColor; // Foreground color
uniform float uContrast; // Contrast adjustment
uniform float uMidtones; // Midtones adjustment
uniform float uHighlights; // Highlights adjustment
varying vec2 vUv;

// Simple pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Apply contrast, midtones, and highlights adjustments to grayscale value
float adjustTone(float gray) {
    // Apply contrast (centered around 0.5)
    float contrastAdjusted = (gray - 0.5) * uContrast + 0.5;
    
    // Apply midtones adjustment (sigmoid curve)
    float midPoint = uMidtones;
    float midtonesAdjusted = contrastAdjusted < midPoint 
        ? contrastAdjusted * (contrastAdjusted / midPoint) 
        : 1.0 - (1.0 - contrastAdjusted) * ((1.0 - contrastAdjusted) / (1.0 - midPoint));
    
    // Apply highlights adjustment
    float highlightsAdjusted = midtonesAdjusted < 0.5 
        ? midtonesAdjusted 
        : 0.5 + (midtonesAdjusted - 0.5) * uHighlights;
    
    // Clamp to valid range
    return clamp(highlightsAdjusted, 0.0, 1.0);
}

void main() {
    vec3 color = texture2D(uTexture, vUv).rgb;
    float gray = dot(color, vec3(0.3, 0.59, 0.11)); // Convert to grayscale
    
    // Apply tone adjustments
    gray = adjustTone(gray);
    
    // Generate random threshold
    float threshold = random(gl_FragCoord.xy);
    
    // Apply dithering
    float dithered = step(threshold + (1.0 - uThreshold), gray);
    
    // Mix between background color and foreground color based on dithered value
    vec3 finalColor = mix(uBackgroundColor, uForegroundColor, dithered);
    
    gl_FragColor = vec4(finalColor, 1.0);
}