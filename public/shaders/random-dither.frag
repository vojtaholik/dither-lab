precision mediump float;

uniform sampler2D uTexture;
uniform float uThreshold;
uniform vec3 uBackgroundColor; // Background color
uniform vec3 uForegroundColor; // Foreground color
varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec3 color = texture2D(uTexture, vUv).rgb;
    float gray = dot(color, vec3(0.3, 0.59, 0.11)); // Convert to grayscale

    // Apply random noise
    float noise = random(gl_FragCoord.xy) * uThreshold;
    float dithered = step(noise, gray);
    
    // Mix between background color and foreground color based on dithered value
    vec3 finalColor = mix(uBackgroundColor, uForegroundColor, dithered);
    
    gl_FragColor = vec4(finalColor, 1.0);
}