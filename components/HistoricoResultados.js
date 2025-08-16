import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função auxiliar para comparar um jogo salvo com o resultado do concurso
const compararJogos = (jogoSalvo, resultadoConcurso) => {
    // Garante que os números sorteados são do tipo 'Number'
    const numerosSorteados = new Set(resultadoConcurso.dezenas.map(Number));
    let acertos = 0;

    // Garante que os números do jogo salvo também são do tipo 'Number'
    jogoSalvo.forEach(numero => {
        if (numerosSorteados.has(Number(numero))) {
            acertos++;
        }
    });

    return acertos;
};

const HistoricoResultados = () => {
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Função para carregar os jogos do AsyncStorage
        const carregarJogosSalvos = async () => {
            try {
                const jsonJogos = await AsyncStorage.getItem('lotofacil-jogos');
                const jogos = jsonJogos != null ? JSON.parse(jsonJogos) : [];
                setJogosSalvos(jogos);
            } catch (e) {
                console.error("Erro ao carregar jogos salvos", e);
            }
        };
        // Função para buscar os resultados da API
        const fetchResultados = async () => {
            try {
                // Aqui faremos a chamada para a API
                // Por enquanto, usaremos dados fictícios para a estrutura
                // URL para a API da Lotofácil (resultado mais recente)
                const API_URL = 'https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest';

                // Chamada real à API para obter o resultado
                const response = await axios.get(API_URL);
                const resultadoAtual = response.data;

                // Vamos buscar mais alguns resultados para ter uma lista maior
                const historico = [];
                for (let i = 0; i < 5; i++) {
                    try {
                        const concursoAnterior = resultadoAtual.concurso - i;
                        const urlHistorico = `https://loteriascaixa-api.herokuapp.com/api/lotofacil/${concursoAnterior}`;
                        const res = await axios.get(urlHistorico);
                        historico.push(res.data);
                    } catch (error) {
                        console.error("Erro ao buscar resultado:", error);
                        // Continue mesmo que um resultado falhe
                    }
                }
                setResultados(historico);
            } catch (error) {
                console.error("Erro ao buscar resultados:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResultados();
    }, []);

    // Função para renderizar cada item da lista
    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}            
                onPress={async () => {
                console.log("Botão clicado! Tentando carregar jogos...");
                let jogosSalvos = [];
                try {
                    const jsonJogos = await AsyncStorage.getItem('jogosLotofacil');
                    console.log("JSON de jogos retornado:", jsonJogos); // <-- ADICIONE ESTA LINHA
                    jogosSalvos = jsonJogos != null ? JSON.parse(jsonJogos) : [];
                } catch (e) {
                    console.error("Erro ao carregar jogos salvos", e);
                }

                if (jogosSalvos.length === 0) {
                    alert('Nenhum jogo salvo para conferir.');
                    return;
                }

                const resultadosConferencia = jogosSalvos.map((jogo, index) => {
                    const acertos = compararJogos(jogo.numeros, item);
                    return { id: index, jogo, acertos };
                });

                let mensagem = `Concurso ${item.concurso}:\n`;
                resultadosConferencia.forEach(res => {
                    mensagem += `Jogo ${res.id + 1}: ${res.acertos} acertos\n`;
                });
                console.log(mensagem);
                alert(mensagem);
            }}
        >
            <Text style={styles.concurso}>Concurso {item.concurso}</Text>
            <Text style={styles.data}>Data: {item.data}</Text>
            <View style={styles.dezenasContainer}>
                {item.dezenas.map((dezena, index) => (
                    <View key={index} style={styles.bola}>
                        <Text style={styles.dezenaText}>{dezena}</Text>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return <Text style={styles.loading}>Carregando histórico...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Histórico de Resultados</Text>
            <FlatList
                data={resultados}
                renderItem={renderItem}
                keyExtractor={item => item.concurso.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f0f2f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    loading: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 18,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    concurso: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4285F4',
    },
    data: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    dezenasContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    bola: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: '#009966',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 4,
    },
    dezenaText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default HistoricoResultados;