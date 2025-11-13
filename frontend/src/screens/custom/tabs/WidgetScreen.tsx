import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type Widget = {
  id: string;
  name: string;
  engName: string;
  icon: string;
  isEnabled: boolean;
};

const initialWidgetData: Widget[] = [
  { id: '1', name: '시계', engName: 'clock', icon: 'time-outline', isEnabled: true },
  { id: '2', name: '날씨', engName: 'weather', icon: 'partly-sunny-outline', isEnabled: true },
  { id: '3', name: '캘린더', engName: 'calendar', icon: 'calendar-outline', isEnabled: false },
  { id: '4', name: '뉴스', engName: 'news', icon: 'newspaper-outline', isEnabled: false },
];

const WidgetScreen = () => {
  const [widgets, setWidgets] = useState(initialWidgetData);

  const toggleSwitch = (id: string) => {
    setWidgets(
      widgets.map(widget =>
        widget.id === id ? { ...widget, isEnabled: !widget.isEnabled } : widget
      )
    );
  };

  const renderItem = ({ item }: { item: Widget }) => (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={24} color="#94A3B8" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{item.name}</Text>
        <Text style={styles.descriptionText}>{item.engName}</Text>
      </View>
      <Switch
        trackColor={{ false: '#3E3E3E', true: '#81b0ff' }}
        thumbColor={item.isEnabled ? '#3B82F6' : '#f4f3f4'}
        onValueChange={() => toggleSwitch(item.id)}
        value={item.isEnabled}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>디스플레이 위젯</Text>
        <Text style={styles.headerDescription}>스마트 윈도우에 표시할 위젯을 선택하세요</Text>
      </View>
      <FlatList
        data={widgets}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.addButton}>
        <Icon name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>위젯 추가</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    marginBottom: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerDescription: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 5,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  itemContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 8,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default WidgetScreen;