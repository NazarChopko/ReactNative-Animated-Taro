import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Tarot } from "./components/Tarot";

export default function App() {
  return (
    <>
      <Tarot />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
