# Timer Name Field Update

## Summary
Added the ability to name timers with a subtle text field positioned above the timer display. The field blends in with the background and becomes more visible on hover and focus, creating a non-intrusive user experience.

## Implementation Details

1. **Updated the Timer Component**:
   - Added `timerName` and `onNameChange` props to the Timer component
   - Created a subtle input field above the timer display
   - Implemented hover and focus animations using GSAP to increase opacity when interacted with
   - Styled the input to blend with the background while remaining accessible

2. **Updated the Index Component**:
   - Added state management for the timer name
   - Added a callback to handle name changes
   - Updated the reset function to clear the timer name on reset

3. **UI/UX Considerations**:
   - Used transparent background to blend with the existing design
   - Applied subtle opacity changes for hover/focus states
   - Centered the field above the timer for visual alignment
   - Used appropriate font size and styling to maintain design harmony

## Future Enhancements
- Save timer names and associate them with specific timer presets
- Add ability to sort/filter saved timers by name
- Consider adding timer name to the completion notification

## Files Modified
- `src/components/Timer.tsx`
- `src/pages/Index.tsx` 