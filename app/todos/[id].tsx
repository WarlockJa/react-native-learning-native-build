import { useLocalSearchParams } from "expo-router";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import { ThemeContext } from "@/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ColorSchemeName,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { TodoItem } from "@/data/todos";
import { Colors } from "@/constants/Colors";
import { Octicons } from "@expo/vector-icons";

export default function EditScreen() {
  // reading route id param
  const { id } = useLocalSearchParams();
  // router
  const router = useRouter();
  // todo data
  const [todo, setTodo] = useState<TodoItem>();

  // color theme
  const themeData = useContext(ThemeContext);
  if (!themeData) return null;
  const { colorScheme, setColorScheme, theme } = themeData;

  // generating styles for the theme
  const styles = createStyles(theme, colorScheme);

  // loading font
  const [loaded, error] = useFonts({
    Inter_500Medium,
  });

  useEffect(() => {
    const fetchData = async (id: string) => {
      try {
        const jsonValue = await AsyncStorage.getItem("TodoApp");
        const storageTodos: TodoItem[] | null =
          jsonValue != null ? JSON.parse(jsonValue) : null;

        if (storageTodos && storageTodos.length > 0) {
          const myTodo = storageTodos.find((todo) => todo.id.toString() === id);
          setTodo(myTodo);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData(id as string);
  }, [id]);

  const handleSave = async () => {
    if (!todo) return;
    try {
      const savedTodo: TodoItem = { ...todo, title: todo.title };

      const jsonValue = await AsyncStorage.getItem("TodoApp");
      const storageTodos: TodoItem[] =
        jsonValue != null ? JSON.parse(jsonValue) : null;

      if (storageTodos && storageTodos.length) {
        // const otherTodos = storageTodos.filter(todo => todo.id !== savedTodo.id)
        const newTodos = storageTodos.map((todo) =>
          todo.id !== savedTodo.id ? todo : savedTodo
        );

        await AsyncStorage.setItem("TodoApp", JSON.stringify(newTodos));
      } else {
        await AsyncStorage.setItem("TodoApp", JSON.stringify([savedTodo]));
      }

      router.back();
    } catch (error) {
      console.log(error);
    }
  };

  if (!loaded && !error) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Edit todo"
          placeholderTextColor={"gray"}
          value={todo?.title || ""}
          onChangeText={(text) =>
            setTodo((prev) => prev && { ...prev, title: text })
          }
        />
        <Pressable
          onPress={() =>
            setColorScheme(colorScheme === "light" ? "dark" : "light")
          }
          style={{ marginLeft: 10 }}
        >
          {colorScheme === "dark" ? (
            <Octicons
              name="moon"
              size={36}
              color={theme.text}
              selectable={undefined}
              style={{ width: 36 }}
            />
          ) : (
            <Octicons
              name="sun"
              size={36}
              color={theme.text}
              selectable={undefined}
              style={{ width: 36 }}
            />
          )}
        </Pressable>
      </View>
      <View style={styles.inputContainer}>
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.saveButton,
            { backgroundColor: theme.deleteIconBackground },
          ]}
        >
          <Text style={[styles.saveButtonText, { color: "white" }]}>
            Cancel
          </Text>
        </Pressable>
      </View>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </SafeAreaView>
  );
}

function createStyles(
  theme: typeof Colors.light,
  colorScheme: ColorSchemeName
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      backgroundColor: theme.background,
      paddingTop: 20,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      gap: 6,
      width: "100%",
      maxWidth: 1024,
      marginHorizontal: "auto",
      pointerEvents: "auto",
    },
    input: {
      flex: 1,
      borderColor: "gray",
      borderWidth: 1,
      borderRadius: 5,
      padding: 10,
      marginRight: 10,
      fontSize: 18,
      fontFamily: "Inter_500Medium",
      minWidth: 0,
      color: theme.text,
    },
    saveButton: {
      backgroundColor: theme.todoButtonBackground,
      borderRadius: 5,
      padding: 10,
    },
    saveButtonText: {
      fontSize: 18,
      color: colorScheme === "dark" ? "black" : "white",
    },
  });
}
