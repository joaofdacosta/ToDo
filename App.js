import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SectionList,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  LogBox,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { MaterialIcons } from '@expo/vector-icons';
import EmojiPicker from 'react-native-emoji-chooser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Suprimir avisos internos da lib de emoji conforme pedido no enunciado
LogBox.ignoreLogs(['DeviceEventEmitter', 'Animated: `useNativeDriver`']);

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✅');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const loadedRef = useRef(false);

  // CARREGAR TAREFAS
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('tasks');
        if (savedTasks !== null) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error('Failed to load tasks.', error);
      } finally {
        loadedRef.current = true;
      }
    };
    loadTasks();
  }, []);

  // SALVAR TAREFAS
  useEffect(() => {
    if (!loadedRef.current) return;
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks.', error);
      }
    };
    saveTasks();
  }, [tasks]);

  const closeModal = () => {
    setTaskName('');
    setTaskCategory('');
    setSelectedEmoji('✅');
    setShowEmojiPicker(false);
    setModalVisible(false);
  };

  const handleAddTask = () => {
    if (taskName.trim() === '') return;
    const newTask = {
      id: Date.now().toString(),
      name: taskName,
      emoji: selectedEmoji,
      category: taskCategory,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    closeModal();
  };

  const toggleTaskCompletion = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getFormattedDate = () => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date().toLocaleDateString('pt-BR', options);
  };

  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const sections = [
    { title: 'Incompletas', data: incompleteTasks },
    { title: 'Realizadas', data: completedTasks },
  ];

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <Checkbox
        value={item.completed}
        onValueChange={() => toggleTaskCompletion(item.id)}
        color={item.completed ? '#6200ee' : undefined}
        style={styles.checkbox}
      />
      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskName, item.completed && styles.taskNameCompleted]}>
          {item.emoji} {item.name}
        </Text>
        {!item.completed && <Text style={styles.taskCategory}>{item.category}</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{getFormattedDate()}</Text>
        <Text style={styles.subTitle}>
          {incompleteTasks.length} incompletas, {completedTasks.length} realizadas
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        style={styles.list}
        stickySectionHeadersEnabled={false}
      />

      {/* FAB - Botão Flutuante */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalLabel}>Tarefa</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome da tarefa"
                value={taskName}
                onChangeText={setTaskName}
              />

              <View style={styles.modalRow}>
                <View style={{ width: '25%' }}>
                  <Text style={styles.modalLabel}>Emoji</Text>
                  <TouchableOpacity
                    style={styles.emojiButton}
                    onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Text style={{ fontSize: 24 }}>{selectedEmoji}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ width: '70%' }}>
                  <Text style={styles.modalLabel}>Categoria</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Trabalho"
                    value={taskCategory}
                    onChangeText={setTaskCategory}
                  />
                </View>
              </View>

              {/* Botão de Criar sempre visível (flexShrink) */}
              <TouchableOpacity 
                style={[styles.addButton, { flexShrink: 1 }]} 
                onPress={handleAddTask}
              >
                <Text style={styles.addButtonText}>Criar</Text>
              </TouchableOpacity>

              {/* Emoji Picker com altura fixa para o scroll funcionar */}
              {showEmojiPicker && (
                <View style={styles.emojiPickerWrapper}>
                  <EmojiPicker
                    onEmojiSelected={(emoji) => {
                      setSelectedEmoji(emoji.emoji);
                      setShowEmojiPicker(false);
                    }}
                  />
                </View>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 20 },
  dateText: { color: '#000', fontSize: 32, fontWeight: 'bold' },
  subTitle: { color: '#666', fontSize: 16, marginTop: 5 },
  sectionTitle: { color: '#554d73', fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
  list: { flex: 1 },
  taskItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  checkbox: { borderRadius: 5, marginRight: 15 },
  taskTextContainer: { flex: 1 },
  taskName: { color: '#444', fontSize: 18, fontWeight: '500' },
  taskNameCompleted: { textDecorationLine: 'line-through', color: '#AAA' },
  taskCategory: { color: '#AAA', fontSize: 13 },
  fab: { 
    position: 'absolute', 
    right: 25, 
    bottom: 40, 
    backgroundColor: '#6200ee', 
    width: 65, 
    height: 65, 
    borderRadius: 32.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.2)' },
  keyboardView: { width: '100%' },
  modalContent: {
    backgroundColor: '#F3F3F3',
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 350,
  },
  modalLabel: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  input: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  emojiButton: {
    backgroundColor: '#FFF',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  addButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  emojiPickerWrapper: {
    height: 250,
    marginTop: 15,
  },
});