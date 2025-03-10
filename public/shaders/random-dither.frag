precision mediump float;

uniform sampler2D uTexture;
uniform float uThreshold;
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
    
    gl_FragColor = vec4(vec3(dithered), 1.0);
}