"use strict";

const OPTIONS =
{
    Rotating: false,
    Isometric_View: true,
}

{
    const mat4 = glMatrix.mat4;

    let gl = myWebGL.glSetup(document.querySelector('canvas'));

    /**
     * *********************************************
     *     ---= Create Shaders & Program =---
     * *********************************************
     */

    // Vertex Shader
    const vertexShaderSourceCode = 
    `    
    precision mediump float;
            
    // an attribute will receive data from a buffer
    attribute vec4 position;
    attribute vec4 color;

    varying vec4 vColor;

    uniform mat4 GLSLmatrix;
   
    // all shaders have a main function
    void main() {
       
        vColor = color;

        // gl_Position is a special variable a vertex shader is responsible for setting
        gl_Position = GLSLmatrix * position;
    }

    `

    // Fragment Shader
    const fragmentShaderSourceCode =
    `

    // set precision
    precision mediump float;

    varying vec4 vColor;
   
    void main() {
      
      // gl_FragColor is a special variable a fragment shader is responsible for setting
      gl_FragColor = vColor;
    }
   
    `
    // create program
    const program = myWebGL.createProgramFromSource(gl, vertexShaderSourceCode, fragmentShaderSourceCode);

    /**
     * *********************************************
     * ---= Buffers, Data, Attribute Locations =---
     * *********************************************
     */

    const vertexData = myWebGLData.vertexCube01;
      
    const faceColors = [
        [0.2,  0.2,  0.2,  1.0],    // Front face: grey
        [1.0,  0.0,  0.0,  1.0],    // Back face: red
        [0.0,  1.0,  0.0,  1.0],    // Top face: green
        [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
        [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
        [1.0,  0.0,  1.0,  1.0],    // Left face: purple
    ];

    // Convert the array of colors into a table for all the vertices.

    let colorData = [];

    for (var j = 0; j < faceColors.length; ++j)
    {
        const c = faceColors[j];

        // Repeat each color four times for the four vertices of the face
        colorData = colorData.concat(c, c, c, c);
    }
    
    const indices = myWebGLData.indexCube01;

    // get attribute location
    const positionAttribLocation = gl.getAttribLocation(program, "position");
    const colorAttribLocation = gl.getAttribLocation(program, "color");

    // create & bind buffer, load data into buffer

    // positionBuffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    // colorBuffer
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    // create the buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Matrix & Transformations
    const myMatrix = mat4.create(); // create identity matrix

    // transformations are done in reverse order of code
    mat4.scale(myMatrix, myMatrix, [0.2, 0.2, 0.2]);

    if (OPTIONS.Isometric_View)
    {
        mat4.rotateZ(myMatrix, myMatrix, Math.PI/2 /2);
        mat4.rotateY(myMatrix, myMatrix, Math.PI/2 /2);
        mat4.rotateX(myMatrix, myMatrix, Math.PI/2 /2);            
    }

    const uniformLocations =
    {
        matrix: gl.getUniformLocation(program, "GLSLmatrix"),
        
    };

    render();

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    function render()
    {
        // Animate
        requestAnimationFrame(render); // parameter is name of function it's in

        /*
        *   [Resizing Canvas code would go here]
        */

        // Map clipboard coords to canvas size
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Execute WebGL Program
        gl.useProgram(program);

        // attrib pointer vars
        let vSize = 3;          // 3 components per iteration
        let cSize = 4;          // 4 components per iteration
        let type = gl.FLOAT;   // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer

        // position
        // Enable Attributes
        gl.enableVertexAttribArray(positionAttribLocation);
        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); 
        // bind the buffer containing the indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        gl.vertexAttribPointer(
            positionAttribLocation, vSize, type, normalize, stride, offset);

        // color
        gl.enableVertexAttribArray(colorAttribLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(
            colorAttribLocation, 4, type, normalize, stride, offset);

        // Matrix Locations
        if (OPTIONS.Rotating)
        {
            mat4.rotateZ(myMatrix, myMatrix, Math.PI/2 /90);
            mat4.rotateX(myMatrix, myMatrix, Math.PI/2 /70);    
        }

        gl.uniformMatrix4fv(uniformLocations.matrix, false, myMatrix);

        // Ask WebGL to execute GLSL program
        let primitiveType = gl.TRIANGLES;
        let drawOffset = 0;
        //var count = vertexData.length / 3;
        let count = 36 // 6 verticies per face * 6 faces
        let indexType = gl.UNSIGNED_SHORT;

        gl.enable(gl.DEPTH_TEST);
        //gl.enable(gl.CULL_FACE);

        gl.drawElements(primitiveType, count, indexType, drawOffset);
    };
}
