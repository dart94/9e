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
  StyleSheet,
} from "react-native";
import { layoutStyles } from "../src/theme/styles/layoutStyles";
import { textStyles } from "../src/theme/styles/textStyles";
import { buttonStyles } from "../src/theme/styles/buttonStyles";
import { miscStyles } from "../src/theme/styles/miscStyles";

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
        styles.cardContainer,
        {
          backgroundColor: bgColor,
          borderLeftWidth: 4,
          borderLeftColor: accentColor,
          borderWidth: 1,
          borderColor: "#E8F4F2",
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: "#E8F4F2" }]}>
          <Icon size={20} color={accentColor} />
        </View>
        <Text style={[styles.cardTitle, { color: "#080000" }]}>{title}</Text>
      </View>
      <Text style={[styles.cardContent, { color: "#555" }]}>{content}</Text>
    </View>
  );
  // ---------- fin InfoCard ----------

  if (!postpartumData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5FBFAF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#6B7280" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Seguimiento Postparto</Text>
            <Text style={styles.headerSubtitle}>Tu recuperación paso a paso</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.heartIconContainer}>
          <Heart size={24} color="#5FBFAF" />
        </View>
      </View>

      {/* Week Selector */}
      <View style={styles.weekSelector}>
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            onPress={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
            disabled={currentWeek === 1}
            style={[
              styles.navButton,
              currentWeek === 1 && styles.disabledButton,
            ]}
          >
            <ChevronLeft size={20} />
          </TouchableOpacity>

          <View style={styles.weekTextContainer}>
            <Text style={styles.weekNumber}>Semana {currentWeek}</Text>
            <Text style={styles.weekLabel}>Postparto</Text>
          </View>

          <TouchableOpacity
            onPress={() => setCurrentWeek(Math.min(28, currentWeek + 1))}
            disabled={currentWeek === 28}
            style={[
              styles.navButton,
              currentWeek === 28 && styles.disabledButton,
            ]}
          >
            <ChevronRight size={20} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${(currentWeek / 28) * 100}%`,
                backgroundColor: "#5FBFAF",
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentWeek} de 28 semanas
        </Text>
      </View>

      {/* Content Cards */}
      <View style={styles.contentContainer}>
        <InfoCard
          icon={Heart}
          title="Cambios en la Madre"
          content={currentData?.cambios_madre ?? ""}
          bgColor="#F5F9F8"
          accentColor="#5FBFAF"
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
          accentColor="#5FBFAF"
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
          accentColor="#5FBFAF"
        />

        <InfoCard
          icon={Stethoscope}
          title="Pruebas Médicas"
          content={currentData?.pruebas_medicas ?? ""}
          bgColor="#F5F9F8"
          accentColor="#FFB366"
        />

        {/* Symptoms and Tips Section */}
        <View style={styles.gridContainer}>
          <View
            style={[
              styles.specialCard,
              {
                backgroundColor: "#FFF7F0",
                borderColor: "#FFB366",
                borderLeftWidth: 4,
              },
            ]}
          >
            <Text style={[styles.specialCardTitle, { color: "#FF8C1A" }]}>
              Síntomas Comunes
            </Text>
            <Text style={styles.specialCardContent}>
              {currentData?.sintomas_comunes ?? ""}
            </Text>
          </View>

          <View
            style={[
              styles.specialCard,
              {
                backgroundColor: "#F0F9F6",
                borderColor: "#4CAF50",
                borderLeftWidth: 4,
              },
            ]}
          >
            <Text style={[styles.specialCardTitle, { color: "#2E7D32" }]}>
              Consejos Importantes
            </Text>
            <Text style={styles.specialCardContent}>
              {currentData?.consejos ?? ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Ver Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Historial</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFC",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  heartIconContainer: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: "#E8F4F2",
  },
  weekSelector: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  weekNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  disabledButton: {
    opacity: 0.5,
  },
  weekTextContainer: {
    alignItems: "center",
  },
  weekNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5FBFAF",
  },
  weekLabel: {
    fontSize: 14,
    color: "#555",
  },
  progressBarBackground: {
    width: "100%",
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 4,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  contentContainer: {
    gap: 16,
  },
  cardContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 14,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  specialCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  specialCardTitle: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 8,
  },
  specialCardContent: {
    fontSize: 14,
    color: "#555",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 32,
    marginBottom: 16,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: "#5FBFAF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 14,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#5FBFAF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: "#5FBFAF",
    fontWeight: "500",
    fontSize: 14,
  },
});

export default PostpartumScreen;