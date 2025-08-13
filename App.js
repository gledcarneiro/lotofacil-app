import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GerenciadorDeJogos from './components/GerenciadorDeJogos';
import ResultadosLotofacil from './components/ResultadosLotofacil';
import ConferirJogos from './components/ConferirJogos';
import Menu from './components/Menu';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={styles.appContainer}>
          <Stack.Navigator initialRouteName="GerenciadorDeJogos">
            <Stack.Screen 
              name="GerenciadorDeJogos" 
              component={GerenciadorDeJogos}
              options={{ title: 'Gerenciar Jogos' }}
            />
            <Stack.Screen 
              name="ResultadosLotofacil" 
              component={ResultadosLotofacil} 
              options={{ title: 'Últimos Resultados' }}
            />
            <Stack.Screen 
              name="ConferirJogos" 
              component={ConferirJogos}
              options={{ title: 'Conferir Jogos' }}
            />
          </Stack.Navigator>
          <Menu />
          <StatusBar style="auto" />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});