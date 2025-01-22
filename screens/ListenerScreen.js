import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';

const SERVER_URL = 'ws://127.0.0.1:8080'; // Replace with your server's IP if needed

const ListenerScreen = () => {
  const [socket, setSocket] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState([]);
  const [playing, setPlaying] = useState(false);

  const connectToServer = () => {
    const newSocket = new WebSocket(SERVER_URL);
    newSocket.onopen = () => {
      console.log('Connected to server as Listener');
      setSocket(newSocket);
    };
    newSocket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'audio-stream') {
        setAudioBuffer((prev) => [...prev, data.chunk]);
      }
    };
    newSocket.onerror = (error) => {
      Alert.alert('Error', `Connection failed: ${error.message}`);
    };
  };

  const playBufferedAudio = async () => {
    if (audioBuffer.length === 0) {
      Alert.alert('Error', 'No audio to play.');
      return;
    }

    const audioChunk = audioBuffer.shift();
    setAudioBuffer(audioBuffer);

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioChunk });
      await sound.playAsync();
      setPlaying(false);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listener Screen</Text>
      <Button title="Connect to Server" onPress={connectToServer} disabled={!!socket} />
      <Button title="Play Audio" onPress={playBufferedAudio} disabled={!audioBuffer.length} />
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

export default ListenerScreen;
