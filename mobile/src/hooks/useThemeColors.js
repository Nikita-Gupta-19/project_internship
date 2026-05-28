import { useColorScheme } from 'react-native';
import { light, dark } from '../constants/colors';

export default function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
