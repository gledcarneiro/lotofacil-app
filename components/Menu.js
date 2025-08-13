import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Menu = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.menuContainer, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('GerenciadorDeJogos')}>
        <Text style={styles.menuText}>Gerenciar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('ResultadosLotofacil')}>
        <Text style={styles.menuText}>Resultados</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('ConferirJogos')}>
        <Text style={styles.menuText}>Conferir</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#004a80',
    borderTopWidth: 1,
    borderColor: '#eee',
    // removemos a altura fixa (height: 60)
    paddingVertical: 10, // Adicionamos padding para dar mais espaço vertical
    width: '100%',
  },
  menuButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Menu;