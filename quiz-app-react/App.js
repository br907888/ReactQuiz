import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { ButtonGroup } from "react-native-elements";

const Stack = createStackNavigator();

const quizData = [
  {
    prompt: "In what year was UCF founded?",
    type: "multiple-choice",
    choices: ["1963", "1738", "1954", "1973"],
    correct: 0,
  },
  {
    prompt: "UCF stands for the University of Central Florida.",
    type: "true-false",
    choices: ["True", "False"],
    correct: 0,
  },
  {
    prompt: "Which of these are UCF Housing communities?",
    type: "multiple-answer",
    choices: ["Libra", "Mercury", "Neptune", "Orion"],
    correct: [0, 2],
  },
];

// Correct answers:
// Q1: 1963 (index 0)
// Q2: True (index 0)
// Q3: Libra, Neptune (index 0, 2)

const Question = ({ route, navigation }) => {
  const { data, index, answers } = route.params;
  const question = data[index];

  const [selected, setSelected] = useState(
    question.type === "multiple-answer" ? [] : null
  );

  useEffect(() => {
    setSelected(question.type === "multiple-answer" ? [] : null);
  }, [question]);

  const handleSelect = (i) => {
    if (question.type === "multiple-answer") {
      setSelected((prev) =>
        Array.isArray(prev)
          ? prev.includes(i)
            ? prev.filter((v) => v !== i)
            : [...prev, i]
          : [i]
      );
    } else {
      setSelected(i);
    }
  };

  const handleNext = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = selected;
    if (index + 1 < data.length) {
      navigation.navigate("Question", {
        data,
        index: index + 1,
        answers: updatedAnswers,
      });
    } else {
      navigation.navigate("Summary", { data, answers: updatedAnswers });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.counter}>
        Question {index + 1} of {data.length}
      </Text>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <ButtonGroup
        testID="choices"
        buttons={question.choices}
        {...(question.type === "multiple-answer"
          ? { selectedIndexes: Array.isArray(selected) ? selected : [] }
          : { selectedIndex: typeof selected === "number" ? selected : null })}
        onPress={handleSelect}
        vertical
        containerStyle={{ marginBottom: 20 }}
      />
      <Button
        testID="next-question"
        title="Next"
        onPress={handleNext}
        color="#2196F3"
      />
    </SafeAreaView>
  );
};

const Summary = ({ route }) => {
  const { data, answers } = route.params;
  const windowHeight = Dimensions.get('window').height;

  const isCorrect = (userAnswer, correct) => {
    if (Array.isArray(correct)) {
      return (
        Array.isArray(userAnswer) &&
        correct.length === userAnswer.length &&
        correct.every((v) => userAnswer.includes(v))
      );
    }
    return userAnswer === correct;
  };

  const totalScore = data.filter((q, i) =>
    isCorrect(answers[i], q.correct)
  ).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.contentContainer,
          { minHeight: windowHeight - 100 } 
        ]}
      >
        <Text testID="total" style={styles.score}>
          Total Score: {totalScore} / {data.length}
        </Text>
        {data.map((q, i) => {
          const correctAnswer = q.correct;
          const userAnswer = answers[i];

          const correctSet = Array.isArray(correctAnswer)
            ? new Set(correctAnswer)
            : new Set([correctAnswer]);
          const userSet = Array.isArray(userAnswer)
            ? new Set(userAnswer)
            : new Set([userAnswer]);

          const isAnswerCorrect = isCorrect(userAnswer, correctAnswer);

          return (
            <View key={i} style={styles.questionSummary}>
              <Text style={styles.prompt}>{q.prompt}</Text>
              {q.choices.map((choice, idx) => {
                const selected = userSet.has(idx);
                const isCorrectChoice = correctSet.has(idx);
                
                let choiceStyle = styles.choiceNeutral;
                
                if (selected) {
                  choiceStyle = isCorrectChoice 
                    ? styles.choiceCorrect 
                    : styles.choiceIncorrect;
                } else if (isCorrectChoice) {
                  choiceStyle = styles.choiceMissed;
                }
                
                return (
                  <View key={idx} style={styles.choiceRow}>
                    <Text style={[styles.choiceText, choiceStyle]}>
                      - {choice}
                    </Text>
                    {selected && !isCorrectChoice && (
                      <Text style={styles.incorrectLabel}>INCORRECT</Text>
                    )}
                    {selected && isCorrectChoice && (
                      <Text style={styles.correctLabel}>CORRECT</Text>
                    )}
                  </View>
                );
              })}
              <Text style={isAnswerCorrect ? styles.resultCorrect : styles.resultIncorrect}>
                {isAnswerCorrect ? "✔ Correct" : "✘ Incorrect"}
              </Text>
            </View>
          );
        })}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Question"
          component={Question}
          initialParams={{ data: quizData, index: 0, answers: [] }}
        />
        <Stack.Screen name="Summary" component={Summary} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 150,
  },
  bottomPadding: {
    height: 100, 
  },
  prompt: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  counter: {
    fontSize: 16,
    marginBottom: 10,
  },
  score: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  questionSummary: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  choiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    flexWrap: "wrap", 
  },
  choiceText: {
    flex: 1,
    paddingVertical: 5,
    fontSize: 16,
    marginRight: 10, 
  },
  choiceNeutral: {
    color: "#333",
  },
  choiceCorrect: {
    color: "#2e7d32", 
    fontWeight: "bold",
  },
  choiceIncorrect: {
    color: "#c62828", 
    textDecorationLine: "line-through",
  },
  choiceMissed: {
    color: "#2e7d32", 
    fontStyle: "italic",
  },
  correctLabel: {
    color: "#2e7d32",
    fontWeight: "bold",
    fontSize: 12,
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  incorrectLabel: {
    color: "#c62828",
    fontWeight: "bold",
    fontSize: 12,
    backgroundColor: "#ffebee",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resultCorrect: {
    color: "#2e7d32",
    fontWeight: "bold",
    marginTop: 15,
    fontSize: 16,
  },
  resultIncorrect: {
    color: "#c62828",
    fontWeight: "bold",
    marginTop: 15,
    fontSize: 16,
  },
});

export default App;