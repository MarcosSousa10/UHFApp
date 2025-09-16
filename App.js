import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const { UHFModule } = NativeModules;
const emitter = new NativeEventEmitter(UHFModule);

export default function App() {
  const [logs, setLogs] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Desconectado');

  useEffect(() => {
    const subTag = emitter.addListener('UHF_Tag', tag => {
      console.log("📡 Tag recebida:", tag.epc, "| Decimal:", tag.epcDecimal);
      setLogs(l => [{ epc: tag.epc, id: Date.now() }, ...l]);
    });
    const subConn = emitter.addListener('UHF_Connection', s => {
      setConnectionStatus(s.status);
    });
    return () => {
      subTag.remove();
      subConn.remove();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const perms = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
      if (Platform.Version >= 31) {
        perms.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
        perms.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      }
      await PermissionsAndroid.requestMultiple(perms);
    }
  };

  const renderButton = (title, onPress, iconName, color = '#4CAF50') => (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
      <Icon name={iconName} size={20} color="#fff" style={{ marginRight: 8 }} />
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UHF Scanner</Text>
      <Text style={styles.status}>Status: {connectionStatus}</Text>

      {renderButton('Pedir Permissões', requestPermissions, 'shield-lock-outline', '#2196F3')}
      {renderButton('Conectar (MAC)', () => UHFModule.connect('EA:50:A6:7F:9C:D2'), 'bluetooth-connect', '#FF9800')}
      {renderButton('Iniciar Leitura', () => UHFModule.startInventory(), 'play-circle-outline', '#4CAF50')}
      {renderButton('Leitura Única', () => UHFModule.singleInventory(), 'cellphone-arrow-down', '#673AB7')}
      {renderButton('Parar Leitura', () => UHFModule.stopInventory(), 'stop-circle-outline', '#F44336')}

      <Text style={styles.logsTitle}>Logs:</Text>
      <FlatList
        data={logs}
        keyExtractor={(item, index) => `${item.id}-${index}`} // concatena index
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Icon name="tag-outline" size={16} color="#333" style={{ marginRight: 6 }} />
            <Text style={styles.logText}>{item.epc}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 50 }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  status: { fontSize: 16, marginBottom: 20 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logsTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 3,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  logText: { fontSize: 14, color: '#333' },
});
