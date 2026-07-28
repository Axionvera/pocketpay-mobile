import { View } from "react-native";
import { Tabs } from "expo-router";
import { Home, History, PiggyBank, Settings } from "lucide-react-native";
import { useTheme } from "../../src/hooks/useTheme";
import { useNetworkState } from "../../src/hooks/useNetworkState";
import { NetworkStateBanner } from "../../src/components/NetworkStateBanner";

export default function TabsLayout() {
  const { colors } = useTheme();
  const { state: networkState, retry } = useNetworkState();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NetworkStateBanner state={networkState} onRetry={retry} />
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
            shadowColor: "transparent",
            elevation: 0,
          },
          headerTintColor: colors.textPrimary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          sceneStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "Activity",
            tabBarIcon: ({ color, size }) => (
              <History color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="vault"
          options={{
            title: "Vault",
            tabBarIcon: ({ color, size }) => (
              <PiggyBank color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <Settings color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
