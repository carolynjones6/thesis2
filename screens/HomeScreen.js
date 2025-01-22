import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Simultaneous Translation</Text>
    <Button title="Interpreter" onPress={() => navigation.navigate('Interpreter')} />
    <Button title="Listener" onPress={() => navigation.navigate('Listener')} style={styles.button} />
  </View>
);

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
  button: {
    marginTop: 10,
  },
});

export default HomeScreen;
