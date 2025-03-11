precision mediump float;

uniform sampler2D uTexture;
uniform float uThreshold;
uniform vec3 uBackgroundColor; // Background color
uniform vec3 uForegroundColor; // Foreground color
varying vec2 vUv;

// Hash function for blue noise
vec3 hash33(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p.zxy, p.yxz + 19.19);
    return fract(vec3(p.x * p.y, p.y * p.z, p.z * p.x));
}

// Blue noise function
float blueNoise(vec2 coord) {
    vec3 p = vec3(coord, fract(1.0 + uThreshold * 0.1));
    vec3 noise = hash33(p);
    return (noise.x + noise.y + noise.z) / 3.0;
}

void main() {
    vec3 color = texture2D(uTexture, vUv).rgb;
    float gray = dot(color, vec3(0.3, 0.59, 0.11)); // Convert to grayscale
    
    // Get blue noise value
    float noise = blueNoise(gl_FragCoord.xy);
    
    // Apply blue noise dithering with threshold adjustment
    // The threshold adjustment makes the dithering more or less intense
    float adjustedThreshold = mix(0.0, 1.0, uThreshold);
    float dithered = step(noise * adjustedThreshold, gray);
    
    // Mix between background color and foreground color based on dithered value
    vec3 finalColor = mix(uBackgroundColor, uForegroundColor, dithered);
    
    gl_FragColor = vec4(finalColor, 1.0);
} 