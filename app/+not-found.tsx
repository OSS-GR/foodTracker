import { Image } from 'expo-image';
import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

const PlaceholderImage = require('../assets/images/404-funny.jpg');

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{title: "Oops! Page Not Found"}} />
            <View style={styles.container}>
                <Link href="/" style={styles.button}>
                    Oops! Not the page you were hoping for?
                    Go back to the Home Screen
                </Link>
                <Image
                    source={PlaceholderImage}
                    style={styles.image}
                />
            </View>
        </>
    ) 
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#25292e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        fontSize: 20,
        textDecorationLine: "underline",
        color: 'red',
        marginBottom: 20,
        zIndex: 2
    },
    image: {
        width: '50%',
        height: '50%',
        zIndex: 1,
        borderRadius: 18,
    }
});