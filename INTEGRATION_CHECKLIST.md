# INTEGRASI BACKEND - QUICK CHECKLIST

**Duration**: 30-45 menit  
**Difficulty**: Medium  
**Prerequisites**: Node.js backend running on port 5000

---

## ✅ BACKEND SETUP (Already Done)

- [x] `server/data/menuConfig.json` - Menu configuration created
- [x] `server/services/menuService.js` - Menu service created
- [x] `server/controllers/menuController.js` - Menu controller created
- [x] `server/middleware/rbac.js` - RBAC middleware created
- [x] `server/routes/menu.js` - Menu routes created
- [x] `server/server.js` - Updated to include menu routes

**Verification**:
```bash
# Start backend
cd server
npm start

# Test menu API
curl -H "Authorization: Bearer {TOKEN}" http://localhost:5000/api/menus/health
# Should return: {"success":true,"message":"Menu service is running"}
```

---

## ✅ FRONTEND SETUP (Already Done)

- [x] `src/config/api.js` - API config created
- [x] `src/services/menuFetchService.js` - Menu fetch service created
- [x] `src/hooks/useMenuHooks.js` - Custom hooks created
- [x] `src/components/DynamicComponentRenderer.js` - Component renderer created
- [x] `src/components/DynamicRouteGenerator.js` - Route generator created
- [x] `src/components/DynamicSidebar.js` - Sidebar component created

---

## 📋 INTEGRATION CHECKLIST

### Phase 1: AppContext Update (5 menit)

**File**: `src/context/AppContext.js`

- [ ] Import `menuFetchService`
- [ ] Add `menus` state
- [ ] Add `menusLoading` state
- [ ] Add `menusError` state
- [ ] Add useEffect untuk fetch menus saat login
- [ ] Add `refetchMenus` function ke context value

**Code Template**:
```javascript
import menuFetchService from '../services/menuFetchService';

// Add to state
const [menus, setMenus] = useState(null);
const [menusLoading, setMenusLoading] = useState(true);
const [menusError, setMenusError] = useState(null);

// Add useEffect
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token && userProfile?.role) {
    menuFetchService.getAllMenus()
      .then(data => {
        setMenus(data);
        setMenusError(null);
      })
      .catch(err => {
        setMenusError(err.message);
      })
      .finally(() => {
        setMenusLoading(false);
      });
  }
}, [userProfile]);

// Add to value object
menus,
menusLoading,
menusError,
refetchMenus: () => menuFetchService.refreshAllMenus()
```

### Phase 2: LayoutAdmin Update (10 menit)

**File**: `src/Layout/LayoutAdmin.js`

- [ ] Import `DynamicSidebar`
- [ ] Import `useMenus`
- [ ] Replace hardcoded sidebar dengan `<DynamicSidebar variant="admin" />`
- [ ] Add sidebar toggle state
- [ ] Add error handling untuk menu loading

**Key Changes**:
```javascript
import DynamicSidebar from '../components/DynamicSidebar';
import { useMenus } from '../hooks/useMenuHooks';

// In component
const { menus, loading, error } = useMenus();
const [sidebarOpen, setSidebarOpen] = useState(true);

// In JSX
<DynamicSidebar 
  isOpen={sidebarOpen}
  variant="admin"
  onClose={() => setSidebarOpen(false)}
/>
```

### Phase 3: LayoutKaryawan Update (10 menit)

**File**: `src/Layout/LayoutKaryawan.js`

- [ ] Import `DynamicSidebar`
- [ ] Import `useMenus`
- [ ] Replace hardcoded sidebar dengan `<DynamicSidebar variant="karyawan" />`
- [ ] Add sidebar toggle state
- [ ] Add error handling

**Same structure as Phase 2 but with `variant="karyawan"`**

### Phase 4: Login Component Update (5 menit)

**File**: `src/Karyawan/Login.js` or similar

- [ ] After successful login, call `navigationService.setRole()`
- [ ] Ensure token stored in localStorage
- [ ] Let AppContext fetch menus automatically

**Code Template**:
```javascript
import navigationService from '../services/navigationService';

// After login success
navigationService.setRole(userData.role);
localStorage.setItem('token', token);
// Move to next page - AppContext will auto-fetch menus
```

### Phase 5: Add Missing Dependencies (2 menit)

**Check if installed**:
```bash
# In src/components/DynamicSidebar.js
npm list lucide-react
# Should be installed from previous work

# If not:
npm install lucide-react
```

### Phase 6: Test Frontend in Development (10 menit)

- [ ] `npm start` untuk run frontend
- [ ] Login dengan admin account
- [ ] Verify sidebar shows admin menus
- [ ] Click setiap menu - should navigate
- [ ] Open console - no errors
- [ ] Network tab - GET /api/menus returns correct data

**Test Cases**:
```javascript
// Test useMenus hook
import { useMenus } from './hooks/useMenuHooks';

function TestComponent() {
  const { menus, loading, error } = useMenus();
  return (
    <div>
      {loading ? 'Loading...' : JSON.stringify(menus)}
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

---

## 🔍 Verification Tests

### Test 1: Backend Menu API (5 menit)

```bash
# 1. Get auth token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@test.com","password":"testpass"}' \
  | jq -r '.data.token'
# Copy TOKEN value

# 2. Test menu API
curl http://localhost:5000/api/menus/health
# Expected: {"success":true,"message":"Menu service is running"}

# 3. Get menus with auth
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:5000/api/menus | jq
# Expected: Role-based menus in response
```

### Test 2: Frontend Hook in Console

```javascript
// In browser console
import menuFetchService from './services/menuFetchService'
menuFetchService.getAllMenus()
  .then(data => console.log('Menus:', data))
  .catch(err => console.error('Error:', err))
```

### Test 3: Sidebar Rendering

- [ ] Open browser DevTools
- [ ] Go to /admin
- [ ] Verify `<DynamicSidebar>` renders
- [ ] Menus populate from API response
- [ ] No hardcoded menu links visible

---

## 🚨 Common Issues & Solutions

### Issue 1: CORS Error
**Error**: `Access to XMLHttpRequest blocked by CORS policy`  
**Solution**:
```javascript
// Check server.js has CORS enabled
app.use(cors());

// Check API_URL in src/config/api.js
export const REACT_APP_API_URL = 'http://localhost:5000';
```

### Issue 2: Token Undefined
**Error**: `Authorization header missing`  
**Solution**:
```javascript
// Check localStorage has token nach login
localStorage.getItem('token') // Should not be null

// Check menuFetchService.getAuthHeaders()
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // Make sure token exists
};
```

### Issue 3: 401 Unauthorized
**Error**: `Token tidak valid`  
**Solution**:
1. Clear localStorage
2. Login again
3. Check JWT_SECRET in server/.env
4. Verify token hasn't expired

### Issue 4: Component Not Found
**Error**: `Component 'DashboardAdmin' not found in DynamicComponentRenderer`  
**Solution**:
1. Check component name in menuConfig.json
2. Verify component file exists in correct path
3. Add component to componentMap in DynamicComponentRenderer.js
4. Check import path is correct

### Issue 5: Menu Not Loading
**Error**: Sidebar blank or shows "Tidak ada menu"  
**Solution**:
1. Check /api/menus response in Network tab
2. Verify user has role in token
3. Verify role exists in menuConfig.json
4. Check permission flags in menuConfig.json

---

## ✨ Optional Enhancements

### 1. Add Loading Skeleton
```javascript
// In DynamicSidebar
{loading && (
  <div className="space-y-2">
    {[1,2,3,4].map(i => (
      <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
    ))}
  </div>
)}
```

### 2. Add Search in Menu
```javascript
// In DynamicSidebar
const [searchTerm, setSearchTerm] = useState('');
const filtered = menuMenus.filter(m => 
  m.label.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### 3. Add Menu Icons
Already implemented in DynamicSidebar using lucide-react!

### 4. Add Notifications
```javascript
// When menu is updated
menuFetchService.subscribe((menus) => {
  showNotification('Menu updated!');
});
```

---

## 📊 Progress Tracker

```
BACKEND SETUP
  ❌ menuConfig.json                  → ✅ DONE
  ❌ menuService.js                   → ✅ DONE
  ❌ menuController.js                → ✅ DONE
  ❌ rbac.js middleware               → ✅ DONE
  ❌ menu.js routes                   → ✅ DONE
  ❌ server.js integration            → ✅ DONE

FRONTEND SETUP
  ❌ api.js config                    → ✅ DONE
  ❌ menuFetchService.js              → ✅ DONE
  ❌ useMenuHooks.js                  → ✅ DONE
  ❌ DynamicComponentRenderer.js      → ✅ DONE
  ❌ DynamicRouteGenerator.js         → ✅ DONE
  ❌ DynamicSidebar.js                → ✅ DONE

INTEGRATION
  ❌ AppContext.js update             → ⏳ TODO
  ❌ LayoutAdmin.js update            → ⏳ TODO
  ❌ LayoutKaryawan.js update         → ⏳ TODO
  ❌ Login.js update                  → ⏳ TODO
  ❌ Test all features                → ⏳ TODO

OPTIMIZATION
  ❌ Performance testing              → ⏳ TODO
  ❌ Error handling review            → ⏳ TODO
  ❌ Security audit                   → ⏳ TODO
```

---

## 🎯 Success Criteria

Your integration is COMPLETE when:

1. ✅ Backend `/api/menus` endpoint returns role-based menus
2. ✅ Frontend `useMenus()` hook fetches menus successfully
3. ✅ `DynamicSidebar` renders without hardcoded links
4. ✅ Admin sees different menus than Karyawan
5. ✅ Permission checks work (e.g., karyawan can't see 'treatment')
6. ✅ Clicking menu navigates to correct page
7. ✅ Component renders dynamically based on backend config
8. ✅ No dummy data anywhere
9. ✅ All data from backend/database
10. ✅ Console has no errors

---

## 📞 Support

**Issues during integration?**

1. Check troubleshooting section above
2. Review BACKEND_INTEGRATED_SYSTEM.md
3. Check browser console for errors
4. Check server logs for API errors
5. Verify menuConfig.json syntax (JSON validator)

**Questions about architecture?**

Read: BACKEND_INTEGRATED_SYSTEM.md → "Arsitektur Lengkap"

**Need to add new menu?**

Edit: `server/data/menuConfig.json` → Add to appropriate role → Restart server → Frontend auto-updates!

---

**Last Updated**: February 7, 2026  
**Status**: Ready for Integration
