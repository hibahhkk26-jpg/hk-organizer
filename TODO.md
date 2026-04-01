# HK Organizer Enhancement Plan
## Status: [ ] 0/13 Complete

### 🔧 Core Features (Priority 1)
- [ ] 1. Expand types.ts: Full NotificationConfig (date, repeats, days[], sound)
- [ ] 2. db.ts: Add getNotificationSoundList(), scheduleNotification(id, config)
- [ ] 3. useDB.ts: Expose scheduleNotification(), importBackup(fileUri)
- [ ] 4. App.tsx: Add NotificationModal (DateTimePicker, repeat toggles, day picker, sound picker)
- [ ] 5. App.tsx: Checklist sub-items (add/remove tasks under checklists)
- [ ] 6. App.tsx: Bell button → open NotificationModal for item
- [ ] 7. App.tsx: Settings import button (DocumentPicker → importJSON)

### 🎨 UI Polish (Priority 2)
- [ ] 8. App.tsx: Enhance tilted shadows (box-shadow rotation effect)
- [ ] 9. App.tsx: Arabic RTL support (I18nManager, flexDirection: 'rtl')
- [ ] 10. index.css: Tailwind custom tilt utilities

### 🧪 Testing
- [ ] 11. Test notifications (immediate, daily, custom days)
- [ ] 12. Test backup/import full tree
- [ ] 13. Build APK: `eas build --platform android --profile preview`

**VS Code Commands:**
```
# Install (if needed)
npx expo install expo-document-picker expo-av

# Run
npx expo start --clear

# APK (free)
eas login
eas build --platform android --profile preview
```

