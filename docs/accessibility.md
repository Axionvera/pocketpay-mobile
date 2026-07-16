# Accessibility Checklist for PocketPay Mobile

As you contribute to PocketPay Mobile, please ensure that your React Native UI changes meet our accessibility standards. By following this checklist, you help make the app usable for everyone.

## General UI & Layout

- [ ] **Readable Labels:** Use `accessible={true}` and descriptive `accessibilityLabel` props on interactive elements. For text, ensure the content is self-explanatory.
- [ ] **Touch Targets:** Ensure all tappable areas (buttons, links, icons) have a minimum touch target size of 44x44 dp to comply with standard mobile guidelines. Use `hitSlop` in React Native if the visual element is smaller.

## Visuals & Styling

- [ ] **Colour Contrast:** Maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text/UI components against their background. Test both light and dark modes.
- [ ] **Scalable Text:** Avoid hardcoding fixed heights for text containers. Allow text to wrap and scale properly when users adjust their device font size settings.

## States & Feedback

- [ ] **Loading States:** Provide clear visual feedback (e.g., `ActivityIndicator`) when content is loading. Use `accessibilityState={{ busy: true }}` to inform screen readers.
- [ ] **Error States & Messages:** Clearly display validation errors or failure states near the relevant input or action. Announce critical errors to screen readers using `accessibilityLiveRegion="assertive"`.

## Feature-Specific Guidelines

- [ ] **QR-Related Screens:** 
  - Ensure QR code scanners provide haptic or audio feedback upon successful scans.
  - For displaying QR codes, provide a textual alternative (e.g., the raw wallet address underneath) so users who cannot scan or see the QR code can still copy and share it.
- [ ] **Wallet & Payment Flows:**
  - Double-check that amount inputs and confirmation buttons are clearly labeled for screen readers (e.g., "Send 50 XLM to address").
- [ ] **Contacts & Vault Screens:**
  - Ensure list items in the address book are announced as a single cohesive element rather than separate text nodes (use `accessible={true}` on the container).
