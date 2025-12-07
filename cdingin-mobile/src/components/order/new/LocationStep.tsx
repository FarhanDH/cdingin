import * as Location from "expo-location";
import { FilePlus, FileText, MapPin, MoveLeft, Navigation } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import MapView, { Region } from "react-native-maps";
import { Button } from "../../ui/Button";
import LocationNoteSheet from "./LocationNoteSheet";

interface LocationStepProps {
    initialLocation: {
        latitude: number;
        longitude: number;
        address?: string;
        note?: string;
    } | undefined;
    onSubmit: (data: {
        latitude: number;
        longitude: number;
        address: string;
        note: string;
    }) => void;
    onBack: () => void;
}

const DEFAULT_REGION = {
    latitude: -0.5022, // Samarinda approximate center
    longitude: 117.1536,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
};

export default function LocationStep({ initialLocation, onSubmit, onBack }: LocationStepProps) {
    const [region, setRegion] = useState<Region>(
        initialLocation
            ? {
                latitude: initialLocation.latitude,
                longitude: initialLocation.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }
            : DEFAULT_REGION
    );
    const [address, setAddress] = useState(initialLocation?.address || "Memuat alamat...");
    const [note, setNote] = useState(initialLocation?.note || "");
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
    const [locationDetails, setLocationDetails] = useState<any>(null);
    const mapRef = useRef<MapView>(null);

    // Initial permission check
    useEffect(() => {
        (async () => {
            const { status } = await Location.getForegroundPermissionsAsync();
            // We can prompt here if needed
        })();
    }, []);

    const getCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Izin Ditolak", "Izinkan akses lokasi untuk mempermudah penjemputan.");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            };
            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 1000);
            // logic for reverse geocode is in onRegionChangeComplete
        } catch (error) {
            Alert.alert("Error", "Gagal mendapatkan lokasi saat ini.");
        }
    };

    const reverseGeocode = async (lat: number, lng: number) => {
        setIsGeocoding(true);
        try {
            const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (result.length > 0) {
                const addr = result[0];
                const cleanAddress = [addr.street, addr.district, addr.city, addr.region].filter(Boolean).join(", ");
                setAddress(cleanAddress);
                setLocationDetails({ name: addr.name || addr.street || "Lokasi Terpilih" });
            } else {
                setAddress("Alamat tidak ditemukan");
            }
        } catch (error) {
            setAddress("Gagal memuat alamat");
        } finally {
            setIsGeocoding(false);
        }
    };

    const onRegionChangeComplete = (newRegion: Region) => {
        setRegion(newRegion);
        reverseGeocode(newRegion.latitude, newRegion.longitude);
    };

    const handleSubmit = () => {
        if (!address || isGeocoding) {
            return;
        }
        onSubmit({
            latitude: region.latitude,
            longitude: region.longitude,
            address,
            note,
        });
    };

    return (
        <View className="flex-1 bg-white relative">
            {/* Map View */}
            <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                initialRegion={region}
                onRegionChangeComplete={onRegionChangeComplete}
                showsUserLocation={true}
                showsMyLocationButton={false}
            />

            {/* Custom Marker */}
            <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center pointer-events-none pb-10">
                <MapPin size={40} color="#E02424" fill="#E02424" />
            </View>

            {/* Top Search Bar (Mock) */}
            {/* <View className="absolute top-4 left-4 right-4 z-10">
                <View className="bg-white rounded-full shadow-sm border border-gray-200 flex-row items-center p-3">
                    <Pressable onPress={onBack} className="mr-3">
                        <ArrowLeft size={24} color="#666" />
                    </Pressable>
                    <TextInput
                        placeholder="Cari lokasi..."
                        className="flex-1 text-base text-[#222222]"
                        editable={false}
                    />
                </View>
            </View> */}

            {/* My Location Button */}
            <Pressable
                onPress={getCurrentLocation}
                className="absolute bottom-64 right-4 bg-white p-3 rounded-full drop-shadow-lg z-10 border border-gray-200 active:scale-90"
            >
                <Navigation size={24} color="#057895" fill="#057895" />
            </Pressable>

            {/* Back Button */}
            <Pressable onPress={onBack} className="absolute bottom-64 left-4 bg-white p-3 rounded-full active:scale-90 shadow-md">
                <MoveLeft size={22} color="#222" />
            </Pressable>

            {/* Bottom Panel */}
            <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg border border-gray-200 p-5 pb-8">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-xl font-bold text-[#222222]">Set Lokasi Service</Text>
                </View>

                {/* Location Card */}
                <View className="bg-secondary/15 p-3 rounded-lg flex-row items-start gap-3 mb-4">
                    <View className="bg-red-400 p-1 rounded-full items-center justify-center w-8 h-8 mt-1">
                        <MapPin size={16} color="white" fill="white" />
                    </View>
                    <View className="flex-1 mr-2">
                        <Text className="font-medium text-base text-[#222222] mb-1">
                            {isGeocoding ? "Mencari..." : (locationDetails?.name || "Lokasi Terpilih")}
                        </Text>
                        <Text className="text-sm text-gray-600 line-clamp-2">
                            {isGeocoding ? "..." : address}
                        </Text>
                    </View>
                    <Pressable onPress={() => setIsNoteSheetOpen(true)}>
                        {note ? (
                            <View className="bg-primary/20 p-2 rounded-full">
                                <FileText size={20} color="#057895" />
                            </View>
                        ) : (
                            <View className="bg-gray-100 p-2 rounded-full">
                                <FilePlus size={20} color="#666" />
                            </View>
                        )}
                    </Pressable>
                </View>

                <Button
                    onPress={handleSubmit}
                    disabled={isGeocoding}
                    className="w-full h-[48px] rounded-full bg-primary active:scale-95"
                >
                    <Text className="text-white font-semibold text-base">Lanjut</Text>
                </Button>
            </View>

            <LocationNoteSheet
                isOpen={isNoteSheetOpen}
                onOpenChange={setIsNoteSheetOpen}
                initialNote={note}
                onSave={setNote}
                locationDetails={locationDetails}
                address={address}
            />
        </View>
    );
}
