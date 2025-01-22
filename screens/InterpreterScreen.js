import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';

const SERVER_URL = 'ws://127.0.0.1:8080'; // Replace with your server's IP if needed

const InterpreterScreen = () => {
  const [recording, setRecording] = useState(null);
  const [socket, setSocket] = useState(null);
// added
  const connectToServer = () => {
    const newSocket = new WebSocket(SERVER_URL);
    newSocket.onopen = () => {
      console.log('Connected to server as Interpreter');
      setSocket(newSocket);
    };
    newSocket.onerror = (error) => {
      Alert.alert('Error', `Connection failed: ${error.message}`);
    };
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission required', 'Microphone access is needed to record audio.');
        return;
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      console.log('Recording started');

      recording.setOnRecordingStatusUpdate(async (status) => {
        if (status.isRecording && socket) {
          const audioChunk = await recording.getURI(); // Replace with logic for smaller chunks
          socket.send(JSON.stringify({ type: 'audio-stream', chunk: audioChunk }));
        }
      });
    } catch (error) {
      console.error('Error while starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        console.log('Recording stopped');
        setRecording(null);
      }
    } catch (error) {
      console.error('Error while stopping recording:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Interpreter Screen</Text>
      <Button title="Connect to Server" onPress={connectToServer} disabled={!!socket} />
      <Button title="Start Recording" onPress={startRecording} disabled={!socket || !!recording} />
      <Button title="Stop Recording" onPress={stopRecording} disabled={!recording} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default InterpreterScreen;
