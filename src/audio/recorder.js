// Universal Cross-Platform Audio Recorder (iOS Safari, Android Chrome, Mac, Windows, AirPods, USB mics)

export class RealAudioRecorder {
  constructor() {
    this.stream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.isRecording = false;
    this.mimeType = '';
  }

  // Get best supported audio format for the current device
  getBestMimeType() {
    const candidateTypes = [
      'audio/mp4',
      'audio/aac',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    for (const type of candidateTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("L'accès au microphone n'est pas disponible sur ce navigateur.");
    }

    this.audioChunks = [];
    
    // Request highest compatibility audio stream from any input device (AirPods, internal mic, USB headset)
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true
      }
    });

    // Real-time frequency analyzer for visual feedback
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 128;
      this.source.connect(this.analyser);
    } catch (e) {
      console.warn("AudioContext analyzer setup:", e);
    }

    this.mimeType = this.getBestMimeType();
    const options = this.mimeType ? { mimeType: this.mimeType } : {};

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(this.stream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // chunk every 100ms
    this.isRecording = true;
  }

  getFrequencyData() {
    if (!this.analyser) return null;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          const type = this.mimeType || (this.audioChunks[0] ? this.audioChunks[0].type : 'audio/mp4');
          const audioBlob = new Blob(this.audioChunks, { type: type || 'audio/mp4' });
          const blobUrl = URL.createObjectURL(audioBlob);

          // Convert to Base64 data URI for reliable saving in localStorage
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Data = reader.result;

            // Clean up hardware streams
            if (this.stream) {
              this.stream.getTracks().forEach(track => track.stop());
            }
            if (this.audioContext && this.audioContext.state !== 'closed') {
              try { this.audioContext.close(); } catch(e){}
            }

            this.isRecording = false;
            resolve({
              blob: audioBlob,
              blobUrl: blobUrl,
              base64: base64Data,
              mimeType: type
            });
          };
          reader.onerror = (err) => reject(err);
        } catch (err) {
          reject(err);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  cancel() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch(e){}
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch(e){}
    }
    this.isRecording = false;
  }
}
