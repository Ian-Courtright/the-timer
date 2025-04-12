# Timer Visualization States and Animations

## Overview

The circular timer visualization in the application header provides a clear visual indicator of the timer's current state. The visualization has several distinct states, each with its own appearance and animation to provide users with an intuitive understanding of the timer's status.

## Visual States

### 1. Idle State (Filled White Circle)
- **Appearance**: A solid white filled circle
- **When Active**: When the timer is not running and no duration is set
- **Visual Cue**: Clean, bright representation of a timer ready to be started

### 2. Countdown State (White Pie Chart)
- **Appearance**: A white filled pie chart that decreases as time passes
- **When Active**: When a timer with a specific duration is running
- **Visual Cue**: The filled segment visually represents the percentage of time remaining

### 3. Zero State (Pulsing White Circle)
- **Appearance**: A pulsing white circle with subtle zoom effect
- **When Active**: When countdown timer reaches exactly zero
- **Visual Cue**: Visual feedback that the timer has completed but hasn't yet entered overage

### 4. Count-Up State (Green Circle)
- **Appearance**: A solid green filled circle with gentle pulsing
- **When Active**: Only when a dedicated count-up timer is running (not after countdown completion)
- **Visual Cue**: The green color and subtle pulsing animation indicates active time tracking

### 5. Overage State (Red Circle)
- **Appearance**: A solid red filled circle with more pronounced pulsing
- **When Active**: When a timer with a set duration has expired and goes into negative time (-00:00:01)
- **Visual Cue**: The red color and pulsing animation provides a clear indication of time overrun

## Animations and Transitions

### State Transitions
1. **Idle → Countdown**:
   - White filled circle transforms into a decreasing pie chart
   - Container has a subtle bounce effect to indicate timer start

2. **Countdown → Zero**:
   - White pie chart fades out completely
   - White pulsing circle fades in with scale animation
   - Provides visual feedback that the countdown has completed

3. **Zero → Overage**:
   - White pulsing circle fades out
   - Red filled circle fades in with emphasis animation
   - Pulsing animation begins with 1-second sync to timer

4. **Idle → Count-Up** (for dedicated count-up timers):
   - White filled circle fades out
   - Green filled circle fades in with scale animation
   - Green pulsing begins with a consistent rhythm

5. **Any State → Idle**:
   - Current state fades out
   - Solid white circle fades in
   - Reset animation provides visual confirmation

### Continuous Animations

1. **Countdown Animation**:
   - The pie chart segment continuously decreases based on remaining time
   - Uses GSAP's `fromTo` animation for smooth transitions
   - Animation duration is dynamically calculated based on remaining time

2. **Zero Animation**:
   - White circle gently pulses (scale 1.0 → 1.05)
   - 0.8-second duration, repeating infinitely
   - Provides clear visual indication that timer has reached zero

3. **Count-Up Animation**:
   - Green circle gently pulses (scale 1.0 → 1.05)
   - 1-second duration, repeating infinitely
   - Uses `sine.inOut` easing for a natural breathing effect

4. **Overage Animation**:
   - Red circle pulses more prominently (scale 1.0 → 1.08)
   - Higher opacity (0.9) for more vivid appearance
   - 1-second duration, matching the timer's tick

## Implementation Details

### State Separation
- Each state has dedicated visual elements to avoid conflicts
- Proper cleanup of animations when transitioning between states
- Precise control of opacity and timing for smooth transitions

### Smart State Detection
- Special handling for the zero state to provide momentary feedback
- Improved detection of state transitions with appropriate animation triggers
- Prevention of unintended state overlaps

### Visual Clarity Improvements
- Clear distinction between countdown completion and dedicated count-up timers
- Better scaling and opacity values for optimal visibility
- Consistent animation patterns while maintaining state-specific identity

## User Experience Benefits

1. **Clearer State Indication**: Users can instantly recognize the timer's state at a glance
2. **Smoother Transitions**: Each state change is animated with precise timing
3. **Attention-Appropriate Design**: More critical states draw appropriate visual attention
4. **Informative Feedback**: The zero state provides momentary feedback before transitioning to overage
5. **Consistent Visual Language**: The circular motif maintains consistency while state-specific styling provides clarity 