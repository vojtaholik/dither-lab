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

// 8x8 Bayer threshold matrix as a 1D array
const float bayer[64] = float[64](
    0.0, 32.0,  8.0, 40.0,  2.0, 34.0, 10.0, 42.0,
    48.0, 16.0, 56.0, 24.0, 50.0, 18.0, 58.0, 26.0,
    12.0, 44.0,  4.0, 36.0, 14.0, 46.0,  6.0, 38.0,
    60.0, 28.0, 52.0, 20.0, 62.0, 30.0, 54.0, 22.0,
    3.0, 35.0, 11.0, 43.0,  1.0, 33.0,  9.0, 41.0,
    51.0, 19.0, 59.0, 27.0, 49.0, 17.0, 57.0, 25.0,
    15.0, 47.0,  7.0, 39.0, 13.0, 45.0,  5.0, 37.0,
    63.0, 31.0, 55.0, 23.0, 61.0, 29.0, 53.0, 21.0
);

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

    // Get screen coordinates for the Bayer matrix lookup, scaled by uDitherScale
    int x = int(mod(gl_FragCoord.x / uDitherScale, 8.0));
    int y = int(mod(gl_FragCoord.y / uDitherScale, 8.0));
    
    // Calculate 1D index from 2D coordinates
    int index = y * 8 + x;
    
    // Normalize the Bayer matrix value to [0, 1]
    float threshold = bayer[index] / 64.0;

    // Apply dithering
    float dithered = step(threshold + (1.0 - uThreshold), gray);
    
    // Mix between background color and foreground color based on dithered value
    // When dithered is 0, use background color; when dithered is 1, use foreground color
    vec3 finalColor = mix(uBackgroundColor, uForegroundColor, dithered);
    
    gl_FragColor = vec4(finalColor, 1.0);
}