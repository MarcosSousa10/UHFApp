import React, { useEffect, useState } from 'react';
import { View, Text, Button, NativeModules, NativeEventEmitter, PermissionsAndroid, Platform } from 'react-native';

const { UHFModule } = NativeModules;
const emitter = new NativeEventEmitter(UHFModule);

export default function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const subTag = emitter.addListener('UHF_Tag', tag => {
      console.log('TAG:', tag.epc);
      setLogs(l => [tag.epc, ...l]);
    });
    const subConn = emitter.addListener('UHF_Connection', s => {
      console.log('CONN:', s.status);
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
      const res = await PermissionsAndroid.requestMultiple(perms);
      console.log('perms', res);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Pedir permissões" onPress={requestPermissions} />
      <Button title="Conectar (MAC)" onPress={() => UHFModule.connect('EA:50:A6:7F:9C:D2')} />
      <Button title="Iniciar leitura" onPress={() => UHFModule.startInventory()} />
      <Button title="Iniciar leitura um por um" onPress={() => UHFModule.singleInventory()} />
      <Button title="Parar leitura" onPress={() => UHFModule.stopInventory()} />
      <Text>Logs:</Text>
      {logs.map((l, i) => <Text key={i}>{l}</Text>)}
    </View>
  );
}
