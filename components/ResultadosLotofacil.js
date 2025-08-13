import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';

const ResultadosLotofacil = () => {
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://loteriascaixa-api.herokuapp.com/api/lotofacil');
      setResultados(response.data[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Buscando os resultados da Lotofácil...</Text>
      </View>
    );
  }
  
  if (!resultados) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Não foi possível carregar os resultados.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Últimos Resultados da Lotofácil</Text>
        <TouchableOpacity style={styles.botaoAtualizar} onPress={fetchData}>
          <Text style={styles.textoBotao}>Atualizar Resultados</Text>
        </TouchableOpacity>    
        <Text style={styles.subtitulo}>Concurso: {resultados.concurso}</Text>
        <Text style={styles.subtitulo}>Data: {resultados.data}</Text>
        <Text style={styles.numeros}>Números Sorteados:</Text>
        <View style={styles.numerosContainer}>
          {resultados.dezenas.map((dezena) => (
            <View key={dezena} style={styles.dezena}>
              <Text style={styles.dezenaText}>{dezena}</Text>
            </View>
          ))}
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
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#004a80',
  },
  subtitulo: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  numeros: {
    fontSize: 18,
    marginTop: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  numerosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  dezena: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3000b3ff',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  dezenaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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

export default ResultadosLotofacil;