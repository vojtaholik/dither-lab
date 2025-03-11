precision mediump float;

uniform sampler2D uTexture;
uniform float uThreshold; // Dithering intensity
uniform vec3 uBackgroundColor; // Background color
uniform vec3 uForegroundColor; // Foreground color
uniform float uContrast; // Contrast adjustment
uniform float uMidtones; // Midtones adjustment
uniform float uHighlights; // Highlights adjustment
uniform float uDitherScale; // Dither pattern scale
varying vec2 vUv;

// Blue noise function (approximation using multiple hash functions)
float blueNoise(vec2 coord) {
    // Use multiple hash functions with different frequencies
    vec2 seed1 = coord * 0.01;
    vec2 seed2 = coord * 0.51;
    vec2 seed3 = coord * 1.73;
    
    // Hash functions with different weights
    float hash1 = fract(sin(dot(seed1, vec2(12.9898, 78.233))) * 43758.5453);
    float hash2 = fract(sin(dot(seed2, vec2(63.7264, 10.873))) * 51357.8642);
    float hash3 = fract(sin(dot(seed3, vec2(36.9572, 25.4645))) * 61268.9721);
    
    // Combine with different weights to approximate blue noise
    return (hash1 * 0.5 + hash2 * 0.3 + hash3 * 0.2);
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
    
    // Generate blue noise threshold with scaled coordinates
    float threshold = blueNoise(floor(gl_FragCoord.xy / uDitherScale));
    
    // Apply dithering
    float dithered = step(threshold + (1.0 - uThreshold), gray);
    
    // Mix between background color and foreground color based on dithered value
    vec3 finalColor = mix(uBackgroundColor, uForegroundColor, dithered);
    
    gl_FragColor = vec4(finalColor, 1.0);
} 