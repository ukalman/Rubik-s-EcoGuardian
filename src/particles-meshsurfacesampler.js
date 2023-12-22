gltfLoader.load("/models/1.glb", (glb) => {
    //increasing the number of vertices
    const samplerMesh = new MeshSurfaceSampler(glb.scene.children[0]).build();
    const particlesNumber = 25000;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesArray = new Float32Array(particlesNumber * 3);
    for (let i = 0; i < particlesNumber; i++) {
      const particlePosition = new THREE.Vector3();
      samplerMesh.sample(particlePosition);
      particlesArray.set(
        [particlePosition.x, particlePosition.y, particlePosition.z],
        i * 3
      );
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlesArray, 3)
    );
  
    //changing model into particles
    glb.scene.children[0] = new THREE.Points(
      particlesGeometry,
      new THREE.RawShaderMaterial({
        vertexShader: vShader,
        fragmentShader: fShader,
        uniforms: {
          u_color_1: { value: new THREE.Color(`${firstModelColor1}`) },
          u_color_2: { value: new THREE.Color(`${firstModelColor2}`) },
          u_scale: { value: 0 },
        },
        depthTest: false,
        blending: THREE.AdditiveBlending,
      })
    );
  
    glb.scene.children[0].scale.set(0.7, 0.7, 0.7);
    glb.scene.children[0].position.x = 0.5;
    glb.scene.children[0].rotation.y = Math.PI * 0.5;
    modelArray[0] = glb.scene;
  });