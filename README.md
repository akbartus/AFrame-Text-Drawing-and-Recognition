# Text Drawing and Recognition in A-Frame
<img alt="Screenshot" src="img/screenshot.jpg" width="600">

### **Description / Rationale**
This is an exploratory project, which demonstrates the drawing and text recognition possibilities in web VR environment. Drawing part represents the reduced and slightly adapted version of Marlon Lückert's <a href="https://github.com/marlon360/whiteboard-vr">"Whiteboars VR"</a>. Text recognition part is made available through Microsoft’s TrOCR model, hosted on HuggingFace. Recognized text is turned into image through another AI model hosted on HuggingFace. 

### **Instructions**
To enable drawing component: 
1. Attach it to the head of your html file, for example: 
```
<script src="texture-painter-component.js"></script>
```
2. Attach attribute of "texture-painter" to a disired primitive, for example to plane: 
```
<a-plane texture-painter position="0 1.5 -4" rotation="0 0 0" width="5" height="4"></a-plane>
``` 

If necessary define the attribute parameters (color: color; background: color; size: numeric;  eraseAll: boolean), for example:
``` texture-painter="color: green; background: red; size: 15" ```
3. Make sure to make primitive "texture-painter" is applied is <b>clickable if used with VR</b> or <b>withouth if it is mobile or desktop</b>:
VR: 
```
<a-plane texture-painter class="clickable" position="0 1.5 -4" rotation="0 0 0" width="5" height="4"></a-plane>
```
Mobile: 
```
<a-plane texture-painter position="0 1.5 -4" rotation="0 0 0" width="5" height="4"></a-plane>
```
Text recoginition and image generation based on text is enabled through API endpoints. See them in the example code. 

### **Tech Stack**
The project is powered by AFrame and HuggingFace hosted API endpoints.

### **Demo**
To see the application at work: [Demo application](https://webvr-drawing.glitch.me/)
