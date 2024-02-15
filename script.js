let mediaRecorder;
let audioChunks = [];

function updateButtons(recording, paused) {
    document.getElementById("startRecord").disabled = recording;
    document.getElementById("stopRecord").disabled = !recording;
    document.getElementById("pauseRecord").disabled = !recording || paused;
    document.getElementById("resumeRecord").disabled = !recording || !paused;
    document.getElementById("upload").disabled = recording || !audioChunks.length;
    document.getElementById("recordingStatus").style.visibility = recording ? 'visible' : 'hidden';
}

document.getElementById("startRecord").onclick = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play(); // Optional: Play the recorded audio for the user
                audioChunks = []; // Clear the chunks array
            };
            mediaRecorder.start();
            updateButtons(true, false);
        });
};

document.getElementById("stopRecord").onclick = () => {
    mediaRecorder.stop();
    updateButtons(false, false);
};

document.getElementById("pauseRecord").onclick = () => {
    mediaRecorder.pause();
    updateButtons(true, true);
};

document.getElementById("resumeRecord").onclick = () => {
    mediaRecorder.resume();
    updateButtons(true, false);
};

document.getElementById("upload").onclick = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audioFile', audioBlob, 'recording.wav');
    
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log(data); // Handle the server response here
    })
    .catch(error => {
        console.error('Error:', error);
    });
};
