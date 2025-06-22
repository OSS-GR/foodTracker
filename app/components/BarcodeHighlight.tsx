import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface BarcodeBounds { 
    origin: { x: number, y: number }, 
    size: {width: number, height: number}
}



const BarcodeHighlight : React.FC<BarcodeBounds> = (bounds) => {
    return (
        <View
            style={[
                styles.highlight,
                {
                    left: bounds.origin.x,
                    top: bounds.origin.y,
                    width: bounds.size.width,
                    height: bounds.size.height,
                },
            ]}
            pointerEvents="none"
        />
    );
}

const styles = StyleSheet.create({
    highlight: {
                position: 'absolute',
                borderColor: 'lime',
                borderWidth: 3,
                borderRadius: 8,
                zIndex: 10,
    },
});


export default BarcodeHighlight;

