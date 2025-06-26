import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { deleteAllDiaryKeys } from '../utils/storage';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
      <Link href="/about" style={styles.button}>
        Go to About Screen
      </Link>
      <TouchableOpacity onPress={deleteAllDiaryKeys} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>
          Reset Diary Storage
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: '#4CAF50',
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#d32f2f',
    borderRadius: 5,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
})