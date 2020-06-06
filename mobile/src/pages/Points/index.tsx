import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import Constants from 'expo-constants';
import { useNavigation, useRoute  } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
import { ScrollView } from 'react-native-gesture-handler';
import { Feather as Icon } from '@expo/vector-icons';

import api from '../../services/api';

interface Item {
  id: number;
  titulo: string;
  imgURL: string;
}

interface Point {
  id: number;
  imagem: string;
  imgURL: string;
  nome: string;
  latitude: number;
  longitude: number;
}

interface Params {
  uf: string;
  cidade: string;
}

const Points = () => {

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  const [items, setItems] = useState<Item[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [inicialPosition, setInicialPosition] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    api.get('items').then(res => {
      setItems(res.data);
    });
  }, []);

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync();

      if (status !== 'granted') {

        Alert.alert('Ooooops', 'Para melhor uso permita a localização, por enquanto vamos direciona-lo par Nova Iorque');
        setInicialPosition([40.7059674, -73.9975568]);

      } else {

        const location = await Location.getCurrentPositionAsync();
        const { latitude, longitude } = location.coords;

        setInicialPosition([latitude, longitude]);
      }
    }

    loadPosition();
    //console.log(inicialPosition);

  }, [])

  useEffect(() => {
    api.get('points', {
      params: {
        cidade: routeParams.cidade,
        uf: routeParams.uf,
        items: selectedItems,
      }
    }).then(res => {
      setPoints(res.data);
    });
  }, [selectedItems]);

  function handleNavigateBack() {
    navigation.goBack();
  }

  function handleNavigateToDetail(id: number) {
    navigation.navigate('Detail', {p_id: id});
  }

  function handleSelectItem(id: number) {
    if (selectedItems.includes(id)) {
      const filtredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filtredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name='arrow-left' color='#34cb79' size={20} />
        </TouchableOpacity>

        <Text style={styles.title}>
          Bem Vindo.
      </Text>
        <Text style={styles.description}>
          Encontre no mapa um ponto de coleta.
      </Text>

        <View style={styles.mapContainer}>
          {inicialPosition[0] !== 0 && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: inicialPosition[0],
                longitude: inicialPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014,
              }}
            >
              {points.map(point => (
                <Marker
                  key={String(point.id)}
                  style={styles.mapMarker}
                  onPress={() => handleNavigateToDetail(point.id)}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}>
                  <View style={styles.mapMarkerContainer}>
                    <Image style={styles.mapMarkerImage} source={{ uri: point.imgURL }} />
                    <Text style={styles.mapMarkerTitle}>{point.nome}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {items.map(item => (
            <TouchableOpacity
              key={String(item.id)}
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : null
              ]}
              onPress={() => handleSelectItem(item.id)}
              activeOpacity={0.6}
            >
              <SvgUri width={42} height={42} uri={item.imgURL} />
              <Text style={styles.itemTitle}>{item.titulo}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  )
}
export default Points;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    backgroundColor: '#E1FAEC',
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});