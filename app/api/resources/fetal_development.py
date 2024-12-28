import json
import os


class FetalDevelopmentData:
    def __init__(self, json_file_path="app/api/fetal_development_data.json"):
        try:
            with open(json_file_path, "r", encoding="utf-8") as file:
                self.development_data = json.load(file)
        except FileNotFoundError:
            print(f"Error: No se encontró el archivo {json_file_path}")
            self.development_data = {}
        except json.JSONDecodeError:
            print(f"Error: El archivo {json_file_path} tiene un formato JSON inválido.")
            self.development_data = {}

    def get_all_weeks(self):
        """Obtiene la información de todas las semanas."""
        return self.development_data or {}

    def get_week_info(self, week):
        """Obtiene la información para una semana específica."""
        if not self.development_data:
            return None
        available_weeks = sorted(int(key) for key in self.development_data.keys())
        closest_week = min(available_weeks, key=lambda x: abs(x - week))
        return self.development_data.get(str(closest_week))
