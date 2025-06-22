import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface CameraFlipButtonProps {
  onPress: () => void;
}

const CameraFlipButton: React.FC<CameraFlipButtonProps> = ({ onPress }) => (
  <TouchableOpacity style={{ flex: 1, alignSelf: 'flex-end', alignItems: 'center' }} onPress={onPress}>
    <Ionicons name={'camera-reverse-sharp'} color={'white'} style={{ position: 'absolute', top: 0, right: 10, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 50, padding: 10 }} size={24} />
  </TouchableOpacity>
);

export default CameraFlipButton;