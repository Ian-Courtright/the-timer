# Count-Up Functionality Update

## Overview
Added count-up functionality to the timer to count up after the timer hits zero and also when the timer is at zero and you press start.

## Changes Made

### 1. Updated Timer Component (src/components/Timer.tsx)
- Added `countingUp` state to track when timer is counting up
- Modified the timer counting logic to support count-up after reaching zero
- Added visual indicator when counting up
- Preserved original countdown functionality

### 2. Updated Index Component (src/pages/Index.tsx)
- Added `isCountingUp` state at the application level
- Modified progress calculation to support count-up mode
- Added logic to detect when the timer reaches zero while running
- Updated progress bar to use different scaling for count-up mode (maxes at 30 minutes)

### 3. Updated Header Component (src/components/Header.tsx)
- Added `isCountingUp` prop to be passed down to the circular timer
- Made the prop optional with default value of false

### 4. Updated CircularTimer Component (src/components/CircularTimer.tsx)
- Removed internal state tracking for count-up mode
- Added `isCountingUp` prop to control the display directly
- Maintained visual effects (red glow) for counting up state

## Features
- Timer counts down normally from any set time
- When timer reaches zero during countdown, it automatically switches to count-up mode
- When timer is at zero and user presses start, it immediately starts counting up
- Visual indicators show when the timer is in count-up mode
- Progress bar displays appropriate values in both modes

## Testing
- Verified countdown works as before
- Verified count-up works after reaching zero
- Verified count-up works when starting from zero
- Verified visual indicators work correctly 