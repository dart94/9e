import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Baby,
  Moon,
  Lightbulb,
  Users,
  Stethoscope,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { usePostpartoData } from "@/hooks/usePostPartoData";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { partostyles } from "../../src/theme/styles/postpartoStyles";
import { textStyles } from "../../src/theme/styles/textStyles";

const PostpartumScreen = () => {
  const [currentWeek, setCurrentWeek] = useState(1);


  type PostpartoWeek = {
    semana: number;
    cambios_madre: string;
    desarrollo_bebe: string;
    sueño_bebe: string;
    actividades_bebe: string;
    consejos_papa: string;
    vinculo_familiar: string;
    pruebas_medicas: string;
    sintomas_comunes: string;
    consejos: string;
  };

  type PostpartoData = { posparto: PostpartoWeek[] };

  const [postpartumData, setPostpartumData] = useState<PostpartoData | null>(
    null
  );

  const { data } = usePostpartoData();
  const router = useRouter();

  useEffect(() => {
    if (data) setPostpartumData(data);
  }, [data]);

  const currentData =
    postpartumData?.posparto.find((w) => w.semana === currentWeek) ??
    postpartumData?.posparto[0];

  // ---------- Card reutilizable ----------
  type InfoCardProps = {
    icon: React.ComponentType<any>;
    title: string;
    content: string;
    bgColor?: string;
    accentColor?: string;
  };

  const InfoCard: React.FC<InfoCardProps> = ({
    icon: Icon,
    title,
    content,
    bgColor = "#ffffff",
    accentColor = "#5FBFAF",
  }) => (
    <View
      style={[
        partostyles.cardContainer,
        {
          backgroundColor: bgColor,
          borderLeftWidth: 4,
          borderLeftColor: accentColor,
          borderWidth: 1,
          borderColor: "#E8F4F2",
        },
      ]}
    >
      <View style={partostyles.cardHeader}>
        <View style={[partostyles.iconContainer, { backgroundColor: "#E8F4F2" }]}>
          <Icon size={20} color={accentColor} />
        </View>
        <Text style={[partostyles.cardTitle, { color: "#080000" }]}>{title}</Text>
      </View>
      <Text style={[partostyles.cardContent, { color: "#555" }]}>{content}</Text>
    </View>
  );
  // ---------- fin InfoCard ----------

  if (!postpartumData) {
    return (
      <View style={partostyles.loadingContainer}>
        <ActivityIndicator size="large" color="#5FBFAF" />
      </View>
    );
  }

  return (
    <ScrollView style={partostyles.container}>
      {/* Header */}
      <View style={partostyles.header}>
        <TouchableOpacity
          style={partostyles.backButton}
          onPress={() => router.back()}
        >
          <View style={partostyles.headerTextContainer}>
            <Text style={partostyles.headerTitle}>Seguimiento Postparto</Text>
            <Text style={partostyles.headerSubtitle}>Tu recuperación paso a paso</Text>
          </View>
        </TouchableOpacity>

        <View style={partostyles.heartIconContainer}>
          <Heart size={24} color="#3A7669" />
        </View>
      </View>

      {/* Seleccionar Semana */}
      <View style={partostyles.weekSelector}>
        <View style={partostyles.weekNavigation}>
          <TouchableOpacity
            onPress={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
            disabled={currentWeek === 1}
            style={[
              partostyles.navButton,
              currentWeek === 1 && partostyles.disabledButton,
            ]}
          >
            <ChevronLeft size={20} color={textStyles.title.color} />
          </TouchableOpacity>

          <View style={partostyles.weekTextContainer}>
            <Text style={partostyles.weekNumber}>Semana {currentWeek}</Text>
            <Text style={partostyles.weekLabel}>Postparto</Text>
          </View>

          <TouchableOpacity
            onPress={() => setCurrentWeek(Math.min(28, currentWeek + 1))}
            disabled={currentWeek === 28}
            style={[
              partostyles.navButton,
              currentWeek === 28 && partostyles.disabledButton,
            ]}
          >
            <ChevronRight size={20} color={textStyles.title.color} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={partostyles.progressBarBackground}>
          <View
            style={[
              partostyles.progressBarFill,
              {
                width: `${(currentWeek / 28) * 100}%`,
                backgroundColor: "#3A7669",
              },
            ]}
          />
        </View>
        <Text style={partostyles.progressText}>
          {currentWeek} de 28 semanas
        </Text>
      </View>

      {/* Content Cards */}
      <View style={partostyles.contentContainer}>
        <InfoCard
          icon={Heart}
          title="Cambios en la Madre"
          content={currentData?.cambios_madre ?? ""}
          bgColor="#F5F9F8"
          accentColor="#3A7669"
        />

        <InfoCard
          icon={Baby}
          title="Desarrollo del Bebé"
          content={currentData?.desarrollo_bebe ?? ""}
          accentColor="#3A7669"
        />

        <InfoCard
          icon={Moon}
          title="Sueño del Bebé"
          content={currentData?.sueño_bebe ?? ""}
          bgColor="#F5F9F8"
          accentColor="#3A7669"
        />

        <InfoCard
          icon={Lightbulb}
          title="Actividades Recomendadas"
          content={currentData?.actividades_bebe ?? ""}
          accentColor="#FFB366"
        />

        <InfoCard
          icon={Users}
          title="Consejos para Papá"
          content={currentData?.consejos_papa ?? ""}
          bgColor="#F5F9F8"
          accentColor="#3A7669"
        />

        <InfoCard
          icon={Heart}
          title="Vínculo Familiar"
          content={currentData?.vinculo_familiar ?? ""}
          accentColor="#3A7669"
        />

        <InfoCard
          icon={Stethoscope}
          title="Pruebas Médicas"
          content={currentData?.pruebas_medicas ?? ""}
          bgColor="#F5F9F8"
          accentColor="#FFB366"
        />

        {/* Symptoms and Tips Section */}
        <View style={partostyles.gridContainer}>
          <View
            style={[
              partostyles.specialCard,
              {
                backgroundColor: "#FFF7F0",
                borderColor: "#FFB366",
                borderLeftWidth: 4,
              },
            ]}
          >
            <Text style={[partostyles.specialCardTitle, { color: "#FF8C1A" }]}>
              Síntomas Comunes
            </Text>
            <Text style={partostyles.specialCardContent}>
              {currentData?.sintomas_comunes ?? ""}
            </Text>
          </View>

          <View
            style={[
              partostyles.specialCard,
              {
                backgroundColor: "#F0F9F6",
                borderColor: "#4CAF50",
                borderLeftWidth: 4,
              },
            ]}
          >
            <Text style={[partostyles.specialCardTitle, { color: "#2E7D32" }]}>
              Consejos Importantes
            </Text>
            <Text style={partostyles.specialCardContent}>
              {currentData?.consejos ?? ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation Footer */}
      <View style={partostyles.footer}>
        <TouchableOpacity
          style={partostyles.primaryButton}
          // onPress={() => router.replace('/(tabs)')}
        >
          <Text style={partostyles.primaryButtonText}>Ver Dashboard</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={partostyles.secondaryButton}>
          <Text style={partostyles.secondaryButtonText}>Historial</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
};



export default PostpartumScreen;