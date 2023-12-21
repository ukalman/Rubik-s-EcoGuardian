uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float u_scale;

attribute vec3 position;

varying vec3 v_position;

void main() {
   vec3 copy_position = position;
   copy_position.y *=u_scale+1.0/sin(copy_position.z*10.0) * (1.0-u_scale);
   copy_position.x *=u_scale+1.0/cos(copy_position.y*10.0) * (1.0-u_scale);
   copy_position.z *=u_scale+1.0/sin(copy_position.x*10.0) * (1.0-u_scale);

   copy_position *=u_scale;

   vec4 modelPosition = modelMatrix * vec4(copy_position,1.0);
   vec4 viewPosition = viewMatrix * modelPosition;
   vec4 projectionPosition = projectionMatrix * viewPosition;

   gl_Position = projectionPosition;
   gl_PointSize = 1.75;

   v_position = position;
}
