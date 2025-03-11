precision mediump float;

uniform sampler2D uTexture;
uniform float uThreshold;
uniform vec3 uBackgroundColor; // Background color
uniform vec3 uForegroundColor; // Foreground color
varying vec2 vUv;

void main() {
    vec3 color = texture2D(uTexture, vUv).rgb;
    float gray = dot(color, vec3(0.3, 0.59, 0.11)); // Convert to grayscale
    
    // Halftone pattern parameters
    float dotSize = mix(3.0, 12.0, uThreshold); // Adjust dot size based on threshold
    vec2 center = floor(gl_FragCoord.xy / dotSize) * dotSize + (dotSize / 2.0);
    
    // Calculate distance from pixel to center of the current dot
    float dist = distance(gl_FragCoord.xy, center);
    
    // Calculate the radius of the dot based on the grayscale value
    // Darker areas get larger dots
    float radius = (1.0 - gray) * (dotSize * 0.5);
    
    // Apply halftone effect
    float dithered = 1.0 - step(radius, dist);
    
    // Mix between background color and foreground color based on dithered value
    vec3 finalColor = mix(uBackgroundColor, uForegroundColor, dithered);
    
    gl_FragColor = vec4(finalColor, 1.0);
} 