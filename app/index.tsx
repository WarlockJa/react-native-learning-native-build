import { Colors } from "@/constants/Colors";
import { data, TodoItem } from "@/data/todos";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import {
  Appearance,
  ColorSchemeName,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import { ThemeContext } from "@/context/ThemeContext";
import Animated, { LinearTransition } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

export default function Index() {
  // selecting container type based on the platform application runs on
  const Container = Platform.OS === "web" ? ScrollView : SafeAreaView;

  // // reading user preferred theme
  // const colorScheme = Appearance.getColorScheme();
  // // getting theme colors
  // const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const themeData = useContext(ThemeContext);
  if (!themeData) return null;
  const { colorScheme, setColorScheme, theme } = themeData;

  // generating styles for the theme
  const styles = createStyles(theme, colorScheme);

  // FlatList components
  const separatorComp = <View style={styles.separator} />;

  // todos local state
  const [todos, setTodos] = useState<TodoItem[]>([]);
  // input value state
  const [inputValue, setInputValue] = useState("");
  // flag for update todo mode
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | undefined>();

  // router
  const router = useRouter();

  // loading font
  const [loaded, error] = useFonts({
    Inter_500Medium,
  });

  // using storage to load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("TodoApp");

        const storageTodos = jsonValue != null ? JSON.parse(jsonValue) : null;

        if (storageTodos && storageTodos.length) {
          setTodos(storageTodos);
        } else {
          setTodos(data);
        }
      } catch (error) {
        console.log("ERROR: ", error);
      }
    };

    fetchData();
  }, [data]);

  // saving data to localStorage
  useEffect(() => {
    const storeData = async () => {
      try {
        const jsonValue = JSON.stringify(todos);
        await AsyncStorage.setItem("TodoApp", jsonValue);
      } catch (error) {
        console.log(error);
      }
    };

    storeData();
  }, [todos]);

  // add new todo handler
  const handleAddTodo = () => {
    if (inputValue.length < 0) return;

    const id = todos.length > 0 ? todos[0].id + 1 : 1;

    const newTodos = todos.concat({ id, completed: false, title: inputValue });

    setTodos(newTodos);

    setInputValue("");
  };

  // delete todo
  const handleDeleteTodo = (item: TodoItem) => {
    if (!item || !item.id) return;

    setTodos((prev) => prev.filter((todo) => todo.id !== item.id));
  };

  // select existing todo for update
  const handleTodoSelect = (item: TodoItem) => {
    if (!item || !item.id) return;

    setSelectedTodo(item);

    setInputValue(item.title);
  };

  // change todo status (complete)
  const handleChangeTodoStatus = (item: TodoItem) => {
    if (!item || !item.id) return;

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === item.id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // update todo with the new title value
  const handleUpdateTodo = () => {
    if (!selectedTodo) return;

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === selectedTodo.id
          ? { ...selectedTodo, title: inputValue }
          : todo
      )
    );

    setInputValue("");
    setSelectedTodo(undefined);
  };

  // cancel update
  const handleCancelUpdateTodo = () => {
    setInputValue("");
    setSelectedTodo(undefined);
  };

  // nacigating to todo dynamic page
  const handlePress = (id: number) => {
    // @ts-ignore
    router.push(`/todos/${id}`);
  };

  if (!loaded && !error) return null;

  return (
    <Container style={styles.contentContainer}>
      <View style={styles.todoListInputArea}>
        <TextInput
          style={styles.todoListInput}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Add a new todo"
          placeholderTextColor={theme.placeholderColor}
          maxLength={180}
          multiline
        />
        {selectedTodo ? (
          <View style={styles.todoListUpdateButtons}>
            <Pressable
              style={styles.todoListAddButton}
              onPress={handleUpdateTodo}
            >
              <Text style={styles.todoListAddButtonText}>Update</Text>
            </Pressable>
            <Pressable
              style={styles.todoListAddButton}
              onPress={handleCancelUpdateTodo}
            >
              <Text style={styles.todoListAddButtonText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.todoListAddButtons}>
            <Pressable style={styles.todoListAddButton} onPress={handleAddTodo}>
              <Text style={styles.todoListAddButtonText}>Add</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                setColorScheme(colorScheme === "light" ? "dark" : "light")
              }
              // style={{ marginLeft: 10 }}
              style={styles.todoListThemeSwitchButton}
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
        )}
      </View>
      <Animated.FlatList
        data={todos.sort((a, b) => b.id - a.id)}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => separatorComp}
        itemLayoutAnimation={LinearTransition}
        keyboardDismissMode={"on-drag"}
        renderItem={({ item }) => (
          <View
            style={[
              styles.todoListRow,
              item.id === selectedTodo?.id ? styles.selectedTodoItem : null,
            ]}
          >
            <View style={styles.todoListTextRow}>
              <Pressable
                onLongPress={() => handleChangeTodoStatus(item)}
                // onPress={() => handleTodoSelect(item)}
                onPress={() => handlePress(item.id)}
              >
                <Text
                  style={[
                    styles.todoListItemText,
                    item.completed ? styles.todoListItemDone : null,
                  ]}
                >
                  {item.title}
                </Text>
              </Pressable>
            </View>
            <Pressable onPress={() => handleDeleteTodo(item)}>
              <Ionicons name="trash" size={24} style={styles.deleteIcon} />
            </Pressable>
          </View>
        )}
      />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </Container>
  );
}

function createStyles(
  theme: typeof Colors.light,
  colorScheme: ColorSchemeName
) {
  return StyleSheet.create({
    contentContainer: {
      backgroundColor: theme.background,
      paddingVertical: 8,
      paddingTop: 28,
      overflow: "scroll",
    },
    separator: {
      height: 1,
      backgroundColor: theme.text,
      width: "100%",
    },
    todoListRow: {
      flexDirection: "row",
      width: "100%",
      paddingHorizontal: 8,
      borderWidth: 8,
      borderColor: theme.border,
    },
    todoListTextRow: {
      width: "65%",
      marginVertical: 20,
      paddingRight: 5,
      flexGrow: 1,
    },
    todoListItemText: {
      color: theme.text,
      fontSize: 18,
      fontFamily: "Inter_500Medium",
    },
    todoListItemDone: {
      textDecorationLine: "line-through",
      opacity: 0.5,
    },
    deleteIcon: {
      marginVertical: "auto",
      width: 28,
      height: 28,
      backgroundColor: theme.deleteIconBackground,
      borderRadius: 50,
      textAlign: "center",
      textAlignVertical: "center",
    },
    todoListInputArea: {
      flexDirection: "row",
      gap: 8,
      marginHorizontal: 8,
    },
    todoListInput: {
      width: "68%",
      flexGrow: 1,
      borderWidth: 1,
      borderColor: theme.text,
      color: theme.text,
      borderRadius: 8,
      fontSize: 18,
      padding: 8,
      fontFamily: "Inter_500Medium",
    },
    todoListAddButton: {
      borderRadius: 8,
      backgroundColor: theme.todoButtonBackground,
      padding: 16,
      justifyContent: "center",
    },
    todoListAddButtonText: {
      color: theme.background,
      fontSize: 18,
    },
    todoListThemeSwitchButton: {
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    todoListUpdateButtons: {
      flexDirection: "column",
    },
    todoListAddButtons: {
      flexDirection: "row",
      gap: 2,
    },
    selectedTodoItem: {
      // backgroundColor: colorScheme === "dark" ? "#696969" : "#000",
      backgroundColor: theme.selectedTodoBackground,
    },
  });
}
