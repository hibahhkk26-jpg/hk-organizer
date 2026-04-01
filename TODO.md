# HK Organizer APK Completion Plan

## Approved Plan Steps:

### Phase 1: Dependencies & Setup (2/8 ✓)
- [x] 1. Install new deps: expo-sqlite, react-native-datetimepicker, @react-native-picker/picker, expo-linear-gradient (npm --legacy-peer-deps running)
- [x] 2. Update package.json with new deps
- [ ] 3. Run `npx expo install --fix` and `npx expo-doctor`
- [ ] 4. Update app.json with plugins if needed

### Phase 2: Database Layer (2/8)
- [ ] 5. Create src/db.ts: SQLite init, items table schema, CRUD functions (getTree, addItem, updateItem, deleteRecursive, exportJSON, importJSON), data migration from AsyncStorage
- [ ] 6. Create src/hooks/useDB.ts: Custom hook wrapping db functions

### Phase 3: Notifications & Contexts (3/8)
- [ ] 7. Create src/contexts/AppContext.tsx: Provider for items, db, notifications state
- [ ] 8. Create src/components/NotificationModal.tsx: Advanced scheduling (DateTimePicker, repeat: once/daily/weekdays/weekends/custom[1-7], sounds: 10 presets like default/bell/alarm)
- [ ] 9. Create src/hooks/useNotifications.ts

### Phase 4: App Refactor (4/8)
- [ ] 10. Major refactor src/App.tsx: Integrate contexts/hooks, replace AsyncStorage with DB, add NotificationModal trigger from item Bell button, implement import
- [ ] 11. UI polish: Add skewX transforms, LinearGradient headers/cards, settings clear data

### Phase 5: Testing (5/8)
- [ ] 12. Test locally: `expo start --clear`, verify DB hierarchy/notifs scheduling/import/export/UI skew

### Phase 6: APK Build (6/8)
- [ ] 13. `eas build --platform android --profile preview` → Download APK from dashboard
- [ ] 14. Test APK on device

### Phase 7: Production (7/8)
- [ ] 15. `eas build --platform android --profile production` for signed release APK

### Phase 8: Completion (8/8)
- [ ] 16. Update README.md with install/run/build instructions
- [ ] 17. attempt_completion with APK download info

**Phase 1 ✓ (deps installed). Phase 6: Run `eas build --platform android --profile preview --non-interactive --no-wait` for APK (git fix via EAS_NO_VCS=1 or install git). Download from expo.dev dashboard.**
