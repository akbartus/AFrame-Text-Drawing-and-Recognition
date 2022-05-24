var myButton = document.querySelector("#recognize"),
    myButton2 = document.querySelector("#erase"),
    plane = document.querySelector("#drawingArea"),
    showImage = document.querySelector("#showImage");
    recognizedTxt = document.querySelector("#recognizedText");

// Get texure
myButton.addEventListener("click", function () {
    var mesh3D = plane.getObject3D('mesh');
    // Get canvas texture and convert to dataURL
    var texture = mesh3D.material.map.image.toDataURL();
    recognizeText(texture);

})

// Erase drawn
myButton2.addEventListener("click", function () {
    plane.setAttribute("texture-painter", "clearAll: true");
    plane.setAttribute("texture-painter", "clearAll: false");
})

// Recognize drawn text using Microsoft’s TrOCR served over HuggingFace
function recognizeText(recognized) {
    fetch('https://hf.space/embed/nielsr/TrOCR-handwritten/+/api/predict/', {
        method: "POST",
        body: JSON.stringify({
            "data": [recognized]
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (response) {
        return response.json();
    }).then(function (json_response) {
        var recognizedText = json_response.data[0].replaceAll(/[0-9]/g, "").replaceAll('.', '');
        recognizedTxt.setAttribute("text", "value", recognizedText);
        console.log(recognizedText);
        generateImage(recognizedText);
    })
}

// Generate Image based on text
function generateImage(text) {
    fetch('https://hf.space/embed/smangrul/Text-To-Image/+/api/predict/', {
        method: "POST",
        body: JSON.stringify({
            "data": [text]
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (response) {
        return response.json();
    }).then(function (received) {
        showImage.setAttribute("visible", true);
        showImage.setAttribute("material", "src", received.data[0]);

    })
}