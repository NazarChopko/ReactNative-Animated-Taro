import { Image, StyleSheet, View, Dimensions } from "react-native";
import React, { useEffect } from "react";
import {
  Gesture,
  GestureDetector,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { snapPoint } from "react-native-redash";

const { width, height } = Dimensions.get("window");

const aspectRatio = 722 / 368;
const CARD_WIDTH = width - 128;
const CARD_HEIGHT = CARD_WIDTH * aspectRatio;
const IMAGE_WIDTH = CARD_WIDTH * 0.9;
const DURATION = 250;
const side = (width + CARD_WIDTH + 50) / 2;
const SNAP_POINTS = [-side, 0, side];

const Card = ({ card: { source }, index, shuffleBack }) => {
  const x = useSharedValue(0);
  const y = useSharedValue(-height);
  const rotateZ = useSharedValue(Math.random() * 20 - 10);
  const scale = useSharedValue(1);

  useAnimatedReaction(
    () => shuffleBack.value,
    () => {
      if (shuffleBack.value) {
        const delay = 150 * index;
        x.value = withDelay(delay, withSpring(0));
        rotateZ.value = withDelay(
          delay,
          withSpring(Math.random() * 20 - 10, {}, () => {
            shuffleBack.value = false;
          })
        );
      }
    }
  );

  useEffect(() => {
    const delay = index * DURATION;
    y.value = withDelay(
      delay,
      withTiming(0, { duration: DURATION, easing: Easing.inOut(Easing.ease) })
    );
  }, []);

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.x = x.value;
      context.y = y.value;
      scale.value = withTiming(1.1, { easing: Easing.inOut(Easing.ease) });
      rotateZ.value = withTiming(0, { easing: Easing.inOut(Easing.ease) });
    },
    onActive: ({ translationX, translationY }, context) => {
      x.value = context.x + translationX;
      y.value = context.y + translationY;
    },
    onEnd: ({ velocityX, velocityY }) => {
      const dest = snapPoint(x.value, velocityX, SNAP_POINTS);
      x.value = withSpring(dest, { velocity: velocityX });
      y.value = withSpring(0, { velocity: velocityY });
      scale.value = withTiming(1, { easing: Easing.inOut(Easing.ease) }, () => {
        const isLast = index === 0;
        const isSwipedLeftOrRight = dest !== 0;
        if (isLast && isSwipedLeftOrRight) {
          shuffleBack.value = true;
        }
      });
    },
  });
  const style = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1500 },

      { rotateX: "30deg" },
      { rotateZ: `${rotateZ.value}deg` },
      {
        translateX: x.value,
      },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));
  return (
    <View style={styles.container} pointerEvents="box-none">
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={[styles.card, style]}>
          <Image
            source={source}
            style={{ width: IMAGE_WIDTH, height: IMAGE_WIDTH * aspectRatio }}
            resizeMode="contain"
          />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
