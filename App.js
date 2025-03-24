import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Modal,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    };

    getLocation();
  }, []);

  const fetchWeatherData = async (latitude, longitude) => {


    //Provide your API key from https://openweathermap.org/ 


    const apiKey = "";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      if (!apiKey) {
        setWeatherData({
          description: "ERROR: API key is missing. Please provide a valid API key from openweathermap.org.",
        });
        setModalVisible(true);
        return;
      }
    
    try {
      let response = await fetch(url);
      let data = await response.json();
      setWeatherData({
        place: data.name,
        latitude: latitude,
        longitude: longitude,
        temp: data.main.temp,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        description: data.weather[0].description,
      });
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const handleButtonPress = () => {
    if (currentLocation) {
      fetchWeatherData(currentLocation.latitude, currentLocation.longitude);
    } else {
      console.log("Location not available");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Practical 3</Text>
      </View>

      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
          <Text style={styles.buttonText}>Get Weather</Text>
        </TouchableOpacity>

        {initialRegion && (
          <MapView 
            style={styles.map} 
            initialRegion={initialRegion}
            showsMyLocationButton={true}
            showsUserLocation={true}
            provider= { PROVIDER_DEFAULT }
          >
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title="Your Location"
              />
            )}
          </MapView>
        )}
      </View>
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {weatherData ? (
              <>
                {weatherData.place && <Text style={styles.modalText}>Place: {weatherData.place}</Text>}
                {weatherData.latitude && <Text style={styles.modalText}>Latitude: {weatherData.latitude}</Text>}
                {weatherData.longitude && <Text style={styles.modalText}>Longitude: {weatherData.longitude}</Text>}
                {weatherData.temp && <Text style={styles.modalText}>Temperature: {weatherData.temp}°C</Text>}
                {weatherData.pressure && <Text style={styles.modalText}>Pressure: {weatherData.pressure} hPa</Text>}
                {weatherData.humidity && <Text style={styles.modalText}>Humidity: {weatherData.humidity}%</Text>}
                {weatherData.description && <Text style={styles.modalText}>Description: {weatherData.description}</Text>}
              </>
            ) : (
              <Text style={styles.modalText}>No weather data available.</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  banner: {
    width: "100%",
    height: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  bannerText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  map: { width: "100%", height: "100%" },
  button: {
    position: "absolute",
    top: 70,
    right: 10,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    zIndex: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalText: { fontSize: 16, marginBottom: 10 },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
});

export default App;