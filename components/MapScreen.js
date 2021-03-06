import {SafeAreaView, StyleSheet} from "react-native";
import {ReportsListContainer} from "../containers/ReportsListContainer";
import React from "react";
import {Colors} from "react-native/Libraries/NewAppScreen";

export function MapScreen () {
    return (
        <SafeAreaView style={styles.body}>
            <ReportsListContainer/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create( {
    body: {
        backgroundColor: Colors.white,
        flex: 1,
    },
} );