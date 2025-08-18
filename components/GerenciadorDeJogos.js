import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Componente para um número individual
const NumeroBola = ({ numero, selecionado, onPress }) => (
  <TouchableOpacity
    style={[styles.bola, selecionado ? styles.bolaSelecionada : styles.bolaNaoSelecionada]}
    onPress={() => onPress(numero)}
  >
    <Text style={styles.numeroTexto}>{numero}</Text>
  </TouchableOpacity>
);

// Função auxiliar para formatar números com zero à esquerda
const formatNumero = (num) => (num < 10 ? `0${num}` : `${num}`);

// Componente principal do Gerenciador de Jogos
const GerenciadorDeJogos = () => {
  const [numerosSelecionados, setNumerosSelecionados] = useState([]);
  const [jogosSalvos, setJogosSalvos] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');
  const [itemParaApagar, setItemParaApagar] = useState(null);

  // Chave de armazenamento no AsyncStorage
  const STORAGE_KEY = 'jogosLotofacil';

  // Efeito para carregar os jogos salvos ao iniciar o componente
  useEffect(() => {
    carregarJogosSalvos();
  }, []);

  // Função para carregar os jogos do armazenamento local
  const carregarJogosSalvos = async () => {
    try {
      const jsonJogos = await AsyncStorage.getItem(STORAGE_KEY);
      const jogos = jsonJogos != null ? JSON.parse(jsonJogos) : [];
      setJogosSalvos(jogos);
    } catch (e) {
      console.error("Erro ao carregar jogos salvos", e);
    }
  };

  // Função para salvar um novo jogo
  const salvarJogo = async () => {
    if (numerosSelecionados.length !== 15) {
      Alert.alert(
        "Atenção",
        `Selecione exatamente 15 números. Você selecionou ${numerosSelecionados.length}.`,
        [{ text: "OK" }]
      );
      return;
    }

    const novoJogo = {
      id: Date.now(),
      numeros: [...numerosSelecionados].sort((a, b) => a - b),
      data: new Date().toLocaleString()
    };
    
    // Atualiza a lista de jogos de forma segura, garantindo que o novo jogo seja adicionado
    // Este método é mais robusto para evitar race conditions no estado
    setJogosSalvos(prevJogos => {
        const jogosAtualizados = [...prevJogos, novoJogo];
        try {
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(jogosAtualizados));
        } catch (e) {
            console.error("Erro ao salvar jogo", e);
        }
        return jogosAtualizados;
    });

    setNumerosSelecionados([]);
    Alert.alert("Sucesso", `Jogo salvo com sucesso!`, [{ text: "OK" }]);
  };

  // Função para lidar com a seleção de números
  const handleSelecionarNumero = (numero) => {
    setNumerosSelecionados(prevNumeros => {
      if (prevNumeros.includes(numero)) {
        return prevNumeros.filter(n => n !== numero);
      } else if (prevNumeros.length < 15) {
        return [...prevNumeros, numero];
      }
      return prevNumeros;
    });
  };

  // Função para apagar um jogo individual
  const apagarJogo = async (idDoJogo) => {
    try {
      const jogosFiltrados = jogosSalvos.filter(jogo => jogo.id !== idDoJogo);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(jogosFiltrados));
      setJogosSalvos(jogosFiltrados);
      setModalVisivel(false);
    } catch (e) {
      console.error("Erro ao apagar jogo", e);
    }
  };

  // Nova função para usar um jogo como modelo
  const usarComoModelo = (jogo) => {
      setNumerosSelecionados(jogo.numeros);
  };

  // Função para apagar todos os jogos salvos
  const apagarTodosOsJogos = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setJogosSalvos([]);
      setModalVisivel(false);
      Alert.alert("Sucesso", "Todos os jogos foram apagados!", [{ text: "OK" }]);
    } catch (e) {
      console.error("Erro ao apagar jogos", e);
    }
  };
  
  // Função para gerar um jogo aleatório
  const gerarJogoAleatorio = () => {
      setNumerosSelecionados([]); // Limpa a seleção atual
      let numeros = new Set();
      while (numeros.size < 15) {
          numeros.add(Math.floor(Math.random() * 25) + 1);
      }
      setNumerosSelecionados([...numeros]);
  };

  // Funções para lidar com o modal de confirmação
  const handleApagarJogo = (idDoJogo) => {
    setItemParaApagar(idDoJogo);
    setMensagemModal("Tem certeza que deseja apagar este jogo?");
    setModalVisivel(true);
  };
  
  const handleApagarTodosOsJogos = () => {
    setItemParaApagar('all');
    setMensagemModal("Tem certeza que deseja apagar todos os jogos salvos?");
    setModalVisivel(true);
  };

  const handleConfirmarExclusao = () => {
    if (itemParaApagar === 'all') {
      apagarTodosOsJogos();
    } else {
      apagarJogo(itemParaApagar);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Selecione seus Números</Text>
      
      {/* Exibe o contador de números selecionados */}
      <Text style={styles.contador}>
        {numerosSelecionados.length} / 15
      </Text>

      {/* Grade de seleção de números */}
      <View style={styles.grid}>
        {Array.from({ length: 25 }, (_, i) => i + 1).map(numero => (
          <NumeroBola
            key={numero}
            numero={numero}
            selecionado={numerosSelecionados.includes(numero)}
            onPress={handleSelecionarNumero}
          />
        ))}
      </View>

      {/* Botões de Ação */}
      <View style={styles.botoesContainer}>
        <TouchableOpacity style={[styles.botao, styles.botaoLimpar]} onPress={() => setNumerosSelecionados([])}>
            <Text style={styles.textoBotao}>Limpar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.botao, styles.botaoSalvar]} onPress={salvarJogo}>
          <Text style={styles.textoBotao}>Salvar Jogo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.botao, styles.botaoAleatorio]} onPress={gerarJogoAleatorio}>
          <Text style={styles.textoBotao}>Surpresinha</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de jogos salvos */}
      <Text style={styles.subtitulo}>Meus Jogos Salvos</Text>
      {jogosSalvos.length > 0 ? (
        <View style={styles.jogosSalvosContainer}>
          {/* Mapeia a lista de jogos salvos em ordem reversa para mostrar os mais novos primeiro */}
          {jogosSalvos.slice().reverse().map((jogo) => (
            <View key={jogo.id} style={styles.jogoSalvoCard}>
              {/* Números do jogo na primeira linha, sem quebra */}
              <Text style={styles.jogoSalvoTexto}>
                {jogo.numeros.map(formatNumero).join(', ')}
              </Text>
              
              {/* Informações e botões na segunda linha */}
              <View style={styles.jogoSalvoInfoBotoesContainer}>
                <Text style={styles.jogoSalvoData}>Salvo em: {jogo.data}</Text>
                <View style={styles.jogoSalvoBotoes}>
                  <TouchableOpacity onPress={() => usarComoModelo(jogo)} style={[styles.jogoBotao, styles.botaoUsarModelo]}>
                    <Text style={styles.jogoBotaoTexto}>Usar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleApagarJogo(jogo.id)} style={[styles.jogoBotao, styles.botaoExcluir]}>
                    <Text style={styles.jogoBotaoTexto}>Apagar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.botaoApagarTodos} onPress={handleApagarTodosOsJogos}>
            <Text style={styles.textoBotao}>Apagar Todos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.nenhumJogoTexto}>Nenhum jogo salvo ainda.</Text>
      )}

      {/* Modal de Confirmação */}
      {modalVisivel && (
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{mensagemModal}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setModalVisivel(false)}>
                <Text style={styles.modalButtonText}>Não</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={handleConfirmarExclusao}>
                <Text style={styles.modalButtonText}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  contador: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 320, // Limita o tamanho máximo do grid para telas maiores
  },
  bola: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3, // Margem ajustada para caber 5 bolas por linha
    borderWidth: 2,
    borderColor: '#ddd',
  },
  bolaNaoSelecionada: {
    backgroundColor: '#FFFFFF',
  },
  bolaSelecionada: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  numeroTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  botao: { // Estilo base para todos os botões
    flex: 1, // Faz com que ocupe o espaço disponível
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoSalvar: {
    backgroundColor: '#2196F3',
  },
  botaoLimpar: {
    backgroundColor: '#F44336',
  },
  botaoAleatorio: {
    backgroundColor: '#FFC107',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14, // Fonte um pouco menor para caber no espaço
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  jogoSalvoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'column', // Alterado para 'column' para empilhar os elementos
    alignItems: 'flex-start', // Alinha os itens à esquerda
  },
  jogoSalvoInfoBotoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10, // Adiciona espaço entre os números e a linha de info/botões
  },
  jogoSalvoTexto: {
    fontSize: 14, 
    color: '#555',
    fontWeight: 'bold', 
  },
  jogoSalvoData: {
    fontSize: 12,
    color: '#999',
  },
  jogoSalvoBotoes: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  jogoBotao: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10, 
  },
  botaoUsarModelo: {
    width: 60, // Largura fixa para deixar os botões com o mesmo tamanho
    alignItems: 'center', // Centraliza o texto
    backgroundColor: '#2196F3',
  },
  botaoExcluir: {
    width: 60, // Largura fixa para deixar os botões com o mesmo tamanho
    alignItems: 'center', // Centraliza o texto
    backgroundColor: '#F44336',
  },
  jogoBotaoTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  nenhumJogoTexto: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  botaoApagarTodos: {
    backgroundColor: '#757575',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Estilos do Modal de Confirmação
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  modalMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalButtonConfirm: {
    backgroundColor: '#F44336',
  },
  modalButtonCancel: {
    backgroundColor: '#757575',
  },
});

export default GerenciadorDeJogos;
