import { StyleSheet } from "react-native";
import { SIZES, COLORS } from "../theme";


export const biometricStyles = StyleSheet.create({
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        width: '80%',
      },
      dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
      },
      dividerText: {
        marginHorizontal: 10,
        color: '#888',
      },
      secondaryButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
      },
      secondaryButtonText: {
        color: '#333',
        fontWeight: '600',
      },
      textLink: {
        marginTop: 12,
        padding: 5,
      },
      biometricButton: {
        backgroundColor: COLORS.primaryDark,
        borderRadius: 25,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '70%',
        height: 120,
      },
      biometricText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
      },
      orText: {
        fontSize: 16,
        color: '#888',
        marginVertical: 15,
      },
      logo: {
        width: 150,
        height: 100,
        marginBottom: 20,
      },

    });