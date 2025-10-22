import { io } from 'socket.io-client';

class VideoCallManager {
  constructor() {
    this.socket = null;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.currentAppointmentId = null;
    this.isConnected = false;
    
    // WebRTC configuration
    this.rtcConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  // Initialize socket connection
  connect(userId, userType) {
    if (this.socket && this.socket.connected) {
      return;
    }

    this.socket = io('http://localhost:3001', {
      transports: ['websocket'],
      upgrade: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to video call server');
      this.isConnected = true;
      this.socket.emit('register-user', { userId, userType });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from video call server');
      this.isConnected = false;
    });

    this.setupSocketHandlers();
  }

  // Set up socket event handlers
  setupSocketHandlers() {
    // WebRTC signaling
    this.socket.on('webrtc-offer', async ({ offer }) => {
      if (!this.peerConnection) return;
      
      try {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        
        this.socket.emit('webrtc-answer', {
          appointmentId: this.currentAppointmentId,
          answer
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    this.socket.on('webrtc-answer', async ({ answer }) => {
      if (!this.peerConnection) return;
      
      try {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    this.socket.on('webrtc-ice-candidate', async ({ candidate }) => {
      if (!this.peerConnection) return;
      
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ice candidate:', error);
      }
    });

    this.socket.on('call-ended', () => {
      this.endCall();
    });
  }

  // Initialize WebRTC peer connection
  async initializePeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);

    // Handle incoming remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote stream');
      this.remoteStream = event.streams[0];
      if (this.onRemoteStreamReceived) {
        this.onRemoteStreamReceived(this.remoteStream);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('webrtc-ice-candidate', {
          appointmentId: this.currentAppointmentId,
          candidate: event.candidate
        });
      }
    };

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }
  }

  // Get user media (camera and microphone)
  async getUserMedia(video = true, audio = true) {
    try {
      console.log('🎥 Requesting media access:', { video, audio });
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported in this browser');
      }
      
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 640, height: 480 } : false,
        audio
      });
      
      console.log('✅ Media access granted');
      
      if (this.onLocalStreamReceived) {
        this.onLocalStreamReceived(this.localStream);
      }
      
      return this.localStream;
    } catch (error) {
      console.error('❌ Error accessing user media:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to access camera and microphone.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera and microphone access was denied. Please allow permissions in your browser settings and try again.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera or microphone found. Please check that your devices are connected and try again.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera or microphone is already in use by another application. Please close other apps and try again.';
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        errorMessage = 'Camera or microphone constraints not satisfied. Please try again.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Media devices not supported in this browser. Please use a modern browser.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Security error accessing media devices. Please ensure you are using HTTPS.';
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }

  // Doctor initiates a call
  async initiateCall(appointmentId, patientId, doctorId, doctorName) {
    this.currentAppointmentId = appointmentId;
    
    try {
      // Get user media first
      await this.getUserMedia();
      
      // Initialize peer connection
      await this.initializePeerConnection();
      
      // Emit call initiation
      this.socket.emit('initiate-video-call', {
        appointmentId,
        patientId,
        doctorId,
        doctorName
      });
      
      return true;
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    }
  }

  // Patient accepts a call
  async acceptCall(appointmentId) {
    this.currentAppointmentId = appointmentId;
    
    try {
      // Get user media
      await this.getUserMedia();
      
      // Initialize peer connection
      await this.initializePeerConnection();
      
      // Accept the call
      this.socket.emit('respond-to-call', {
        appointmentId,
        response: 'accept'
      });
      
      return true;
    } catch (error) {
      console.error('Error accepting call:', error);
      throw error;
    }
  }

  // Patient accepts a call with audio only
  async acceptCallAudioOnly(appointmentId) {
    this.currentAppointmentId = appointmentId;
    
    try {
      // Get audio-only media
      await this.getUserMedia(false, true); // video=false, audio=true
      
      // Initialize peer connection
      await this.initializePeerConnection();
      
      // Accept the call
      this.socket.emit('respond-to-call', {
        appointmentId,
        response: 'accept'
      });
      
      return true;
    } catch (error) {
      console.error('Error accepting audio-only call:', error);
      throw error;
    }
  }

  // Patient declines a call
  declineCall(appointmentId) {
    this.socket.emit('respond-to-call', {
      appointmentId,
      response: 'decline'
    });
  }

  // Start WebRTC offer (called after call is accepted)
  async createOffer() {
    if (!this.peerConnection) return;
    
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.socket.emit('webrtc-offer', {
        appointmentId: this.currentAppointmentId,
        offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  // End the current call
  endCall() {
    if (this.currentAppointmentId && this.socket) {
      this.socket.emit('end-call', {
        appointmentId: this.currentAppointmentId
      });
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.currentAppointmentId = null;

    if (this.onCallEnded) {
      this.onCallEnded();
    }
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle audio
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Check if connected
  isSocketConnected() {
    return this.socket && this.socket.connected;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  // Set callback functions
  setCallbacks({
    onLocalStreamReceived,
    onRemoteStreamReceived,
    onCallEnded,
    onIncomingCall,
    onCallAccepted,
    onCallDeclined,
    onCallFailed
  }) {
    this.onLocalStreamReceived = onLocalStreamReceived;
    this.onRemoteStreamReceived = onRemoteStreamReceived;
    this.onCallEnded = onCallEnded;

    if (this.socket) {
      this.socket.on('incoming-video-call', onIncomingCall);
      this.socket.on('call-accepted', onCallAccepted);
      this.socket.on('call-declined', onCallDeclined);
      this.socket.on('call-failed', onCallFailed);
    }
  }
}

export default VideoCallManager;