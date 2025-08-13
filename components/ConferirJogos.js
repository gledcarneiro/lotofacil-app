import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConferirJogos = () => {
  const [resultados, setResultados] = useState(null);
  const [jogosSalvos, setJogosSalvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apiResponse, jogosResponse] = await Promise.all([
        axios.get('https://loteriascaixa-api.herokuapp.com/api/lotofacil'),
        AsyncStorage.getItem('jogosLotofacil'),
      ]);

      setResultados(apiResponse.data[0]);
      setJogosSalvos(jogosResponse ? JSON.parse(jogosResponse) : []);
    } catch (err) {
      setError("Não foi possível carregar os dados. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const conferirAcertos = (numerosDoJogo, dezenasSorteadas) => {
    if (!dezenasSorteadas) return 0;
    const dezenasSorteadasNumeros = dezenasSorteadas.map(d => parseInt(d));
    const acertos = numerosDoJogo.filter(numero => dezenasSorteadasNumeros.includes(numero)).length;
    return acertos;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Carregando resultados e seus jogos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const dezenasSorteadas = resultados ? resultados.dezenas : [];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Conferir Jogos</Text>
        <TouchableOpacity style={styles.botaoAtualizar} onPress={fetchData}>
          <Text style={styles.textoBotao}>Atualizar Conferência</Text>
        </TouchableOpacity>
        
        {resultados && (
          <View style={styles.secao}>
            <Text style={styles.subtitulo}>Último Concurso: {resultados.concurso}</Text>
            <View style={styles.dezenasSorteadasContainer}>
              {dezenasSorteadas.map((dezena, index) => (
                <View key={index} style={styles.dezena}>
                  <Text style={styles.dezenaText}>{dezena}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.secao}>
          <Text style={styles.subtitulo}>Meus Jogos Salvos</Text>
          {jogosSalvos.length > 0 ? (
            jogosSalvos.map((jogo) => {
                const acertos = conferirAcertos(jogo.numeros, dezenasSorteadas);
                return (
                    <View key={jogo.id} style={styles.jogoItem}>
                        <View style={styles.jogoNumerosContainer}>
                            {jogo.numeros.map(numero => (
                                <Text
                                  key={numero}
                                  style={[
                                    styles.numeroDoJogo,
                                    dezenasSorteadas.includes(String(numero)) && styles.numeroAcertado,
                                  ]}
                                >
                                    {numero}
                                </Text>
                            ))}
                        </View>
                        <Text style={styles.jogoAcertos}>Acertos: {acertos}</Text>
                    </View>
                );
            })
          ) : (
            <Text style={styles.textoInfo}>Nenhum jogo salvo ainda.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  secao: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dezenasSorteadasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  dezena: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066b3',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  dezenaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  jogoItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  jogoNumerosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  numeroDoJogo: {
    fontSize: 16,
    marginRight: 5,
    marginBottom: 5,
  },
  numeroAcertado: {
    fontWeight: 'bold',
    color: 'green',
  },
  jogoAcertos: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  textoInfo: {
    textAlign: 'center',
    color: '#999',
  },
  errorText: {
    color: 'red',
  },
  botaoAtualizar: {
    backgroundColor: '#0066b3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 20,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ConferirJogos;