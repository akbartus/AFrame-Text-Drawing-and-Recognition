/*
Copyright (c) 2020 Marlon Lückert

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
AFRAME.registerComponent('texture-painter', {
    schema: {
        color: {
            type: "color",
            default: "black"
        },       
        size: {
            type: "int",
            default: 20
        },
        background: {
            type: "color",
            default: "white"
        },
        clearAll: {
            type: "boolean",
            default: false
        }
    },
    init: function () {       
        this.color = this.data.color;        
        this.size = this.data.size;
        this.background = this.data.background;
        this.el.sceneEl.addEventListener('camera-set-active', this.cameraSetActive.bind(this));
        this.el.sceneEl.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
        this.el.sceneEl.addEventListener( 'touchmove', this.onMouseMove.bind(this), false );
        this.el.sceneEl.addEventListener( 'mouseup', this.onMouseUp.bind(this), false );
        this.el.sceneEl.addEventListener( 'touchend', this.onMouseUp.bind(this), false );
        this.el.sceneEl.addEventListener( 'mousedown', this.onMouseDown.bind(this), false );
        this.el.sceneEl.addEventListener( 'touchstart', this.onMouseDown.bind(this), false );

        this.el.addEventListener('raycaster-intersected', evt => {
            this.raycasterObj = evt.detail.el;
        });

        this.el.addEventListener('raycaster-intersected-cleared', evt => {
            this.lastX = null;
            this.lastY = null;
            this.raycasterObj = null;
        });

        var controllers = document.querySelectorAll(".controller");
        controllers.forEach((controller) => {
            controller.addEventListener('triggerdown', evt => {
                this.triggerdown = true;
            });
            controller.addEventListener('triggerup', evt => {
                this.triggerdown = false;
            });
        })
        

        var planeTexture = new THREE.Texture( undefined, THREE.UVMapping, THREE.MirroredRepeatWrapping, THREE.MirroredRepeatWrapping );
        var planeMaterial = new THREE.MeshPhongMaterial( { map: planeTexture, shininess: 50 } );
        this.mesh = this.el.getObject3D('mesh');
        this.mesh.material = planeMaterial;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.onClickPosition = new THREE.Vector2();
        this.renderer = this.el.sceneEl.renderer;
        this.parentTexture = planeTexture;
        this._parentTexture = [];
        this._canvas = document.createElement( "canvas" );
        this._canvas.width = 1500;
        this._canvas.height = 1000;
        this._context2D = this._canvas.getContext( "2d" );
        this.parentTexture.image = this._canvas;
        // draw background
        this._context2D.fillStyle = this.background;
        this._context2D.fillRect(0, 0, this._canvas.width, this._canvas.height); 
        this.parentTexture.needsUpdate = true;
},
    
    drawRemote: function(remoteDrawObject) {
        if (remoteDrawObject.lastX != null && remoteDrawObject.lastY != null) {            
            this._context2D.beginPath();
            this._context2D.strokeStyle = remoteDrawObject.color;
         
            this._context2D.lineJoin = 'round';
            this._context2D.lineWidth = remoteDrawObject.size;
            this._context2D.moveTo(remoteDrawObject.lastX, remoteDrawObject.lastY);
            this._context2D.lineTo(remoteDrawObject.x, remoteDrawObject.y);
            this._context2D.closePath();
            this._context2D.stroke();            
            this.parentTexture.needsUpdate = true;
        }
    },
    eraseAllRemote: function() {
        this._context2D.fillStyle = this.background;
        this._context2D.fillRect(0, 0, this._canvas.width, this._canvas.height); 
        this.parentTexture.needsUpdate = true;
    },
    update: function() {
        this.color = this.data.color;    
        this.size = this.data.size;
        if (this.data.clearAll) {
            this.eraseAll();
        }
   
        
    },
    tick: function () {
        if (!this.raycasterObj) { return; }  // Not intersecting.    
        let intersection = this.raycasterObj.components.raycaster.getIntersection(this.el);
        if (!intersection) { return; }
        if (this.triggerdown) {
            var uv = intersection.uv;
            var x = uv.x;
            var y = 1 - uv.y;
            this._draw( x * this._canvas.width, y * this._canvas.height);
            this.lastX = x * this._canvas.width;
            this.lastY = y * this._canvas.height;
        } else {
            this.lastX = null;
            this.lastY = null;
        }
    },
    cameraSetActive: function() {
        this.camera = this.el.sceneEl.camera;
    },
    disableLookControls: function() {
        if (this.camera.el) {
            this.camera.el.setAttribute('look-controls', {
                enabled: false
            })
        }
    },
    enableLookControls: function() {
        if (this.camera.el) {
            this.camera.el.setAttribute('look-controls', {
                enabled: true
            })
        }
    },
    eraseAll: function () {       
        this.eraseAllRemote();
    },
    _draw: function (x, y) {
        if (this.lastX != null && this.lastY != null) {
            var drawObject= {};         
            drawObject.lastX = this.lastX;
            drawObject.lastY = this.lastY;
            drawObject.x = x;
            drawObject.y = y;
            drawObject.color = this.color;
            drawObject.size = this.size;
            this.drawRemote(drawObject);
            this.lastX = x;
            this.lastY = y;
        }
    },

    onMouseMove: function ( evt ) {
        evt.preventDefault();
        var array = this.getMousePosition( this.renderer.domElement, evt.clientX || evt.touches[0].clientX, evt.clientY || evt.touches[0].clientY );
        this.onClickPosition.fromArray( array );
        var intersects = this.getIntersects( this.onClickPosition, [this.el.getObject3D('mesh')] );
        if ( intersects.length > 0 && intersects[ 0 ].uv ) {
            var uv = intersects[ 0 ].uv;
            intersects[ 0 ].object.material.map.transformUv( uv );
            this._draw( uv.x * this._canvas.width, uv.y * this._canvas.height);
        }
    },
    onMouseDown: function(evt) {
        //evt.preventDefault();
        var array = this.getMousePosition( this.renderer.domElement, evt.clientX || evt.touches[0].clientX, evt.clientY || evt.touches[0].clientY );
        this.onClickPosition.fromArray( array );
        var intersects = this.getIntersects( this.onClickPosition, [this.el.getObject3D('mesh')] );
        if ( intersects.length > 0 && intersects[ 0 ].uv ) {
            this.disableLookControls();
            var uv = intersects[ 0 ].uv;
            intersects[ 0 ].object.material.map.transformUv( uv );
            this.lastX = uv.x * this._canvas.width;
            this.lastY = uv.y * this._canvas.height;
        }
    },
    onMouseUp: function (evt) {
        //evt.preventDefault();
        this.lastX = null;
        this.lastY = null;
        this.enableLookControls();
    },

    getMousePosition: function ( dom, x, y ) {
        var rect = this.renderer.domElement.getBoundingClientRect();
        return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

    },
    getIntersects: function ( point, objects ) {
        this.mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );
        this.raycaster.setFromCamera( this.mouse, this.camera );
        return this.raycaster.intersectObjects( objects );
    }
  });
