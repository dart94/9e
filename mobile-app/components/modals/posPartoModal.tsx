import { postparto } from "@/api/posparto";
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import CustomInput from "@/src/components/CustomInput";
import { miscStyles, modalStyles } from "@/src/theme/styles";
import { textStyles } from "@/src/theme/styles/textStyles";
import { getUserIdFromStorage } from "@/utils/user";
import { useRouter } from "expo-router";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export type PostpartoData = {
  user_id: number;
  birth_date: string;
  weight: number;
  notes: string;
};

export const PosPartoModal: React.FC<Props> = ({ visible, onClose }) => {
  const [formData, setFormData] = useState<PostpartoData>({
    user_id: 0,
    birth_date: "",
    weight: 0,
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

    useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserIdFromStorage();
      if (userId) {
        setFormData((prev) => ({ ...prev, user_id: userId }));
      }
    };

    if (visible) fetchUserId(); // Carga user_id solo si el modal se abre
  }, [visible]);

  const handleChange = (name: keyof PostpartoData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.birth_date || formData.weight <= 0) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }
    try {
      setIsSubmitting(true);
      const result = await postparto(formData);
      alert("🎉 Registro exitoso");
      setIsSubmitting(false);
      console.log(result);
      onClose();
      //redirect to dashboard
      router.replace('/(tabs)/PostParto');

    } catch (error) {
      setIsSubmitting(false);
      console.log(error);
      alert("❌ Ocurrió un error al registrar el nacimiento.");
    }

  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
              <Text style={modalStyles.closeText}>✖</Text>
            </TouchableOpacity>

            <Text style={modalStyles.modalTitle}>Registro de Nacimiento</Text>

            <Text style={textStyles.label}>Fecha de nacimiento</Text>
            <CustomInput
              style={miscStyles.input}
              value={formData.birth_date}
              onChangeText={(text) => handleChange("birth_date", text)}
              placeholder="YYYY-MM-DD"
            />

            <Text style={textStyles.label}>Peso (kg)</Text>
            <CustomInput
              style={miscStyles.input}
              value={String(formData.weight)}
              onChangeText={(text) => handleChange("weight", Number(text))}
              placeholder="Peso del bebé"
              keyboardType="numeric"
            />

            <Text style={textStyles.label}>Notas</Text>
            <CustomInput
              style={[miscStyles.input, { height: 100 }]}
              value={formData.notes}
              onChangeText={(text) => handleChange("notes", text)}
              placeholder="Notas adicionales"
              multiline
            />

            {isSubmitting ? (
              <ActivityIndicator size="large" color="#FF4081" />
            ) : (
              <Button title="Enviar" onPress={handleSubmit} />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};