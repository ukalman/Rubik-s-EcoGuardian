precision mediump float;

uniform vec3 u_color_1;
uniform vec3 u_color_2;


varying vec3 v_position;

void main() {
    vec3 mix_colors = mix(u_color_1,u_color_2,v_position.z);
    gl_FragColor = vec4(mix_colors,1.0);
}