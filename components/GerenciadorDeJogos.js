import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GerenciadorDeJogos = () => {
  const [numerosSelecionados, setNumerosSelecionados] = useState([]);
  const [jogosSalvos, setJogosSalvos] = useState([]);

  const carregarJogos = async () => {
    try {
      const jogosSalvosString = await AsyncStorage.getItem('jogosLotofacil');
      if (jogosSalvosString) {
        setJogosSalvos(JSON.parse(jogosSalvosString));
      }
    } catch (e) {
      console.error("Erro ao carregar os jogos:", e);
    }
  };

  useEffect(() => {
    carregarJogos();
  }, []);

  const toggleSelecao = (numero) => {
    const isSelecionado = numerosSelecionados.includes(numero);

    if (isSelecionado) {
      setNumerosSelecionados(numerosSelecionados.filter(n => n !== numero));
    } else if (numerosSelecionados.length < 15) {
      setNumerosSelecionados([...numerosSelecionados, numero]);
    }
  };

  const salvarJogo = async () => {
    if (numerosSelecionados.length !== 15) {
      Alert.alert('Atenção', 'Selecione exatamente 15 dezenas para salvar o jogo.');
      return;
    }

    try {
      const jogosSalvosString = await AsyncStorage.getItem('jogosLotofacil');
      const jogosExistentes = jogosSalvosString ? JSON.parse(jogosSalvosString) : [];
      
      const novoJogo = {
        id: new Date().getTime(),
        numeros: numerosSelecionados.sort((a, b) => a - b),
        data: new Date().toLocaleString(),
      };
      
      jogosExistentes.push(novoJogo);
      await AsyncStorage.setItem('jogosLotofacil', JSON.stringify(jogosExistentes));
      
      setJogosSalvos(jogosExistentes);
      Alert.alert('Sucesso', 'Jogo salvo com sucesso!');
      setNumerosSelecionados([]);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o jogo. Tente novamente.');
    }
  };

  const limparJogos = async () => {
    try {
      await AsyncStorage.removeItem('jogosLotofacil');
      setJogosSalvos([]);
      Alert.alert('Sucesso', 'Todos os jogos foram removidos.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível remover os jogos.');
    }
  };

  const dezenas = Array.from({ length: 25 }, (_, i) => i + 1);
  const limiteAtingido = numerosSelecionados.length === 15;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Selecione 15 Dezenas</Text>
        <View style={styles.dezenasContainer}>
          {dezenas.map(numero => (
            <TouchableOpacity
              key={numero}
              style={[
                styles.dezena,
                numerosSelecionados.includes(numero) && styles.dezenaSelecionada,
              ]}
              onPress={() => toggleSelecao(numero)}
            >
              <Text style={[styles.dezenaText, numerosSelecionados.includes(numero) && styles.dezenaTextSelecionada]}>
                {numero < 10 ? `0${numero}` : numero}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.contador, limiteAtingido && styles.contadorLimite]}>
          Dezenas selecionadas: {numerosSelecionados.length} de 15
        </Text>
        <TouchableOpacity 
          style={[styles.botaoSalvar, !limiteAtingido && styles.botaoSalvarDesabilitado]} 
          onPress={salvarJogo}
          disabled={!limiteAtingido}
        >
            
          <Text style={styles.textoBotao}>Salvar Jogo</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        style={styles.botaoLimpar} 
        onPress={limparJogos}
      >
        <Text style={styles.textoBotao}>Limpar Jogos</Text>
      </TouchableOpacity>
      </View>

      <View style={styles.listaContainer}>
        <Text style={styles.tituloLista}>Meus Jogos Salvos</Text>
        {jogosSalvos.length > 0 ? (
          jogosSalvos.map((jogo) => (
            <View key={jogo.id} style={styles.jogoSalvoItem}>
              <Text style={styles.jogoSalvoData}>{jogo.data}</Text>
              <Text style={styles.jogoSalvoNumeros}>{jogo.numeros.join(', ')}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.semJogosText}>Nenhum jogo salvo ainda.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
  },
  container: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ... (os estilos para titulo, dezenasContainer, dezena, etc. permanecem os mesmos)
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dezenasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dezena: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dezenaSelecionada: {
    backgroundColor: '#0066b3',
    borderColor: '#004a80',
  },
  dezenaText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dezenaTextSelecionada: {
    color: '#fff',
  },
  contador: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  contadorLimite: {
    color: 'green',
  },
  botaoSalvar: {
    marginTop: 20,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  botaoSalvarDesabilitado: {
    backgroundColor: '#ccc',
  },
  botaoLimpar: {
    marginTop: 10,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listaContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    width: '100%',
  },
  tituloLista: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  jogoSalvoItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  jogoSalvoData: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  jogoSalvoNumeros: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  semJogosText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  }
});

export default GerenciadorDeJogos;