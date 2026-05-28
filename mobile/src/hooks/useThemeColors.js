import { useColorScheme } from 'react-native';
import { light, dark } from '../constants/colors';
import { useSelector } from 'react-redux';
import { selectThemeMode } from '../store/slices/themeSlice';

export default function useThemeColors() {
  const scheme = useColorScheme();
  const themeMode = useSelector(selectThemeMode);
  
  const effectiveTheme = themeMode === 'system' ? scheme : themeMode;
  return effectiveTheme === 'dark' ? dark : light;
}
